<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentService
{
  private const API = 'https://api.paystack.co';

  public function __construct(private RoomService $rooms)
  {
  }

  public function prices(): array
  {
    return config('gwam.room_prices_kobo');
  }

  /** @return ?array{url: string, reference: string} null if Paystack refused the request. */
  public function startRoomPurchase(User $user, array $data): ?array
  {
    $hours = (int) $data['duration_hours'];
    $amount = $this->prices()[$hours];
    $reference = 'gwam_' . Str::lower(Str::random(24));

    $payment = Payment::create([
      'user_id' => $user->id,
      'reference' => $reference,
      'amount_kobo' => $amount,
      'payload' => [
        'name' => $data['name'],
        'topic' => $data['topic'] ?? null,
        'password_hash' => $this->rooms->hashed($data['password'] ?? null), // never store the plain password
        'hours' => $hours,
      ],
    ]);

    $res = $this->paystack()->post(self::API . '/transaction/initialize', [
      'email' => $user->email,
      'amount' => $amount,
      'currency' => 'NGN',
      'reference' => $reference,
      'callback_url' => rtrim(config('gwam.app_url'), '/') . '/rooms/',
    ]);

    if (!$res->successful() || !$res->json('status')) {
      $payment->delete();

      return null;
    }

    return ['url' => $res->json('data.authorization_url'), 'reference' => $reference];
  }

  /**
   * Confirms the payment with Paystack and creates the room exactly once.
   * Safe to call from both the browser callback and the webhook.
   */
  public function finalize(string $reference): ?Payment
  {
    $payment = Payment::where('reference', $reference)->first();
    if (!$payment) {
      return null;
    }
    if ($payment->status === 'paid') {
      return $payment;
    }

    $res = $this->paystack()->get(self::API . '/transaction/verify/' . urlencode($reference));
    $paid = $res->successful()
      && $res->json('data.status') === 'success'
      && (int) $res->json('data.amount') === $payment->amount_kobo;

    return $paid ? $this->markPaid($payment->id) : $payment;
  }

  public function validSignature(string $rawBody, ?string $signature): bool
  {
    $secret = (string) config('gwam.paystack_secret');

    return $secret !== '' && $signature !== null
      && hash_equals(hash_hmac('sha512', $rawBody, $secret), $signature);
  }

  private function markPaid(int $id): Payment
  {
    return DB::transaction(function () use ($id) {
      $payment = Payment::lockForUpdate()->find($id);
      if ($payment->status === 'paid') {
        return $payment;
      }

      $p = $payment->payload;
      $room = $this->rooms->build($payment->user_id, $p['name'], $p['topic'], $p['password_hash'], $p['hours']);
      $payment->update(['status' => 'paid', 'paid_at' => now(), 'room_id' => $room->id]);

      return $payment;
    });
  }

  private function paystack()
  {
    return Http::withToken((string) config('gwam.paystack_secret'))->acceptJson()->timeout(15);
  }
}

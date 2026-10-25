<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
  public function __construct(private PaymentService $payments)
  {
  }

  public function pricing()
  {
    return $this->ok('Pricing.', ['currency' => 'NGN', 'room_kobo' => $this->payments->prices()]);
  }

  public function startRoom(Request $request)
  {
    $data = $this->check($request->all(), [
      'name' => 'required|string|max:100',
      'topic' => 'nullable|string|max:255',
      'password' => 'nullable|string|min:4',
      'duration_hours' => ['required', 'integer', Rule::in(array_keys($this->payments->prices()))],
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $checkout = $this->payments->startRoomPurchase($request->user(), $data);
    if (!$checkout) {
      return $this->fail('Could not start payment. Please try again.', 502);
    }

    return $this->ok('Payment started.', $checkout, 201);
  }

  // Browser callback: confirms with Paystack, so a forged reference can't create a room.
  public function verify(Request $request, string $reference)
  {
    $payment = Payment::where('reference', $reference)->where('user_id', $request->user()->id)->first();
    if (!$payment) {
      return $this->fail('Payment not found.', 404);
    }

    $payment = $this->payments->finalize($reference);

    return $this->ok('Payment status.', [
      'status' => $payment->status,
      'room_code' => $payment->room?->code,
    ]);
  }

  public function webhook(Request $request)
  {
    if (!$this->payments->validSignature($request->getContent(), $request->header('x-paystack-signature'))) {
      return $this->fail('Invalid signature.', 401);
    }

    if ($request->input('event') === 'charge.success' && $request->input('data.reference')) {
      $this->payments->finalize($request->input('data.reference'));
    }

    return $this->ok('OK.');
  }
}

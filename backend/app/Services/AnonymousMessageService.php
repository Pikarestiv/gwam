<?php

namespace App\Services;

use App\Mail\NewMessageMail;
use App\Models\Message;
use App\Models\Notification;
use App\Models\SenderInterest;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AnonymousMessageService
{
  public function deliver(User $recipient, string $content, bool $flagged, string $ip, string $userAgent): Message
  {
    $geo = $this->geolocate($ip);

    $message = Message::create([
      'recipient_id' => $recipient->id,
      'content' => $content,
      'is_flagged' => $flagged,
      'sender_token' => (string) Str::uuid(),
      'sender_ip' => $ip,
      'sender_country' => $geo['country'],
      'sender_city' => $geo['city'],
      'sender_device' => $this->detectDevice($userAgent),
      'sender_browser' => $this->detectBrowser($userAgent),
      'delete_scheduled_at' => now()->addMonths($recipient->message_retention_months),
    ]);

    // Flagged text is hidden from the inbox, so it must not leak through a preview either.
    if (!$flagged) {
      Notification::create([
        'user_id' => $recipient->id,
        'type' => 'message_received',
        'data' => ['message_id' => $message->id, 'preview' => Str::limit($content, 60)],
      ]);
      $this->emailRecipient($recipient);
    }

    return $message;
  }

  /** Only the sender (holder of sender_token) may attach a notification email to a message. */
  public function saveSenderInterest(int $messageId, string $senderToken, string $email): bool
  {
    $message = Message::where('id', $messageId)->where('sender_token', $senderToken)->first();
    if (!$message) {
      return false;
    }

    SenderInterest::updateOrCreate(['message_id' => $message->id], ['email' => $email]);

    return true;
  }

  // Throttled: 1 email per 10 min per user.
  private function emailRecipient(User $recipient): void
  {
    if (!Cache::add("msg_email:{$recipient->id}", true, 600)) {
      return;
    }

    try {
      Mail::to($recipient->email)->send(new NewMessageMail($recipient));
    } catch (\Exception $e) {
      Log::error('New message mail failed: ' . $e->getMessage());
    }
  }

  private function geolocate(string $ip): array
  {
    if ($ip === '127.0.0.1' || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.')) {
      return ['country' => 'Local', 'city' => 'Local'];
    }

    try {
      $data = Http::timeout(3)->get("http://ip-api.com/json/{$ip}?fields=country,city,status")->json();
      if (($data['status'] ?? '') === 'success') {
        return ['country' => $data['country'], 'city' => $data['city']];
      }
    } catch (\Exception $e) {
      Log::warning('Geolocation failed: ' . $e->getMessage());
    }

    return ['country' => null, 'city' => null];
  }

  private function detectDevice(string $ua): string
  {
    $ua = strtolower($ua);
    if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
      return 'tablet';
    }
    if (str_contains($ua, 'mobile') || str_contains($ua, 'android') || str_contains($ua, 'iphone')) {
      return 'mobile';
    }

    return 'desktop';
  }

  // Order matters: Edge/Opera UAs also contain "Chrome", and Chrome's contains "Safari".
  private function detectBrowser(string $ua): string
  {
    foreach (['Edg' => 'Edge', 'OPR' => 'Opera', 'Opera' => 'Opera', 'Firefox' => 'Firefox', 'Chrome' => 'Chrome', 'Safari' => 'Safari'] as $needle => $name) {
      if (str_contains($ua, $needle)) {
        return $name;
      }
    }

    return 'Unknown';
  }
}

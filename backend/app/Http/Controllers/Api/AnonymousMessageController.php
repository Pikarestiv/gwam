<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewMessageMail;
use App\Mail\MessageReadMail;
use App\Models\Message;
use App\Models\Notification;
use App\Models\SenderInterest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AnonymousMessageController extends Controller
{
  public function send(Request $request, string $username)
  {
    $recipient = User::where('username', $username)->first();

    if (!$recipient) {
      return response()->json([
        'success' => false,
        'message' => 'User not found.',
      ], 404);
    }

    if (!$recipient->inbox_active) {
      return response()->json([
        'success' => false,
        'message' => "@{$username} hasn't activated their inbox yet.",
      ], 403);
    }

    $validator = Validator::make($request->all(), [
      'content' => 'required|string|min:1|max:500',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    // Geo-locate sender
    $geo = $this->geolocate($request->ip());

    $message = Message::create([
      'recipient_id' => $recipient->id,
      'content' => $request->content,
      'is_flagged' => $request->boolean('is_flagged', false),
      'sender_token' => (string)Str::uuid(),
      'sender_ip' => $request->ip(),
      'sender_country' => $geo['country'] ?? null,
      'sender_city' => $geo['city'] ?? null,
      'sender_device' => $this->detectDevice($request->userAgent()),
      'sender_browser' => $this->detectBrowser($request->userAgent()),
      'delete_scheduled_at' => now()->addMonths($recipient->message_retention_months),
    ]);

    // Create in-app notification
    Notification::create([
      'user_id' => $recipient->id,
      'type' => 'message_received',
      'data' => [
        'message_id' => $message->id,
        'preview' => Str::limit($message->content, 60),
      ],
    ]);

    // Send email notification (throttled: 1 per 10 min per user)
    $emailKey = "msg_email:{$recipient->id}";
    if (!Cache::has($emailKey)) {
      Cache::put($emailKey, true, 600);
      try {
        Mail::to($recipient->email)->send(new NewMessageMail($recipient));
      }
      catch (\Exception $e) {
        \Log::error('New message mail failed: ' . $e->getMessage());
      }
    }

    return response()->json([
      'success' => true,
      'message' => 'Message delivered 👻',
      'data' => [
        'sender_token' => $message->sender_token,
        'message_id' => $message->id,
      ],
    ], 201);
  }

  public function saveSenderInterest(Request $request, int $messageId)
  {
    $validator = Validator::make($request->all(), [
      'email' => 'required|email',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $message = Message::findOrFail($messageId);

    SenderInterest::updateOrCreate(
    ['message_id' => $message->id],
    ['email' => $request->email]
    );

    return response()->json([
      'success' => true,
      'message' => "We'll notify you when your message is read.",
      'data' => [],
    ]);
  }

  public function viewReply(string $senderToken)
  {
    $message = Message::where('sender_token', $senderToken)->first();

    if (!$message) {
      return response()->json([
        'success' => false,
        'message' => 'Message not found.',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'message' => 'Reply retrieved.',
      'data' => [
        'has_reply' => !is_null($message->reply_text),
        'reply_text' => $message->reply_text,
        'replied_at' => $message->replied_at,
        'recipient_username' => $message->recipient->username,
      ],
    ]);
  }

  protected function geolocate(string $ip): array
  {
    if ($ip === '127.0.0.1' || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.')) {
      return ['country' => 'Local', 'city' => 'Local'];
    }

    try {
      $response = \Http::timeout(3)->get("http://ip-api.com/json/{$ip}?fields=country,city,status");
      $data = $response->json();
      if (($data['status'] ?? '') === 'success') {
        return ['country' => $data['country'], 'city' => $data['city']];
      }
    }
    catch (\Exception $e) {
      \Log::warning('Geolocation failed: ' . $e->getMessage());
    }

    return ['country' => null, 'city' => null];
  }

  protected function detectDevice(string $ua): string
  {
    $ua = strtolower($ua);
    if (str_contains($ua, 'mobile') || str_contains($ua, 'android') || str_contains($ua, 'iphone')) {
      return 'mobile';
    }
    if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  protected function detectBrowser(string $ua): string
  {
    if (str_contains($ua, 'Chrome'))
      return 'Chrome';
    if (str_contains($ua, 'Firefox'))
      return 'Firefox';
    if (str_contains($ua, 'Safari'))
      return 'Safari';
    if (str_contains($ua, 'Edge'))
      return 'Edge';
    if (str_contains($ua, 'Opera'))
      return 'Opera';
    return 'Unknown';
  }
}
<?php

namespace Tests\Feature;

use App\Models\BlockedIp;
use App\Models\Message;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GwamApiTest extends TestCase
{
  use RefreshDatabase;

  private function user(array $o = []): User
  {
    return User::create($o + [
      'name' => 'Ada', 'username' => 'ada', 'email' => 'ada@example.com',
      'password' => Hash::make('password123'), 'inbox_active' => true,
      'email_verified_at' => now(),
    ]);
  }

  public function test_previously_unloadable_endpoints_work(): void
  {
    $this->getJson('/api/v1/stats/public')->assertOk();
    $this->postJson('/api/v1/reports', ['reason' => 'spam'])->assertOk();
    $this->actingAs($this->user(), 'sanctum')->getJson('/api/v1/settings')->assertOk();
  }

  public function test_innocent_words_do_not_flag_or_block(): void
  {
    $this->user();
    $this->postJson('/api/v1/users/ada/messages', ['content' => "what's the room code for the episode?"])->assertCreated();

    $this->assertSame(0, BlockedIp::count());
    $this->assertFalse(Message::first()->is_flagged);
  }

  public function test_three_flags_in_window_block_the_ip_temporarily(): void
  {
    Cache::flush();
    $this->user();
    foreach (range(1, 3) as $i) {
      $this->postJson('/api/v1/users/ada/messages', ['content' => 'go kill yourself'], ['REMOTE_ADDR' => '9.9.9.9']);
      $this->flushSession();
    }

    $this->assertNotNull(BlockedIp::first()->expires_at);
    BlockedIp::query()->update(['expires_at' => now()->subMinute()]);
    $this->postJson('/api/v1/users/ada/messages', ['content' => 'hello'])->assertCreated();
  }

  public function test_flagged_message_creates_no_notification(): void
  {
    $user = $this->user();
    $this->postJson('/api/v1/users/ada/messages', ['content' => 'you should die'])->assertCreated();

    $this->assertSame(0, $user->fresh()->notifications()->count());
  }

  public function test_room_password_is_enforced_for_reading_and_posting(): void
  {
    $owner = $this->user();
    $room = Room::create([
      'owner_id' => $owner->id, 'name' => 'Secret', 'password_hash' => Hash::make('hunter22'),
      'expires_at' => now()->addDay(),
    ]);

    $this->getJson("/api/v1/rooms/{$room->code}")->assertForbidden()->assertJsonPath('data.requires_password', true);
    $this->getJson("/api/v1/rooms/{$room->code}", ['X-Room-Password' => 'hunter22'])->assertOk()
      ->assertJsonMissingPath('data.room.password_hash');

    $body = ['content' => 'hi', 'session_token' => 'tok-1'];
    $this->postJson("/api/v1/rooms/{$room->code}/messages", $body)->assertForbidden();
    $this->postJson("/api/v1/rooms/{$room->code}/messages", $body, ['X-Room-Password' => 'hunter22'])->assertCreated();

    $res = $this->getJson("/api/v1/rooms/{$room->code}", ['X-Room-Password' => 'hunter22', 'X-Session-Token' => 'tok-1']);
    $res->assertJsonPath('data.messages.0.is_mine', true)->assertJsonMissingPath('data.messages.0.session_token');
  }

  public function test_sender_interest_requires_the_sender_token(): void
  {
    $this->user();
    $sent = $this->postJson('/api/v1/users/ada/messages', ['content' => 'hello'])->json('data');

    $url = "/api/v1/messages/{$sent['message_id']}/sender-interest";
    $this->postJson($url, ['email' => 'x@y.com'])->assertStatus(422);
    $this->postJson($url, ['email' => 'x@y.com', 'sender_token' => 'wrong'])->assertNotFound();
    $this->postJson($url, ['email' => 'x@y.com', 'sender_token' => $sent['sender_token']])->assertOk();
  }

  public function test_suspending_revokes_tokens_and_hides_inbox(): void
  {
    $user = $this->user();
    $user->createToken('t');
    $user->tokens()->delete();
    $user->update(['is_suspended' => true]);

    $this->postJson('/api/v1/users/ada/messages', ['content' => 'hello'])->assertNotFound();
  }

  public function test_forgot_password_does_not_reveal_accounts(): void
  {
    $this->postJson('/api/v1/auth/forgot-password', ['email' => 'nobody@example.com'])->assertOk();
  }

  public function test_inbox_prompt_is_public_and_updatable(): void
  {
    $user = $this->user();
    $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', ['prompt' => 'Rate my fit'])
      ->assertOk()->assertJsonPath('data.prompt', 'Rate my fit');
    $this->getJson('/api/v1/users/ada/profile')->assertJsonPath('data.prompt', 'Rate my fit');
  }

  public function test_events_accept_only_known_names(): void
  {
    $this->postJson('/api/v1/events', ['name' => 'pageview', 'path' => '/u/[username]', 'session' => 's1'])->assertCreated();
    $this->postJson('/api/v1/events', ['name' => 'evil', 'session' => 's1'])->assertStatus(422);
  }

  public function test_paid_room_is_created_once_after_verified_payment(): void
  {
    config(['gwam.paystack_secret' => 'sk_test']);
    $user = $this->user();
    Http::fake([
      'api.paystack.co/transaction/initialize' => Http::response(['status' => true, 'data' => ['authorization_url' => 'https://pay.test/x']]),
      'api.paystack.co/transaction/verify/*' => fn($r) => Http::response(['data' => ['status' => 'success', 'amount' => 50000]]),
    ]);

    $start = $this->actingAs($user, 'sanctum')->postJson('/api/v1/payments/rooms', ['name' => 'Long', 'duration_hours' => 72])
      ->assertCreated()->json('data');
    $this->assertSame(0, Room::count());

    $payload = json_encode(['event' => 'charge.success', 'data' => ['reference' => $start['reference']]]);
    $this->call('POST', '/api/v1/webhooks/paystack', [], [], [], ['HTTP_X_PAYSTACK_SIGNATURE' => 'bad', 'CONTENT_TYPE' => 'application/json'], $payload)->assertUnauthorized();

    $sig = hash_hmac('sha512', $payload, 'sk_test');
    foreach ([1, 2] as $_) { // webhook retries must not create a second room
      $this->call('POST', '/api/v1/webhooks/paystack', [], [], [], ['HTTP_X_PAYSTACK_SIGNATURE' => $sig, 'CONTENT_TYPE' => 'application/json'], $payload)->assertOk();
    }
    $this->assertSame(1, Room::count());
    $this->actingAs($user, 'sanctum')->getJson("/api/v1/payments/{$start['reference']}")->assertJsonPath('data.status', 'paid');
  }

  public function test_wrong_amount_does_not_unlock_the_room(): void
  {
    config(['gwam.paystack_secret' => 'sk_test']);
    $user = $this->user();
    Http::fake([
      'api.paystack.co/transaction/initialize' => Http::response(['status' => true, 'data' => ['authorization_url' => 'https://pay.test/x']]),
      'api.paystack.co/transaction/verify/*' => Http::response(['data' => ['status' => 'success', 'amount' => 100]]),
    ]);

    $ref = $this->actingAs($user, 'sanctum')->postJson('/api/v1/payments/rooms', ['name' => 'Long', 'duration_hours' => 72])->json('data.reference');
    $this->actingAs($user, 'sanctum')->getJson("/api/v1/payments/{$ref}")->assertJsonPath('data.status', 'pending');
    $this->assertSame(0, Room::count());
  }

  public function test_push_subscription_roundtrip_and_delivery_never_throws(): void
  {
    $user = $this->user();
    $sub = ['endpoint' => 'https://push.example/abc', 'keys' => ['p256dh' => 'k', 'auth' => 'a']];

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/push/subscribe', $sub)->assertCreated();
    $this->assertSame(1, $user->pushSubscriptions()->count());

    // No VAPID keys configured: delivery is a silent no-op, so sending a message still succeeds.
    $this->postJson('/api/v1/users/ada/messages', ['content' => 'hello'])->assertCreated();

    $this->actingAs($user, 'sanctum')->deleteJson('/api/v1/push/subscribe', ['endpoint' => $sub['endpoint']])->assertOk();
    $this->assertSame(0, $user->pushSubscriptions()->count());
  }
}

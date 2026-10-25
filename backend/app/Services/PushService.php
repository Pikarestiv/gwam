<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class PushService
{
  public function publicKey(): ?string
  {
    return config('gwam.vapid.public');
  }

  public function subscribe(User $user, string $endpoint, string $p256dh, string $auth): void
  {
    PushSubscription::updateOrCreate(
      ['endpoint_hash' => hash('sha256', $endpoint)],
      ['user_id' => $user->id, 'endpoint' => $endpoint, 'p256dh' => $p256dh, 'auth' => $auth],
    );
  }

  public function unsubscribe(User $user, string $endpoint): void
  {
    PushSubscription::where('user_id', $user->id)->where('endpoint_hash', hash('sha256', $endpoint))->delete();
  }

  /** Never throws: a failed push must not fail the request that triggered it. */
  public function notify(User $user, string $title, string $body, string $url): void
  {
    $vapid = config('gwam.vapid');
    $subs = $user->pushSubscriptions;
    if (!$vapid['public'] || !$vapid['private'] || $subs->isEmpty()) {
      return;
    }

    try {
      $push = new WebPush(['VAPID' => [
        'subject' => $vapid['subject'], 'publicKey' => $vapid['public'], 'privateKey' => $vapid['private'],
      ]]);
      $payload = json_encode(['title' => $title, 'body' => $body, 'url' => $url]);

      foreach ($subs as $s) {
        $push->queueNotification(Subscription::create([
          'endpoint' => $s->endpoint, 'keys' => ['p256dh' => $s->p256dh, 'auth' => $s->auth],
        ]), $payload);
      }

      foreach ($push->flush() as $report) {
        // 404/410 mean the browser dropped the subscription.
        if ($report->isSubscriptionExpired()) {
          PushSubscription::where('endpoint_hash', hash('sha256', $report->getEndpoint()))->delete();
        }
      }
    } catch (\Throwable $e) {
      Log::warning('Web push failed: ' . $e->getMessage());
    }
  }
}

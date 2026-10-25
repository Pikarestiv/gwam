<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\PushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushController extends Controller
{
  public function __construct(private PushService $push)
  {
  }

  public function key()
  {
    return $this->ok('Push key.', ['public_key' => $this->push->publicKey()]);
  }

  public function subscribe(Request $request)
  {
    $data = $this->check($request->all(), [
      'endpoint' => 'required|url|max:1000',
      'keys.p256dh' => 'required|string|max:255',
      'keys.auth' => 'required|string|max:255',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $this->push->subscribe($request->user(), $data['endpoint'], $data['keys']['p256dh'], $data['keys']['auth']);

    return $this->ok('Notifications enabled.', [], 201);
  }

  public function unsubscribe(Request $request)
  {
    $data = $this->check($request->all(), ['endpoint' => 'required|url|max:1000']);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $this->push->unsubscribe($request->user(), $data['endpoint']);

    return $this->ok('Notifications disabled.');
  }
}

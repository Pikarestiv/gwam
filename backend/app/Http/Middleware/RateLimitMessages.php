<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RateLimitMessages
{
  // 5 messages per IP per hour per recipient
  protected int $maxMessages = 5;
  protected int $decaySeconds = 3600;

  public function handle(Request $request, Closure $next)
  {
    $username = $request->route('username');
    $ip = $request->ip();
    $key = "msg_rate:{$ip}:{$username}";

    $count = Cache::get($key, 0);

    if ($count >= $this->maxMessages) {
      return response()->json([
        'success' => false,
        'message' => 'You\'ve sent too many messages. Please try again later.',
      ], 429);
    }

    Cache::put($key, $count + 1, $this->decaySeconds);

    return $next($request);
  }
}
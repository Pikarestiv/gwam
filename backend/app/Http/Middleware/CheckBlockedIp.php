<?php

namespace App\Http\Middleware;

use App\Services\BlockedIpService;
use Closure;
use Illuminate\Http\Request;

class CheckBlockedIp
{
  public function __construct(private BlockedIpService $blockedIps)
  {
  }

  public function handle(Request $request, Closure $next)
  {
    if ($this->blockedIps->isBlocked($request->ip())) {
      return response()->json([
        'success' => false,
        'message' => 'Your IP has been blocked due to policy violations.',
      ], 403);
    }

    return $next($request);
  }
}

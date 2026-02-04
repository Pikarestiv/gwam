<?php

namespace App\Http\Middleware;

use App\Models\BlockedIp;
use Closure;
use Illuminate\Http\Request;

class CheckBlockedIp
{
  public function handle(Request $request, Closure $next)
  {
    $ip = $request->ip();

    if (BlockedIp::where('ip_address', $ip)->exists()) {
      return response()->json([
        'success' => false,
        'message' => 'Your IP has been blocked due to policy violations.',
      ], 403);
    }

    return $next($request);
  }
}
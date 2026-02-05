<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifiedOnly
{
  public function handle(Request $request, Closure $next)
  {
    $user = $request->user();

    if (!$user || !$user->inbox_active) {
      return response()->json([
        'success' => false,
        'message' => 'Please verify your email to access this feature.',
      ], 403);
    }

    return $next($request);
  }
}
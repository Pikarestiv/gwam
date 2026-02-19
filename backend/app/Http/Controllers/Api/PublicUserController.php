<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NudgeMail;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class PublicUserController extends Controller
{
  public function profile(string $username)
  {
    $user = User::where('username', $username)->first();

    if (!$user) {
      return response()->json([
        'success' => false,
        'message' => 'User not found.',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'message' => 'Profile retrieved.',
      'data' => [
        'name' => $user->name,
        'username' => $user->username,
        'avatar_seed' => $user->avatar_seed,
        'bio' => $user->bio,
        'inbox_active' => $user->inbox_active,
      ],
    ]);
  }

  public function nudge(string $username)
  {
    $user = User::where('username', $username)->first();

    if (!$user) {
      return response()->json(['success' => false, 'message' => 'User not found.'], 404);
    }

    if ($user->inbox_active) {
      return response()->json(['success' => false, 'message' => 'Inbox is already active.'], 422);
    }

    // Rate limit: 1 nudge per IP per user per hour
    $key = 'nudge:' . request()->ip() . ':' . $user->id;
    if (RateLimiter::tooManyAttempts($key, 1)) {
      return response()->json([
        'success' => false,
        'message' => 'You already nudged them recently. Try again later.',
      ], 429);
    }
    RateLimiter::hit($key, 3600);

    try {
      Mail::to($user->email)->send(new NudgeMail($user));
    }
    catch (\Exception $e) {
      Log::error('Nudge mail failed: ' . $e->getMessage());
    }

    return response()->json(['success' => true, 'message' => 'Nudge sent!']);
  }
}
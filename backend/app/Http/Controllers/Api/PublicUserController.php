<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
}
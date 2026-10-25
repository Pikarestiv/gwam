<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
  public function __construct(private AuthService $auth)
  {
  }

  public function show(Request $request)
  {
    $user = $request->user();

    return $this->ok('Profile retrieved.', [
      'id' => $user->id,
      'name' => $user->name,
      'username' => $user->username,
      'email' => $user->email,
      'avatar_seed' => $user->avatar_seed,
      'bio' => $user->bio,
      'prompt' => $user->prompt,
      'inbox_active' => $user->inbox_active,
      'is_verified' => $user->isVerified(),
    ]);
  }

  public function update(Request $request)
  {
    $data = $this->check($request->all(), [
      'name' => 'sometimes|string|max:100',
      'bio' => 'sometimes|nullable|string|max:200',
      'prompt' => 'sometimes|nullable|string|max:120',
      'avatar_seed' => 'sometimes|string|max:100',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $user = $request->user();
    $user->update($data);

    // The client stores this as the current user, so it must be the full user shape.
    return $this->ok('Profile updated.', $this->auth->formatUser($user->refresh()));
  }
}

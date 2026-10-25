<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
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
      'inbox_active' => $user->inbox_active,
      'is_verified' => $user->isVerified(),
    ]);
  }

  public function update(Request $request)
  {
    $data = $this->check($request->all(), [
      'name' => 'sometimes|string|max:100',
      'bio' => 'sometimes|nullable|string|max:200',
      'avatar_seed' => 'sometimes|string|max:100',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $request->user()->update($data);

    return $this->ok('Profile updated.');
  }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
  public function show(Request $request)
  {
    $user = $request->user();

    return $this->ok('Settings retrieved.', [
      'theme_preference' => $user->theme_preference,
      'message_retention_months' => $user->message_retention_months,
      'bio' => $user->bio,
    ]);
  }

  public function update(Request $request)
  {
    $data = $this->check($request->all(), [
      'theme_preference' => 'sometimes|in:gwam_dark,neon_magenta,soft_dark',
      'message_retention_months' => 'sometimes|in:1,3,6,12',
      'bio' => 'sometimes|nullable|string|max:200',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $request->user()->update($data);

    return $this->ok('Settings updated.');
  }
}

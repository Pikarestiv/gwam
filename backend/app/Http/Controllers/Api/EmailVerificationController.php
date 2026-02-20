<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerificationOtpMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class EmailVerificationController extends Controller
{
  public function verify(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'otp' => 'required|string|size:6',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $user = $request->user();

    if ($user->inbox_active) {
      return response()->json([
        'success' => true,
        'message' => 'Email already verified.',
        'data' => [],
      ]);
    }

    $record = \DB::table('email_verification_tokens')
      ->where('user_id', $user->id)
      ->where('token', $request->otp)
      ->first();

    if (!$record) {
      return response()->json([
        'success' => false,
        'message' => 'Invalid OTP.',
        'errors' => ['otp' => ['The code you entered is incorrect.']],
      ], 422);
    }

    if (now()->isAfter($record->expires_at)) {
      return response()->json([
        'success' => false,
        'message' => 'OTP has expired. Please request a new one.',
        'errors' => ['otp' => ['OTP expired.']],
      ], 422);
    }

    $user->update([
      'email_verified_at' => now(),
      'inbox_active' => true,
    ]);

    \DB::table('email_verification_tokens')->where('user_id', $user->id)->delete();

    $user->refresh();

    return response()->json([
      'success' => true,
      'message' => 'Email verified! Your Gwam inbox is now active.',
      'data' => [
        'user' => [
          'id' => $user->id,
          'name' => $user->name,
          'username' => $user->username,
          'email' => $user->email,
          'avatar_seed' => $user->avatar_seed,
          'bio' => $user->bio,
          'inbox_active' => $user->inbox_active,
          'is_verified' => $user->isVerified(),
          'theme_preference' => $user->theme_preference,
          'message_retention_months' => $user->message_retention_months,
          'created_at' => $user->created_at,
        ],
      ],
    ]);
  }

  public function resend(Request $request)
  {
    $user = $request->user();

    if ($user->inbox_active) {
      return response()->json([
        'success' => false,
        'message' => 'Email is already verified.',
      ], 400);
    }

    // Rate limit resend: once per 2 minutes
    $existing = \DB::table('email_verification_tokens')
      ->where('user_id', $user->id)
      ->first();

    if ($existing && now()->diffInSeconds($existing->updated_at) < 120) {
      return response()->json([
        'success' => false,
        'message' => 'Please wait before requesting another code.',
      ], 429);
    }

    // Reuse existing OTP if still valid, otherwise generate new one
    if ($existing && now()->isBefore($existing->expires_at)) {
      $otp = $existing->token;
      // Update the timestamp so rate limit works correctly
      \DB::table('email_verification_tokens')
        ->where('user_id', $user->id)
        ->update(['updated_at' => now()]);
    }
    else {
      $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
      \DB::table('email_verification_tokens')->updateOrInsert(
      ['user_id' => $user->id],
      ['token' => $otp, 'expires_at' => now()->addMinutes(10), 'created_at' => now(), 'updated_at' => now()]
      );
    }

    try {
      Mail::to($user->email)->send(new VerificationOtpMail($otp, $user->name));
    }
    catch (\Exception $e) {
      Log::error('OTP resend failed: ' . $e->getMessage());
    }

    return response()->json([
      'success' => true,
      'message' => 'Verification code sent to ' . $user->email,
      'data' => [],
    ]);
  }
}
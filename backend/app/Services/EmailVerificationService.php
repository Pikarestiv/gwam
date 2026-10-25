<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class EmailVerificationService
{
  public function __construct(private AuthService $auth)
  {
  }

  /** @return ?string error message, null on success */
  public function verify(User $user, string $otp): ?string
  {
    $record = DB::table('email_verification_tokens')
      ->where('user_id', $user->id)
      ->where('token', $otp)
      ->first();

    if (!$record) {
      return 'The code you entered is incorrect.';
    }
    if (now()->isAfter($record->expires_at)) {
      return 'OTP expired.';
    }

    $user->update(['email_verified_at' => now(), 'inbox_active' => true]);
    DB::table('email_verification_tokens')->where('user_id', $user->id)->delete();

    return null;
  }

  /** Once per 2 minutes; returns false when throttled. */
  public function resend(User $user): bool
  {
    $existing = DB::table('email_verification_tokens')->where('user_id', $user->id)->first();

    if ($existing && now()->diffInSeconds($existing->updated_at) < 120) {
      return false;
    }

    if ($existing && now()->isBefore($existing->expires_at)) {
      DB::table('email_verification_tokens')->where('user_id', $user->id)->update(['updated_at' => now()]);
      $this->auth->mailOtp($user, $existing->token);
    } else {
      $this->auth->sendVerificationOtp($user, 10);
    }

    return true;
  }
}

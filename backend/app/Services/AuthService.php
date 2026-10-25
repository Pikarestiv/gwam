<?php

namespace App\Services;

use App\Mail\PasswordResetMail;
use App\Mail\VerificationOtpMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthService
{
  public function register(array $data): array
  {
    $user = User::create([
      'name' => $data['name'],
      'username' => strtolower($data['username']),
      'email' => strtolower($data['email']),
      'password' => Hash::make($data['password']),
      'avatar_seed' => $data['username'],
      'inbox_active' => false,
    ]);

    $this->sendVerificationOtp($user);

    return [$user, $user->createToken('gwam-app')->plainTextToken];
  }

  /** @return array{0: ?User, 1: ?string} [user, error] — error is 'invalid' or 'suspended'. */
  public function login(string $email, string $password): array
  {
    $user = User::where('email', strtolower($email))->first();

    if (!$user || !Hash::check($password, $user->password)) {
      return [null, 'invalid'];
    }
    if ($user->is_suspended) {
      return [null, 'suspended'];
    }

    $user->update(['last_login_at' => now()]);

    return [$user, null];
  }

  /** Silent for unknown emails so the endpoint can't be used to enumerate accounts. */
  public function forgotPassword(string $email): void
  {
    $email = strtolower($email);
    if (!User::where('email', $email)->exists()) {
      return;
    }

    $token = Str::random(64);
    DB::table('password_reset_tokens')->updateOrInsert(
      ['email' => $email],
      ['token' => Hash::make($token), 'created_at' => now()],
    );

    try {
      Mail::to($email)->send(new PasswordResetMail($token, $email));
    } catch (\Exception $e) {
      Log::error('Password reset mail failed: ' . $e->getMessage());
    }
  }

  /** @return ?string error message, null on success */
  public function resetPassword(string $email, string $token, string $password): ?string
  {
    $email = strtolower($email);
    $record = DB::table('password_reset_tokens')->where('email', $email)->first();
    $user = User::where('email', $email)->first();

    if (!$record || !$user || !Hash::check($token, $record->token)) {
      return 'Invalid or expired reset token.';
    }
    if (now()->diffInMinutes($record->created_at) > 60) {
      return 'Reset token has expired. Please request a new one.';
    }

    $user->update(['password' => Hash::make($password)]);
    $user->tokens()->delete(); // a reset must end any session the old password opened
    DB::table('password_reset_tokens')->where('email', $email)->delete();

    return null;
  }

  public function sendVerificationOtp(User $user, int $minutes = 30): void
  {
    $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    DB::table('email_verification_tokens')->updateOrInsert(
      ['user_id' => $user->id],
      ['token' => $otp, 'expires_at' => now()->addMinutes($minutes), 'created_at' => now(), 'updated_at' => now()],
    );

    $this->mailOtp($user, $otp);
  }

  public function mailOtp(User $user, string $otp): void
  {
    try {
      Mail::to($user->email)->send(new VerificationOtpMail($otp, $user->name));
    } catch (\Exception $e) {
      Log::error('OTP mail failed: ' . $e->getMessage());
    }
  }

  public function formatUser(User $user): array
  {
    return [
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
    ];
  }
}

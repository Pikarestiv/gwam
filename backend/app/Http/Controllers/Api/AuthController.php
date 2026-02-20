<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerificationOtpMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
  public function register(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:100',
      'username' => 'required|string|max:30|unique:users|regex:/^[a-z0-9_]+$/',
      'email' => 'required|email|unique:users',
      'password' => 'required|string|min:8|confirmed',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $user = User::create([
      'name' => $request->name,
      'username' => strtolower($request->username),
      'email' => strtolower($request->email),
      'password' => Hash::make($request->password),
      'avatar_seed' => $request->username,
      'inbox_active' => false,
    ]);

    // Send OTP verification email
    $this->sendVerificationOtp($user);

    $token = $user->createToken('gwam-app')->plainTextToken;

    return response()->json([
      'success' => true,
      'message' => 'Account created! Please verify your email.',
      'data' => [
        'user' => $this->formatUser($user),
        'token' => $token,
      ],
    ], 201);
  }

  public function login(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'email' => 'required|email',
      'password' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $user = User::where('email', strtolower($request->email))->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
      return response()->json([
        'success' => false,
        'message' => 'Invalid email or password.',
        'errors' => ['email' => ['Invalid credentials.']],
      ], 401);
    }

    if ($user->is_suspended) {
      return response()->json([
        'success' => false,
        'message' => 'Your account has been suspended. Contact support.',
      ], 403);
    }

    $user->update(['last_login_at' => now()]);
    $token = $user->createToken('gwam-app')->plainTextToken;

    return response()->json([
      'success' => true,
      'message' => 'Logged in successfully.',
      'data' => [
        'user' => $this->formatUser($user),
        'token' => $token,
      ],
    ]);
  }

  public function logout(Request $request)
  {
    $request->user()->currentAccessToken()->delete();

    return response()->json([
      'success' => true,
      'message' => 'Logged out successfully.',
      'data' => [],
    ]);
  }

  public function me(Request $request)
  {
    return response()->json([
      'success' => true,
      'message' => 'User retrieved.',
      'data' => $this->formatUser($request->user()),
    ]);
  }

  public function forgotPassword(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'email' => 'required|email|exists:users,email',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $token = Str::random(64);
    \DB::table('password_reset_tokens')->updateOrInsert(
    ['email' => $request->email],
    ['token' => Hash::make($token), 'created_at' => now()]
    );

    // Send password reset email
    try {
      Mail::to($request->email)->send(new \App\Mail\PasswordResetMail($token, $request->email));
    }
    catch (\Exception $e) {
      \Log::error('Password reset mail failed: ' . $e->getMessage());
    }

    return response()->json([
      'success' => true,
      'message' => 'Password reset link sent to your email.',
      'data' => [],
    ]);
  }

  public function resetPassword(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'email' => 'required|email|exists:users,email',
      'token' => 'required|string',
      'password' => 'required|string|min:8|confirmed',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $record = \DB::table('password_reset_tokens')
      ->where('email', $request->email)
      ->first();

    if (!$record || !Hash::check($request->token, $record->token)) {
      return response()->json([
        'success' => false,
        'message' => 'Invalid or expired reset token.',
        'errors' => ['token' => ['Invalid or expired token.']],
      ], 422);
    }

    // Check expiry (1 hour)
    if (now()->diffInMinutes($record->created_at) > 60) {
      return response()->json([
        'success' => false,
        'message' => 'Reset token has expired. Please request a new one.',
      ], 422);
    }

    User::where('email', $request->email)->update([
      'password' => Hash::make($request->password),
    ]);

    \DB::table('password_reset_tokens')->where('email', $request->email)->delete();

    return response()->json([
      'success' => true,
      'message' => 'Password reset successfully. You can now log in.',
      'data' => [],
    ]);
  }

  protected function sendVerificationOtp(User $user): void
  {
    $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    \DB::table('email_verification_tokens')->updateOrInsert(
    ['user_id' => $user->id],
    ['token' => $otp, 'expires_at' => now()->addMinutes(30), 'created_at' => now(), 'updated_at' => now()]
    );

    try {
      Mail::to($user->email)->send(new VerificationOtpMail($otp, $user->name));
    }
    catch (\Exception $e) {
      \Log::error('OTP mail failed: ' . $e->getMessage());
    }
  }

  protected function formatUser(User $user): array
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
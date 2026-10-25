<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Services\EmailVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
  public function __construct(private EmailVerificationService $verification, private AuthService $auth)
  {
  }

  public function verify(Request $request)
  {
    $data = $this->check($request->all(), ['otp' => 'required|string|size:6']);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $user = $request->user();

    if ($user->inbox_active) {
      return $this->ok('Email already verified.');
    }

    $error = $this->verification->verify($user, $data['otp']);
    if ($error) {
      return $this->fail($error === 'OTP expired.' ? 'OTP has expired. Please request a new one.' : 'Invalid OTP.', 422, [
        'errors' => ['otp' => [$error]],
      ]);
    }

    return $this->ok('Email verified! Your Gwam inbox is now active.', [
      'user' => $this->auth->formatUser($user->refresh()),
    ]);
  }

  public function resend(Request $request)
  {
    $user = $request->user();

    if ($user->inbox_active) {
      return $this->fail('Email is already verified.', 400);
    }
    if (!$this->verification->resend($user)) {
      return $this->fail('Please wait before requesting another code.', 429);
    }

    return $this->ok('Verification code sent to ' . $user->email);
  }
}

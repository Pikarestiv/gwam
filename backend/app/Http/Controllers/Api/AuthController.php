<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
  public function __construct(private AuthService $auth)
  {
  }

  public function register(Request $request)
  {
    $data = $this->check($request->all(), [
      'name' => 'required|string|max:100',
      'username' => 'required|string|max:30|unique:users|regex:/^[a-z0-9_]+$/',
      'email' => 'required|email|unique:users',
      'password' => 'required|string|min:8|confirmed',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    [$user, $token] = $this->auth->register($data);

    return $this->ok('Account created! Please verify your email.', [
      'user' => $this->auth->formatUser($user),
      'token' => $token,
    ], 201);
  }

  public function login(Request $request)
  {
    $data = $this->check($request->all(), ['email' => 'required|email', 'password' => 'required|string']);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    [$user, $error] = $this->auth->login($data['email'], $data['password']);

    if ($error === 'suspended') {
      return $this->fail('Your account has been suspended. Contact support.', 403);
    }
    if (!$user) {
      return $this->fail('Invalid email or password.', 401, ['errors' => ['email' => ['Invalid credentials.']]]);
    }

    return $this->ok('Logged in successfully.', [
      'user' => $this->auth->formatUser($user),
      'token' => $user->createToken('gwam-app')->plainTextToken,
    ]);
  }

  public function logout(Request $request)
  {
    $request->user()->currentAccessToken()->delete();

    return $this->ok('Logged out successfully.');
  }

  public function me(Request $request)
  {
    return $this->ok('User retrieved.', $this->auth->formatUser($request->user()));
  }

  public function forgotPassword(Request $request)
  {
    $data = $this->check($request->all(), ['email' => 'required|email']);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $this->auth->forgotPassword($data['email']);

    return $this->ok('If that email is registered, a reset link has been sent.');
  }

  public function resetPassword(Request $request)
  {
    $data = $this->check($request->all(), [
      'email' => 'required|email',
      'token' => 'required|string',
      'password' => 'required|string|min:8|confirmed',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $error = $this->auth->resetPassword($data['email'], $data['token'], $data['password']);
    if ($error) {
      return $this->fail($error, 422, ['errors' => ['token' => ['Invalid or expired token.']]]);
    }

    return $this->ok('Password reset successfully. You can now log in.');
  }
}

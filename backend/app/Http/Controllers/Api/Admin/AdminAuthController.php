<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminAuthController extends Controller
{
  public function login(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'email' => 'required|email',
      'password' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json(['success' => false, 'message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
    }

    $admin = Admin::where('email', $request->email)->first();

    if (!$admin || !Hash::check($request->password, $admin->password)) {
      return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
    }

    $admin->update(['last_login_at' => now()]);
    $token = $admin->createToken('gwam-admin')->plainTextToken;

    return response()->json([
      'success' => true,
      'message' => 'Admin logged in.',
      'data' => ['admin' => ['id' => $admin->id, 'name' => $admin->name, 'email' => $admin->email, 'role' => $admin->role], 'token' => $token],
    ]);
  }

  public function logout(Request $request)
  {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['success' => true, 'message' => 'Logged out.', 'data' => []]);
  }

  public function me(Request $request)
  {
    return response()->json([
      'success' => true,
      'message' => 'Admin details.',
      'data' => $request->user(),
    ]);
  }
}
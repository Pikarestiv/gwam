<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
  public function index(Request $request)
  {
    $query = User::query();
    if ($request->search) {
      $query->where(fn($q) => $q->where('username', 'like', "%{$request->search}%")->orWhere('email', 'like', "%{$request->search}%"));
    }
    if ($request->has('verified')) {
      $query->whereNotNull($request->verified ? 'email_verified_at' : null);
    }
    $users = $query->orderByDesc('created_at')->paginate(25);
    return response()->json(['success' => true, 'message' => 'Users retrieved.', 'data' => $users]);
  }

  public function show(int $id)
  {
    $user = User::withCount(['messages', 'rooms'])->findOrFail($id);
    return response()->json(['success' => true, 'message' => 'User retrieved.', 'data' => $user]);
  }

  public function suspend(Request $request, int $id)
  {
    $validator = Validator::make($request->all(), ['reason' => 'required|string|max:500']);
    if ($validator->fails())
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    User::findOrFail($id)->update(['is_suspended' => true, 'suspended_reason' => $request->reason, 'suspended_at' => now()]);
    return response()->json(['success' => true, 'message' => 'User suspended.', 'data' => []]);
  }

  public function unsuspend(int $id)
  {
    User::findOrFail($id)->update(['is_suspended' => false, 'suspended_reason' => null, 'suspended_at' => null]);
    return response()->json(['success' => true, 'message' => 'User unsuspended.', 'data' => []]);
  }

  public function destroy(int $id)
  {
    $user = User::findOrFail($id);
    Message::where('recipient_id', $id)->delete();
    Room::where('owner_id', $id)->delete();
    $user->delete();
    return response()->json(['success' => true, 'message' => 'User and all data deleted.', 'data' => []]);
  }

  public function forceVerify(int $id)
  {
    User::findOrFail($id)->update(['email_verified_at' => now(), 'inbox_active' => true]);
    return response()->json(['success' => true, 'message' => 'User email force-verified.', 'data' => []]);
  }
}
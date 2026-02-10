<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use App\Models\Message;
use App\Models\Report;
use App\Models\RevealInterest;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminDashboardController extends Controller
{
  public function stats()
  {
    return response()->json([
      'success' => true,
      'message' => 'Dashboard stats retrieved.',
      'data' => [
        'users' => [
          'total' => User::count(),
          'today' => User::whereDate('created_at', today())->count(),
          'this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
        ],
        'messages' => [
          'today' => Message::whereDate('created_at', today())->count(),
          'week' => Message::where('created_at', '>=', now()->startOfWeek())->count(),
          'all_time' => Message::count(),
          'flagged_pending' => Message::where('is_flagged', true)->where('is_deleted', false)->count(),
        ],
        'rooms' => [
          'active' => Room::where('is_active', true)->whereNull('archived_at')->count(),
        ],
        'reports' => ['open' => Report::where('status', 'pending')->count()],
        'blocked_ips' => BlockedIp::count(),
        'reveal_interests' => RevealInterest::where('status', 'pending')->count(),
      ],
    ]);
  }

  // Messages per day (last 30 days)
  public function messagesChart()
  {
    $data = Message::selectRaw('DATE(created_at) as date, COUNT(*) as count')
      ->where('created_at', '>=', now()->subDays(30))
      ->groupBy('date')
      ->orderBy('date')
      ->get();

    return response()->json(['success' => true, 'message' => 'Chart data.', 'data' => $data]);
  }

  // New signups per day (last 30 days)
  public function signupsChart()
  {
    $data = User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
      ->where('created_at', '>=', now()->subDays(30))
      ->groupBy('date')
      ->orderBy('date')
      ->get();

    return response()->json(['success' => true, 'message' => 'Signups chart.', 'data' => $data]);
  }

  // Top 10 recipients by message volume
  public function topRecipients()
  {
    $data = Message::selectRaw('recipient_id, COUNT(*) as count')
      ->with('recipient:id,username,name')
      ->groupBy('recipient_id')
      ->orderByDesc('count')
      ->limit(10)
      ->get();

    return response()->json(['success' => true, 'message' => 'Top recipients.', 'data' => $data]);
  }

  // Top 10 most active rooms
  public function topRooms()
  {
    $data = Room::withCount('messages')
      ->orderByDesc('messages_count')
      ->limit(10)
      ->get(['id', 'name', 'code', 'owner_id']);

    return response()->json(['success' => true, 'message' => 'Top rooms.', 'data' => $data]);
  }
}

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

class AdminMessageController extends Controller
{
  public function flagged()
  {
    $messages = Message::where('is_flagged', true)
      ->where('is_deleted', false)
      ->with('recipient:id,username')
      ->orderByDesc('created_at')
      ->paginate(25);
    return response()->json(['success' => true, 'message' => 'Flagged messages.', 'data' => $messages]);
  }

  public function approve(int $id)
  {
    Message::findOrFail($id)->update(['is_flagged' => false]);
    return response()->json(['success' => true, 'message' => 'Message approved and delivered.', 'data' => []]);
  }

  public function destroy(int $id)
  {
    Message::findOrFail($id)->update(['is_deleted' => true, 'deleted_at' => now()]);
    return response()->json(['success' => true, 'message' => 'Message deleted.', 'data' => []]);
  }
}

class AdminReportController extends Controller
{
  public function index()
  {
    $reports = Report::with(['message.recipient:id,username', 'reporter:id,username'])
      ->orderByDesc('created_at')
      ->paginate(25);
    return response()->json(['success' => true, 'message' => 'Reports retrieved.', 'data' => $reports]);
  }

  public function update(Request $request, int $id)
  {
    $validator = Validator::make($request->all(), [
      'status' => 'required|in:pending,reviewed,resolved',
      'admin_note' => 'nullable|string|max:500',
    ]);
    if ($validator->fails())
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

    Report::findOrFail($id)->update($request->only(['status', 'admin_note']));
    return response()->json(['success' => true, 'message' => 'Report updated.', 'data' => []]);
  }
}

class AdminRoomController extends Controller
{
  public function index()
  {
    $rooms = Room::with('owner:id,username')->withCount('messages')->orderByDesc('created_at')->paginate(25);
    return response()->json(['success' => true, 'message' => 'Rooms retrieved.', 'data' => $rooms]);
  }

  public function destroy(int $id)
  {
    Room::findOrFail($id)->update(['is_active' => false, 'archived_at' => now()]);
    return response()->json(['success' => true, 'message' => 'Room closed.', 'data' => []]);
  }
}

class AdminBlockedIpController extends Controller
{
  public function index()
  {
    return response()->json(['success' => true, 'message' => 'Blocked IPs.', 'data' => BlockedIp::orderByDesc('created_at')->paginate(50)]);
  }

  public function store(Request $request)
  {
    $validator = Validator::make($request->all(), ['ip_address' => 'required|ip', 'reason' => 'nullable|string']);
    if ($validator->fails())
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

    BlockedIp::firstOrCreate(['ip_address' => $request->ip_address], ['reason' => $request->reason, 'blocked_by_admin_id' => $request->user()->id]);
    return response()->json(['success' => true, 'message' => 'IP blocked.', 'data' => []], 201);
  }

  public function destroy(int $id)
  {
    BlockedIp::findOrFail($id)->delete();
    return response()->json(['success' => true, 'message' => 'IP unblocked.', 'data' => []]);
  }
}

class AdminRevealInterestController extends Controller
{
  public function count()
  {
    return response()->json(['success' => true, 'message' => 'Reveal interest count.', 'data' => ['count' => RevealInterest::where('status', 'pending')->count()]]);
  }
}

class AdminSettingsController extends Controller
{
  public function show()
  {
    $announcement = \App\Models\Announcement::where('is_active', true)->latest()->first();
    return response()->json(['success' => true, 'message' => 'Settings.', 'data' => ['announcement' => $announcement]]);
  }

  public function update(Request $request)
  {
    $validator = Validator::make($request->all(), ['announcement' => 'nullable|string|max:500']);
    if ($validator->fails())
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

    \App\Models\Announcement::where('is_active', true)->update(['is_active' => false]);

    if ($request->announcement) {
      \App\Models\Announcement::create(['content' => $request->announcement, 'is_active' => true, 'created_by' => $request->user()->id]);
    }

    return response()->json(['success' => true, 'message' => 'Settings updated.', 'data' => []]);
  }
}
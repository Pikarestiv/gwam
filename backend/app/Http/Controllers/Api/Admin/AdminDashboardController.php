<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use App\Models\Message;
use App\Models\Report;
use App\Models\RevealInterest;
use App\Models\Room;
use App\Models\User;

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

  public function messagesChart()
  {
    $data = Message::selectRaw('DATE(created_at) as date, COUNT(*) as count')
      ->where('created_at', '>=', now()->subDays(30))
      ->groupBy('date')
      ->orderBy('date')
      ->get();
    return response()->json(['success' => true, 'message' => 'Chart data.', 'data' => $data]);
  }

  public function signupsChart()
  {
    $data = User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
      ->where('created_at', '>=', now()->subDays(30))
      ->groupBy('date')
      ->orderBy('date')
      ->get();
    return response()->json(['success' => true, 'message' => 'Signups chart.', 'data' => $data]);
  }

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

  public function topRooms()
  {
    $data = Room::withCount('messages')
      ->orderByDesc('messages_count')
      ->limit(10)
      ->get(['id', 'name', 'code', 'owner_id']);
    return response()->json(['success' => true, 'message' => 'Top rooms.', 'data' => $data]);
  }
}
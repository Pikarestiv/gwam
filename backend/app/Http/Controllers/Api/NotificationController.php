<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
  public function index(Request $request)
  {
    $notifications = Notification::where('user_id', $request->user()->id)
      ->orderByDesc('created_at')
      ->paginate(30);

    return response()->json([
      'success' => true,
      'message' => 'Notifications retrieved.',
      'data' => $notifications,
    ]);
  }

  public function unreadCount(Request $request)
  {
    $count = Notification::where('user_id', $request->user()->id)
      ->whereNull('read_at')
      ->count();

    return response()->json([
      'success' => true,
      'message' => 'Unread count retrieved.',
      'data' => ['count' => $count],
    ]);
  }

  public function markRead(Request $request, int $id)
  {
    Notification::where('id', $id)
      ->where('user_id', $request->user()->id)
      ->update(['read_at' => now()]);

    return response()->json([
      'success' => true,
      'message' => 'Notification marked as read.',
      'data' => [],
    ]);
  }

  public function markAllRead(Request $request)
  {
    Notification::where('user_id', $request->user()->id)
      ->whereNull('read_at')
      ->update(['read_at' => now()]);

    return response()->json([
      'success' => true,
      'message' => 'All notifications marked as read.',
      'data' => [],
    ]);
  }
}
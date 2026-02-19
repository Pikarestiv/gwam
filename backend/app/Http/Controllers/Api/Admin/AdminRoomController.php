<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;

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
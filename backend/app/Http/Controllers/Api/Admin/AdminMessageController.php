<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;

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
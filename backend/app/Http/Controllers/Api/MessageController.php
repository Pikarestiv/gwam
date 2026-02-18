<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\MessageReadMail;
use App\Models\Message;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MessageController extends Controller
{
  public function index(Request $request)
  {
    $messages = Message::where('recipient_id', $request->user()->id)
      ->where('is_deleted', false)
      ->where('is_flagged', false)
      ->orderByDesc('created_at')
      ->paginate(20);

    return response()->json([
      'success' => true,
      'message' => 'Inbox retrieved.',
      'data' => $messages,
    ]);
  }

  public function markRead(Request $request, int $id)
  {
    $message = Message::where('id', $id)
      ->where('recipient_id', $request->user()->id)
      ->firstOrFail();

    if (!$message->is_read) {
      $message->update(['is_read' => true, 'read_at' => now()]);

      // Notify sender if they left an email
      if ($message->senderInterest && !$message->senderInterest->notified_on_read) {
        try {
          Mail::to($message->senderInterest->email)
            ->send(new MessageReadMail($request->user()->username));
          $message->senderInterest->update(['notified_on_read' => true]);
        }
        catch (\Exception $e) {
          \Log::error('Message read mail failed: ' . $e->getMessage());
        }
      }
    }

    return response()->json([
      'success' => true,
      'message' => 'Message marked as read.',
      'data' => [],
    ]);
  }

  public function reply(Request $request, int $id)
  {
    $validator = Validator::make($request->all(), [
      'reply_text' => 'required|string|min:1|max:500',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $message = Message::where('id', $id)
      ->where('recipient_id', $request->user()->id)
      ->where('is_deleted', false)
      ->firstOrFail();

    $message->update([
      'reply_text' => $request->reply_text,
      'replied_at' => now(),
    ]);

    return response()->json([
      'success' => true,
      'message' => 'Reply saved.',
      'data' => [
        'reply_text' => $message->reply_text,
        'replied_at' => $message->replied_at,
      ],
    ]);
  }

  public function destroy(Request $request, int $id)
  {
    $message = Message::where('id', $id)
      ->where('recipient_id', $request->user()->id)
      ->firstOrFail();

    $message->update(['is_deleted' => true, 'deleted_at' => now()]);

    return response()->json([
      'success' => true,
      'message' => 'Message deleted.',
      'data' => [],
    ]);
  }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Services\AnonymousMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnonymousMessageController extends Controller
{
  public function __construct(private AnonymousMessageService $messages)
  {
  }

  public function send(Request $request, string $username)
  {
    // Suspended users are indistinguishable from missing ones.
    $recipient = User::where('username', $username)->where('is_suspended', false)->first();
    if (!$recipient) {
      return $this->fail('User not found.', 404);
    }

    if (!$recipient->inbox_active) {
      return $this->fail("@{$username} hasn't activated their inbox yet.", 403);
    }

    $data = $this->check($request->all(), ['content' => 'required|string|min:1|max:500']);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $message = $this->messages->deliver(
      $recipient,
      $data['content'],
      $request->boolean('is_flagged'),
      $request->ip(),
      $request->userAgent() ?? '',
    );

    return $this->ok('Message delivered 👻', [
      'sender_token' => $message->sender_token,
      'message_id' => $message->id,
    ], 201);
  }

  public function saveSenderInterest(Request $request, int $messageId)
  {
    $data = $this->check($request->all(), [
      'email' => 'required|email',
      'sender_token' => 'required|string|max:64',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    if (!$this->messages->saveSenderInterest($messageId, $data['sender_token'], $data['email'])) {
      return $this->fail('Message not found.', 404);
    }

    return $this->ok("We'll notify you when your message is read.");
  }

  public function viewReply(string $senderToken)
  {
    $message = Message::where('sender_token', $senderToken)->first();
    if (!$message) {
      return $this->fail('Message not found.', 404);
    }

    return $this->ok('Reply retrieved.', [
      'has_reply' => !is_null($message->reply_text),
      'reply_text' => $message->reply_text,
      'replied_at' => $message->replied_at,
      'recipient_username' => $message->recipient->username,
    ]);
  }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomMessage;
use App\Services\RoomService;
use Illuminate\Http\Request;

class RoomController extends Controller
{
  public function __construct(private RoomService $rooms)
  {
  }

  // Public: view room
  public function show(Request $request, string $code)
  {
    $room = $this->rooms->findOpen($code);
    if (!$room) {
      return $this->fail('Room not found or is closed.', 404);
    }

    if (!$this->rooms->passwordMatches($room, $this->password($request))) {
      return $this->wrongPassword($room);
    }

    return $this->ok('Room retrieved.', [
      'room' => [
        'id' => $room->id,
        'name' => $room->name,
        'topic' => $room->topic,
        'code' => $room->code,
        'is_readonly' => $room->is_readonly,
        'has_password' => !is_null($room->password_hash),
        'owner_username' => $room->owner->username,
        'expires_at' => $room->expires_at,
      ],
      'messages' => $this->rooms->visibleMessages($room, $request->header('X-Session-Token')),
    ]);
  }

  // Public: send room message
  public function sendMessage(Request $request, string $code)
  {
    $room = $this->rooms->findOpen($code);
    if (!$room) {
      return $this->fail('Room not found or is closed.', 404);
    }

    if ($room->is_readonly) {
      return $this->fail('This room is in read-only mode.', 403);
    }

    if (!$this->rooms->passwordMatches($room, $this->password($request))) {
      return $this->wrongPassword($room);
    }

    $data = $this->check($request->all(), [
      'content' => 'required|string|min:1|max:500',
      'session_token' => 'required|string|max:100',
    ]);
    if ($data instanceof \Illuminate\Http\JsonResponse) {
      return $data;
    }

    $msg = $this->rooms->postMessage($room, $data['content'], $data['session_token'], $request->boolean('is_flagged'));

    return $this->ok('Message sent.', [
      'id' => $msg->id,
      'ghost_name' => $msg->ghost_name,
      'content' => $msg->content,
      'created_at' => $msg->created_at,
    ], 201);
  }

  // Authenticated: list user's rooms
  public function index(Request $request)
  {
    $rooms = Room::where('owner_id', $request->user()->id)
      ->whereNull('archived_at')
      ->withCount(['messages' => fn($q) => $q->where('is_deleted', false)])
      ->orderByDesc('last_activity_at')
      ->get();

    return $this->ok('Rooms retrieved.', $rooms);
  }

  // Authenticated + verified: create room
  public function store(Request $request)
  {
    $data = $this->check($request->all(), [
      'name' => 'required|string|max:100',
      'topic' => 'nullable|string|max:255',
      'password' => 'nullable|string|min:4',
      'duration_hours' => 'nullable|integer|in:' . implode(',', array_keys(Room::DURATION_OPTIONS)),
    ]);
    if ($data instanceof \Illuminate\Http\JsonResponse) {
      return $data;
    }

    $room = $this->rooms->create($request->user(), $data);
    if (!$room) {
      return $this->fail(
        'Longer room durations require a paid plan (coming soon). Use 24 hours for now.',
        422,
        ['errors' => ['duration_hours' => ['This duration requires a paid plan.']]],
      );
    }

    return $this->ok('Room created.', $room, 201);
  }

  // Authenticated: update room
  public function update(Request $request, int $id)
  {
    $room = $this->owned($request, $id);

    $data = $this->check($request->all(), [
      'name' => 'sometimes|string|max:100',
      'topic' => 'sometimes|nullable|string|max:255',
      'is_active' => 'sometimes|boolean',
      'is_readonly' => 'sometimes|boolean',
    ]);
    if ($data instanceof \Illuminate\Http\JsonResponse) {
      return $data;
    }

    return $this->ok('Room updated.', $this->rooms->update($room, $data));
  }

  // Authenticated: delete room
  public function destroy(Request $request, int $id)
  {
    $this->rooms->archive($this->owned($request, $id));

    return $this->ok('Room archived.');
  }

  // Authenticated: clear all room messages
  public function clearMessages(Request $request, int $id)
  {
    RoomMessage::where('room_id', $this->owned($request, $id)->id)->update(['is_deleted' => true]);

    return $this->ok('All messages cleared.');
  }

  // Authenticated: delete specific room message
  public function destroyMessage(Request $request, int $id, int $msgId)
  {
    RoomMessage::where('id', $msgId)->where('room_id', $this->owned($request, $id)->id)->update(['is_deleted' => true]);

    return $this->ok('Message deleted.');
  }

  private function owned(Request $request, int $id): Room
  {
    return Room::where('id', $id)->where('owner_id', $request->user()->id)->firstOrFail();
  }

  // Header, not query string, so the password stays out of access logs.
  private function password(Request $request): ?string
  {
    return $request->header('X-Room-Password') ?? $request->input('password');
  }

  private function wrongPassword(Room $room)
  {
    return $this->fail('Incorrect room password.', 403, [
      'errors' => ['password' => ['Wrong password.']],
      'data' => ['requires_password' => true, 'name' => $room->name],
    ]);
  }
}

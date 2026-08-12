<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomMessage;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RoomController extends Controller
{
  // Public: view room
  public function show(string $code)
  {
    $room = Room::where('code', $code)->where('is_active', true)->first();

    if (!$room || $room->isExpired()) {
      return response()->json([
        'success' => false,
        'message' => 'Room not found or is closed.',
      ], 404);
    }

    $messages = RoomMessage::where('room_id', $room->id)
      ->where('is_deleted', false)
      ->where('is_flagged', false)
      ->orderBy('created_at')
      ->get(['id', 'content', 'ghost_name', 'created_at']);

    return response()->json([
      'success' => true,
      'message' => 'Room retrieved.',
      'data' => [
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
        'messages' => $messages,
      ],
    ]);
  }

  // Public: send room message
  public function sendMessage(Request $request, string $code)
  {
    $room = Room::where('code', $code)->where('is_active', true)->first();

    if (!$room) {
      return response()->json([
        'success' => false,
        'message' => 'Room not found or is closed.',
      ], 404);
    }

    if ($room->isExpired()) {
      return response()->json([
        'success' => false,
        'message' => 'This room has expired.',
      ], 404);
    }

    if ($room->is_readonly) {
      return response()->json([
        'success' => false,
        'message' => 'This room is in read-only mode.',
      ], 403);
    }

    if ($room->password_hash && !Hash::check($request->password ?? '', $room->password_hash)) {
      return response()->json([
        'success' => false,
        'message' => 'Incorrect room password.',
        'errors' => ['password' => ['Wrong password.']],
      ], 403);
    }

    $validator = Validator::make($request->all(), [
      'content' => 'required|string|min:1|max:500',
      'session_token' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $ghostNames = [
      'Ghost Pepper 🌶', 'Ghost Mode 🕶', 'Ghost Writer ✍️',
      'Ghost Rider 🏍️', 'Ghost Whisperer 👻', 'Ghost Town 🏚️',
      'Ghost Protocol 🔐', 'Ghost Ship 🚢', 'Ghost Light 💡',
      'Ghost Signal 📡', 'Ghost Runner 🏃', 'Ghost Hacker 💻',
      'Ghost Note 🎵', 'Ghost King 👑', 'Ghost Queen 💅',
      'Ghost Detective 🔍', 'Ghost Chef 🍳', 'Ghost Artist 🎨',
      'Ghost Gamer 🎮', 'Ghost Pilot ✈️', 'Ghost Sailor ⚓',
      'Ghost Wizard 🧙', 'Ghost Ninja 🥷', 'Ghost Astronaut 🚀',
      'Ghost Poet 📜', 'Ghost DJ 🎧', 'Ghost Farmer 🌾',
      'Ghost Doctor 🩺', 'Ghost Teacher 📚', 'Ghost Explorer 🧭',
    ];

    // Consistent ghost name per session token
    $ghostIndex = crc32($request->session_token) % count($ghostNames);
    $ghostName = $ghostNames[abs($ghostIndex)];

    $msg = RoomMessage::create([
      'room_id' => $room->id,
      'content' => $request->content,
      'ghost_name' => $ghostName,
      'session_token' => $request->session_token,
      'is_flagged' => $request->boolean('is_flagged', false),
    ]);

    $room->update(['last_activity_at' => now()]);

    // Notify room owner
    Notification::create([
      'user_id' => $room->owner_id,
      'type' => 'room_activity',
      'data' => [
        'room_id' => $room->id,
        'room_name' => $room->name,
        'room_code' => $room->code,
        'preview' => Str::limit($msg->content, 60),
      ],
    ]);

    return response()->json([
      'success' => true,
      'message' => 'Message sent.',
      'data' => [
        'id' => $msg->id,
        'ghost_name' => $msg->ghost_name,
        'content' => $msg->content,
        'created_at' => $msg->created_at,
      ],
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

    return response()->json([
      'success' => true,
      'message' => 'Rooms retrieved.',
      'data' => $rooms,
    ]);
  }

  // Authenticated + verified: create room
  public function store(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:100',
      'topic' => 'nullable|string|max:255',
      'password' => 'nullable|string|min:4',
      'duration_hours' => 'nullable|integer|in:' . implode(',', array_keys(Room::DURATION_OPTIONS)),
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $validator->errors(),
      ], 422);
    }

    $durationHours = (int) ($request->duration_hours ?? 24);

    // Paid tiers aren't available yet — reject anything above the free 24h option.
    if (Room::DURATION_OPTIONS[$durationHours] !== 'free') {
      return response()->json([
        'success' => false,
        'message' => 'Longer room durations require a paid plan (coming soon). Use 24 hours for now.',
        'errors' => ['duration_hours' => ['This duration requires a paid plan.']],
      ], 422);
    }

    $room = Room::create([
      'owner_id' => $request->user()->id,
      'name' => $request->name,
      'topic' => $request->topic,
      'password_hash' => $request->password ?Hash::make($request->password) : null,
      'expires_at' => now()->addHours($durationHours),
    ]);

    return response()->json([
      'success' => true,
      'message' => 'Room created.',
      'data' => $room,
    ], 201);
  }

  // Authenticated: update room
  public function update(Request $request, int $id)
  {
    $room = Room::where('id', $id)->where('owner_id', $request->user()->id)->firstOrFail();

    $room->update($request->only(['name', 'topic', 'is_active', 'is_readonly']));

    return response()->json([
      'success' => true,
      'message' => 'Room updated.',
      'data' => $room,
    ]);
  }

  // Authenticated: delete room
  public function destroy(Request $request, int $id)
  {
    $room = Room::where('id', $id)->where('owner_id', $request->user()->id)->firstOrFail();
    $room->update(['archived_at' => now(), 'is_active' => false]);

    return response()->json([
      'success' => true,
      'message' => 'Room archived.',
      'data' => [],
    ]);
  }

  // Authenticated: clear all room messages
  public function clearMessages(Request $request, int $id)
  {
    $room = Room::where('id', $id)->where('owner_id', $request->user()->id)->firstOrFail();
    RoomMessage::where('room_id', $room->id)->update(['is_deleted' => true]);

    return response()->json([
      'success' => true,
      'message' => 'All messages cleared.',
      'data' => [],
    ]);
  }

  // Authenticated: delete specific room message
  public function destroyMessage(Request $request, int $id, int $msgId)
  {
    $room = Room::where('id', $id)->where('owner_id', $request->user()->id)->firstOrFail();
    RoomMessage::where('id', $msgId)->where('room_id', $room->id)->update(['is_deleted' => true]);

    return response()->json([
      'success' => true,
      'message' => 'Message deleted.',
      'data' => [],
    ]);
  }
}
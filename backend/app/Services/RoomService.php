<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Room;
use App\Models\RoomMessage;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RoomService
{
  private const GHOST_NAMES = [
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

  /** Inactive, archived and expired rooms are all "not open" — callers answer them identically. */
  public function findOpen(string $code): ?Room
  {
    $room = Room::active()->where('code', $code)->first();

    return $room && !$room->isExpired() ? $room : null;
  }

  public function passwordMatches(Room $room, ?string $password): bool
  {
    return !$room->password_hash || ($password !== null && Hash::check($password, $room->password_hash));
  }

  /** Messages for display; `is_mine` marks the caller's own without exposing anyone's session token. */
  public function visibleMessages(Room $room, ?string $sessionToken)
  {
    return RoomMessage::where('room_id', $room->id)
      ->where('is_deleted', false)
      ->where('is_flagged', false)
      ->orderBy('created_at')
      ->get(['id', 'content', 'ghost_name', 'session_token', 'created_at'])
      ->map(fn($m) => [
        'id' => $m->id,
        'content' => $m->content,
        'ghost_name' => $m->ghost_name,
        'created_at' => $m->created_at,
        'is_mine' => $sessionToken !== null && hash_equals($m->session_token, $sessionToken),
      ]);
  }

  public function postMessage(Room $room, string $content, string $sessionToken, bool $flagged): RoomMessage
  {
    $msg = RoomMessage::create([
      'room_id' => $room->id,
      'content' => $content,
      'ghost_name' => self::GHOST_NAMES[crc32($sessionToken) % count(self::GHOST_NAMES)],
      'session_token' => $sessionToken,
      'is_flagged' => $flagged,
    ]);

    $room->update(['last_activity_at' => now()]);

    // Flagged text is hidden from the room, so it must not leak through a preview either.
    if (!$flagged) {
      Notification::create([
        'user_id' => $room->owner_id,
        'type' => 'room_activity',
        'data' => [
          'room_id' => $room->id,
          'room_name' => $room->name,
          'room_code' => $room->code,
          'preview' => Str::limit($content, 60),
        ],
      ]);
    }

    return $msg;
  }

  /** Returns null when the requested duration is paid; those go through PaymentService. */
  public function create(User $owner, array $data): ?Room
  {
    $hours = (int) ($data['duration_hours'] ?? 24);

    if (Room::DURATION_OPTIONS[$hours] !== 'free') {
      return null;
    }

    return $this->build($owner->id, $data['name'], $data['topic'] ?? null, $this->hashed($data['password'] ?? null), $hours);
  }

  /** Called by PaymentService once a payment is confirmed. */
  public function build(int $ownerId, string $name, ?string $topic, ?string $passwordHash, int $hours): Room
  {
    return Room::create([
      'owner_id' => $ownerId,
      'name' => $name,
      'topic' => $topic,
      'password_hash' => $passwordHash,
      'expires_at' => now()->addHours($hours),
    ]);
  }

  public function hashed(?string $password): ?string
  {
    return $password ? Hash::make($password) : null;
  }

  /** Archived rooms stay archived: reopening one would let the archive command delete a live room. */
  public function update(Room $room, array $data): Room
  {
    if ($room->archived_at) {
      unset($data['is_active']);
    }

    $room->update($data);

    return $room;
  }

  public function archive(Room $room): void
  {
    $room->update(['archived_at' => now(), 'is_active' => false]);
  }
}

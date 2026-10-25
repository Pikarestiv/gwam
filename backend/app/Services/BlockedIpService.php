<?php

namespace App\Services;

use App\Models\BlockedIp;

class BlockedIpService
{
  public const AUTO_BLOCK_AT = 3;

  /** Blocked = an admin blocked it, or it has reached the auto-block threshold. One flag alone never blocks. */
  public function isBlocked(string $ip): bool
  {
    return BlockedIp::where('ip_address', $ip)
      ->where(fn($q) => $q->whereNotNull('blocked_by_admin_id')->orWhere('flag_count', '>=', self::AUTO_BLOCK_AT))
      ->exists();
  }

  // shortcut: lifetime count, not a 24h window — switch to a cache-windowed counter if shared IPs get caught.
  public function recordFlag(string $ip): void
  {
    $blocked = BlockedIp::firstOrNew(['ip_address' => $ip]);
    $blocked->flag_count = ($blocked->flag_count ?? 0) + 1;
    $blocked->reason = $blocked->flag_count >= self::AUTO_BLOCK_AT
      ? 'Auto-blocked: 3+ content violations'
      : ($blocked->reason ?? 'Auto-flagged: content violations');
    $blocked->save();
  }
}

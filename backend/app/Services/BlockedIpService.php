<?php

namespace App\Services;

use App\Models\BlockedIp;
use Illuminate\Support\Facades\Cache;

class BlockedIpService
{
  public const AUTO_BLOCK_AT = 3;
  private const WINDOW_SECONDS = 86400; // flags older than this stop counting
  private const AUTO_BLOCK_DAYS = 7;

  /** Blocked = an admin block, or an auto-block that hasn't expired. A single flag never blocks. */
  public function isBlocked(string $ip): bool
  {
    return BlockedIp::where('ip_address', $ip)
      ->where(fn($q) => $q->whereNotNull('blocked_by_admin_id')->orWhere('expires_at', '>', now()))
      ->exists();
  }

  public function recordFlag(string $ip): void
  {
    $key = "ip_flags:{$ip}";
    Cache::add($key, 0, self::WINDOW_SECONDS);
    $count = Cache::increment($key);

    $blocked = BlockedIp::firstOrNew(['ip_address' => $ip]);
    $blocked->flag_count = ($blocked->flag_count ?? 0) + 1;
    $blocked->reason = $blocked->reason ?? 'Auto-flagged: content violations';

    if ($count >= self::AUTO_BLOCK_AT && !$blocked->blocked_by_admin_id) {
      $blocked->reason = 'Auto-blocked: 3+ content violations in 24h';
      $blocked->expires_at = now()->addDays(self::AUTO_BLOCK_DAYS);
    }

    $blocked->save();
  }
}

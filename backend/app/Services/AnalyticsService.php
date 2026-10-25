<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AnalyticsService
{
  public const EVENTS = [
    'pageview', 'signup', 'message_sent', 'room_message_sent',
    'link_copied', 'pwa_installed', 'share_card', 'push_enabled',
  ];
  private const RETENTION_DAYS = 90;

  public function record(string $name, ?string $path, string $session): void
  {
    DB::table('events')->insert(['name' => $name, 'path' => $path, 'session' => $session, 'created_at' => now()]);
  }

  public function summary(int $days): array
  {
    $since = now()->subDays($days)->startOfDay();
    $events = fn() => DB::table('events')->where('created_at', '>=', $since);

    return [
      'daily' => $events()->where('name', 'pageview')
        ->selectRaw('DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT session) as visitors')
        ->groupBy('date')->orderBy('date')->get(),
      'top_paths' => $events()->where('name', 'pageview')
        ->selectRaw('path, COUNT(*) as count')->groupBy('path')->orderByDesc('count')->limit(10)->get(),
      'events' => $events()->where('name', '!=', 'pageview')
        ->selectRaw('name, COUNT(*) as count')->groupBy('name')->orderByDesc('count')->get(),
      'visitors' => $events()->distinct()->count('session'),
    ];
  }

  public function prune(): int
  {
    return DB::table('events')->where('created_at', '<', now()->subDays(self::RETENTION_DAYS))->delete();
  }
}

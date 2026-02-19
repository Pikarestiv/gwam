<?php

namespace App\Console\Commands;

use App\Models\Room;
use Illuminate\Console\Command;

class ArchiveInactiveRooms extends Command
{
  protected $signature = 'gwam:archive-inactive-rooms';
  protected $description = 'Archive rooms inactive for 30+ days. Delete rooms archived for 6+ months.';

  public function handle(): void
  {
    // Archive rooms inactive for 30 days
    $archived = Room::where('is_active', true)
      ->whereNull('archived_at')
      ->where(fn($q) => $q
    ->where('last_activity_at', '<=', now()->subDays(30))
    ->orWhere(fn($q2) => $q2->whereNull('last_activity_at')->where('created_at', '<=', now()->subDays(30)))
    )
      ->update(['archived_at' => now(), 'is_active' => false]);

    $this->info("Archived {$archived} inactive rooms.");

    // Hard delete rooms archived for 6+ months
    $deleted = Room::whereNotNull('archived_at')
      ->where('archived_at', '<=', now()->subMonths(6))
      ->count();

    Room::whereNotNull('archived_at')
      ->where('archived_at', '<=', now()->subMonths(6))
      ->delete();

    $this->info("Hard-deleted {$deleted} long-archived rooms.");
  }
}
<?php

namespace App\Console\Commands;

use App\Models\Message;
use Illuminate\Console\Command;

class DeleteExpiredMessages extends Command
{
  protected $signature = 'gwam:delete-expired-messages';
  protected $description = 'Soft-delete messages past their scheduled delete date, then hard-delete after 30-day grace.';

  public function handle(): void
  {
    // Soft delete: mark is_deleted for messages past delete_scheduled_at
    $softDeleted = Message::where('is_deleted', false)
      ->whereNotNull('delete_scheduled_at')
      ->where('delete_scheduled_at', '<=', now())
      ->update(['is_deleted' => true, 'deleted_at' => now()]);

    $this->info("Soft-deleted {$softDeleted} expired messages.");

    // Hard delete: permanently remove messages soft-deleted 30+ days ago
    $hardDeleted = Message::where('is_deleted', true)
      ->where('deleted_at', '<=', now()->subDays(30))
      ->count();

    Message::where('is_deleted', true)
      ->where('deleted_at', '<=', now()->subDays(30))
      ->delete();

    $this->info("Hard-deleted {$hardDeleted} messages after grace period.");
  }
}
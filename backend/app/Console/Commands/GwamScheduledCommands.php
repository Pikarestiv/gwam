<?php

namespace App\Console\Commands;

use App\Mail\WeeklyDigestMail;
use App\Models\Message;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

class SendWeeklyDigest extends Command
{
  protected $signature = 'gwam:weekly-digest';
  protected $description = 'Send weekly re-engagement emails to users with unread messages who haven\'t logged in for 7+ days.';

  public function handle(): void
  {
    $users = User::where('is_suspended', false)
      ->where(fn($q) => $q
    ->whereNull('last_login_at')
    ->orWhere('last_login_at', '<=', now()->subDays(7))
    )
      ->get();

    $sent = 0;
    foreach ($users as $user) {
      $unreadCount = Message::where('recipient_id', $user->id)
        ->where('is_read', false)
        ->where('is_deleted', false)
        ->where('is_flagged', false)
        ->count();

      if ($unreadCount > 0) {
        try {
          Mail::to($user->email)->send(new WeeklyDigestMail($user, $unreadCount));
          $sent++;
        }
        catch (\Exception $e) {
          \Log::error("Weekly digest failed for user {$user->id}: " . $e->getMessage());
        }
      }
    }

    $this->info("Weekly digest sent to {$sent} users.");
  }
}
<?php

namespace App\Console\Commands;

use App\Mail\WeeklyDigestMail;
use App\Models\Message;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
          Log::error("Weekly digest failed for user {$user->id}: " . $e->getMessage());
        }
      }
    }

    $this->info("Weekly digest sent to {$sent} users.");
  }
}
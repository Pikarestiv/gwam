<?php

namespace App\Http\Middleware;

use App\Models\BlockedIp;
use Closure;
use Illuminate\Http\Request;

class ContentFilter
{
  /**
   * Keyword blocklist — Nigerian slang, English slurs, threats, explicit content.
   * Add more terms as needed. All checks are case-insensitive.
   */
  protected array $blocklist = [
    // Threats
    'i will kill you', 'i\'ll kill you', 'i will hurt you', 'go kill yourself',
    'kys', 'kill yourself', 'i know where you live', 'i will find you',
    // Explicit
    'fuck you', 'motherfucker', 'piece of shit', 'go to hell',
    // Nigerian slurs (Igbo, Yoruba, Hausa — transliterated)
    'oshi', 'oloshi', 'werey', 'olosho', 'ashawo', 'ode', 'mumu',
    'idiot', 'bastard', 'stupid fool', 'dullard',
    // Self-harm
    'end your life', 'nobody loves you', 'you should die',
    // Doxxing patterns
    'your address is', 'i know your house', 'i have your number',
  ];

  public function handle(Request $request, Closure $next)
  {
    $content = strtolower($request->input('content', ''));

    foreach ($this->blocklist as $term) {
      if (str_contains($content, $term)) {
        $this->trackFlaggedIp($request->ip());
        // Save as flagged — don't tell sender
        $request->merge(['is_flagged' => true]);
        break;
      }
    }

    return $next($request);
  }

  protected function trackFlaggedIp(string $ip): void
  {
    $blocked = BlockedIp::firstOrNew(['ip_address' => $ip]);
    $blocked->flag_count = ($blocked->flag_count ?? 0) + 1;
    $blocked->reason = $blocked->reason ?? 'Auto-flagged: content violations';

    // Auto-block after 3 flagged messages in 24 hours
    // (simplified: we track total count here; production would use time-windowed cache)
    if ($blocked->flag_count >= 3) {
      $blocked->reason = 'Auto-blocked: 3+ content violations';
    }

    $blocked->save();
  }
}
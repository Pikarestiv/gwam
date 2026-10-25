<?php

namespace App\Http\Middleware;

use App\Services\BlockedIpService;
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

  public function __construct(private BlockedIpService $blockedIps)
  {
  }

  public function handle(Request $request, Closure $next)
  {
    $content = (string) $request->input('content', '');

    foreach ($this->blocklist as $term) {
      // Whole-word match: "ode" must not hit "code", "kys" must not hit "turkeys".
      if (preg_match('/(?<![\p{L}\p{N}])' . preg_quote($term, '/') . '(?![\p{L}\p{N}])/iu', $content)) {
        $this->blockedIps->recordFlag($request->ip());
        // Save as flagged — don't tell sender
        $request->merge(['is_flagged' => true]);
        break;
      }
    }

    return $next($request);
  }
}

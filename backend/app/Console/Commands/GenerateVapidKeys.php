<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
  protected $signature = 'gwam:vapid-keys';
  protected $description = 'Print a new VAPID key pair for web push (add to .env; never regenerate on a live site).';

  public function handle(): void
  {
    $keys = VAPID::createVapidKeys();
    $this->line("VAPID_PUBLIC_KEY={$keys['publicKey']}");
    $this->line("VAPID_PRIVATE_KEY={$keys['privateKey']}");
  }
}

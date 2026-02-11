<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Run daily at midnight
        $schedule->command('gwam:delete-expired-messages')->daily();
        $schedule->command('gwam:archive-inactive-rooms')->daily();
        // Run weekly on Mondays at 9am
        $schedule->command('gwam:weekly-digest')->weeklyOn(1, '09:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
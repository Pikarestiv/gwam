<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY theme_preference VARCHAR(255) DEFAULT 'gwam_dark'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY theme_preference ENUM('gwam_dark', 'neon_magenta', 'soft_dark') DEFAULT 'gwam_dark'");
    }
};
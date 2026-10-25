<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('blocked_ips', function (Blueprint $table) {
      // Auto-blocks expire; admin blocks (blocked_by_admin_id set) never do.
      $table->timestamp('expires_at')->nullable()->after('flag_count');
    });
  }

  public function down(): void
  {
    Schema::table('blocked_ips', function (Blueprint $table) {
      $table->dropColumn('expires_at');
    });
  }
};

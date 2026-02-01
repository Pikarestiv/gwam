<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('blocked_ips', function (Blueprint $table) {
      $table->id();
      $table->string('ip_address', 45)->unique();
      $table->text('reason')->nullable();
      $table->integer('flag_count')->default(0);
      $table->foreignId('blocked_by_admin_id')->nullable()->constrained('admins')->nullOnDelete();
      $table->timestamps();

      $table->index('ip_address');
    });

    Schema::create('announcements', function (Blueprint $table) {
      $table->id();
      $table->text('content');
      $table->boolean('is_active')->default(true);
      $table->foreignId('created_by')->constrained('admins')->cascadeOnDelete();
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('announcements');
    Schema::dropIfExists('blocked_ips');
  }
};
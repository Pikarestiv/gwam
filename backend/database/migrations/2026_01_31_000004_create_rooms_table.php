<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('rooms', function (Blueprint $table) {
      $table->id();
      $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
      $table->string('name');
      $table->text('topic')->nullable();
      $table->string('code', 6)->unique();
      $table->string('password_hash')->nullable();
      $table->boolean('is_active')->default(true);
      $table->boolean('is_readonly')->default(false);
      $table->timestamp('last_activity_at')->nullable();
      $table->timestamp('archived_at')->nullable();
      $table->timestamps();

      $table->index('code');
      $table->index('owner_id');
    });

    Schema::create('room_messages', function (Blueprint $table) {
      $table->id();
      $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
      $table->text('content');
      $table->string('ghost_name', 100);
      $table->string('session_token', 64);
      $table->boolean('is_flagged')->default(false);
      $table->boolean('is_deleted')->default(false);
      $table->timestamps();

      $table->index('room_id');
      $table->index('session_token');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('room_messages');
    Schema::dropIfExists('rooms');
  }
};
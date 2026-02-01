<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('reveal_interests', function (Blueprint $table) {
      $table->id();
      $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
      $table->foreignId('requester_user_id')->constrained('users')->cascadeOnDelete();
      $table->enum('status', ['pending', 'paid', 'fulfilled'])->default('pending');
      $table->timestamps();

      $table->index('message_id');
      $table->index('requester_user_id');
    });

    Schema::create('reports', function (Blueprint $table) {
      $table->id();
      $table->foreignId('message_id')->nullable()->constrained('messages')->nullOnDelete();
      $table->foreignId('room_message_id')->nullable()->constrained('room_messages')->nullOnDelete();
      $table->foreignId('reporter_user_id')->nullable()->constrained('users')->nullOnDelete();
      $table->string('reporter_ip', 45)->nullable();
      $table->enum('reason', ['harassment', 'threats', 'explicit', 'spam', 'other']);
      $table->text('extra_detail')->nullable();
      $table->enum('status', ['pending', 'reviewed', 'resolved'])->default('pending');
      $table->text('admin_note')->nullable();
      $table->timestamps();

      $table->index('status');
      $table->index('message_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('reports');
    Schema::dropIfExists('reveal_interests');
  }
};
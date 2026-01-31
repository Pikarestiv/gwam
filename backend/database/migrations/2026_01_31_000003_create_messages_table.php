<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('messages', function (Blueprint $table) {
      $table->id();
      $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
      $table->text('content');
      $table->boolean('is_flagged')->default(false);
      $table->boolean('is_read')->default(false);
      $table->timestamp('read_at')->nullable();
      $table->text('reply_text')->nullable();
      $table->timestamp('replied_at')->nullable();
      $table->string('sender_email')->nullable();
      $table->uuid('sender_token')->unique();
      $table->string('sender_ip', 45)->nullable();
      $table->string('sender_country', 100)->nullable();
      $table->string('sender_city', 100)->nullable();
      $table->enum('sender_device', ['mobile', 'desktop', 'tablet'])->nullable();
      $table->string('sender_browser', 100)->nullable();
      $table->boolean('is_deleted')->default(false);
      $table->timestamp('deleted_at')->nullable();
      $table->timestamp('delete_scheduled_at')->nullable();
      $table->timestamps();

      $table->index('recipient_id');
      $table->index('sender_token');
      $table->index('is_flagged');
      $table->index('is_deleted');
    });

    Schema::create('sender_interests', function (Blueprint $table) {
      $table->id();
      $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
      $table->string('email');
      $table->boolean('notified_on_read')->default(false);
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('sender_interests');
    Schema::dropIfExists('messages');
  }
};
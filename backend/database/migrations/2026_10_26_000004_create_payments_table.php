<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('payments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('reference', 64)->unique();
      $table->unsignedInteger('amount_kobo');
      $table->string('status', 16)->default('pending'); // pending | paid
      $table->json('payload'); // room details to create once paid
      $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
      $table->timestamp('paid_at')->nullable();
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('payments');
  }
};

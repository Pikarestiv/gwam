<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    // First-party, anonymous analytics: no IP, no user id, no cookies.
    Schema::create('events', function (Blueprint $table) {
      $table->id();
      $table->string('name', 40);
      $table->string('path', 120)->nullable();
      $table->string('session', 40);
      $table->timestamp('created_at')->useCurrent();

      $table->index(['name', 'created_at']);
      $table->index('created_at');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('events');
  }
};

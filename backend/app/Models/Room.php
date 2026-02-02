<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Room extends Model
{
  protected $fillable = [
    'owner_id', 'name', 'topic', 'code',
    'password_hash', 'is_active', 'is_readonly',
    'last_activity_at', 'archived_at',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'is_readonly' => 'boolean',
    'last_activity_at' => 'datetime',
    'archived_at' => 'datetime',
  ];

  protected static function boot()
  {
    parent::boot();
    static::creating(function ($room) {
      if (empty($room->code)) {
        $room->code = static::generateUniqueCode();
      }
    });
  }

  public static function generateUniqueCode(): string
  {
    do {
      $code = strtoupper(Str::random(6));
    } while (static::where('code', $code)->exists());
    return $code;
  }

  public function owner()
  {
    return $this->belongsTo(User::class , 'owner_id');
  }

  public function messages()
  {
    return $this->hasMany(RoomMessage::class);
  }

  public function scopeActive($query)
  {
    return $query->where('is_active', true)->whereNull('archived_at');
  }
}
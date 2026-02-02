<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomMessage extends Model
{
  protected $fillable = [
    'room_id', 'content', 'ghost_name',
    'session_token', 'is_flagged', 'is_deleted',
  ];

  protected $casts = [
    'is_flagged' => 'boolean',
    'is_deleted' => 'boolean',
  ];

  public function room()
  {
    return $this->belongsTo(Room::class);
  }

  public function reports()
  {
    return $this->hasMany(Report::class);
  }

  public function scopeVisible($query)
  {
    return $query->where('is_deleted', false)->where('is_flagged', false);
  }
}
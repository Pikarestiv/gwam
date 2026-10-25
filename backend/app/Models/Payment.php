<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
  protected $fillable = ['user_id', 'reference', 'amount_kobo', 'status', 'payload', 'room_id', 'paid_at'];

  protected $casts = ['payload' => 'array', 'paid_at' => 'datetime'];

  public function room()
  {
    return $this->belongsTo(Room::class);
  }
}

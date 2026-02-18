<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SenderInterest extends Model
{
  protected $fillable = ['message_id', 'email', 'notified_on_read'];

  protected $casts = ['notified_on_read' => 'boolean'];

  public function message()
  {
    return $this->belongsTo(Message::class);
  }
}
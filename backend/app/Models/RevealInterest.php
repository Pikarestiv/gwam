<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RevealInterest extends Model
{
  protected $fillable = ['message_id', 'requester_user_id', 'status'];

  public function message()
  {
    return $this->belongsTo(Message::class);
  }

  public function requester()
  {
    return $this->belongsTo(User::class , 'requester_user_id');
  }
}
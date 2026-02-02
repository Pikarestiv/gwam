<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
  protected $fillable = [
    'message_id', 'room_message_id', 'reporter_user_id',
    'reporter_ip', 'reason', 'extra_detail',
    'status', 'admin_note',
  ];

  public function message()
  {
    return $this->belongsTo(Message::class);
  }

  public function roomMessage()
  {
    return $this->belongsTo(RoomMessage::class);
  }

  public function reporter()
  {
    return $this->belongsTo(User::class , 'reporter_user_id');
  }
}
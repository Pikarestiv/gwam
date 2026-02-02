<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
  protected $fillable = [
    'recipient_id', 'content', 'is_flagged', 'is_read', 'read_at',
    'reply_text', 'replied_at', 'sender_email', 'sender_token',
    'sender_ip', 'sender_country', 'sender_city',
    'sender_device', 'sender_browser',
    'is_deleted', 'deleted_at', 'delete_scheduled_at',
  ];

  protected $casts = [
    'is_flagged' => 'boolean',
    'is_read' => 'boolean',
    'is_deleted' => 'boolean',
    'read_at' => 'datetime',
    'replied_at' => 'datetime',
    'deleted_at' => 'datetime',
    'delete_scheduled_at' => 'datetime',
  ];

  public function recipient()
  {
    return $this->belongsTo(User::class , 'recipient_id');
  }

  public function senderInterest()
  {
    return $this->hasOne(SenderInterest::class);
  }

  public function revealInterests()
  {
    return $this->hasMany(RevealInterest::class);
  }

  public function reports()
  {
    return $this->hasMany(Report::class);
  }

  public function scopeActive($query)
  {
    return $query->where('is_deleted', false)->where('is_flagged', false);
  }

  public function scopeUnread($query)
  {
    return $query->where('is_read', false);
  }
}
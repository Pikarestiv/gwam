<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockedIp extends Model
{
  protected $fillable = ['ip_address', 'reason', 'flag_count', 'expires_at', 'blocked_by_admin_id'];

  protected $casts = ['flag_count' => 'integer', 'expires_at' => 'datetime'];

  public function blockedByAdmin()
  {
    return $this->belongsTo(Admin::class , 'blocked_by_admin_id');
  }
}
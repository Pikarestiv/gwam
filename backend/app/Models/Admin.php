<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
  use HasApiTokens;

  protected $fillable = ['name', 'email', 'password', 'role', 'last_login_at'];

  protected $hidden = ['password', 'remember_token'];

  protected $casts = [
    'last_login_at' => 'datetime',
  ];

  public function announcements()
  {
    return $this->hasMany(Announcement::class , 'created_by');
  }
}
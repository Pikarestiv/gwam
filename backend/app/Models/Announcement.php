<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
  protected $fillable = ['content', 'is_active', 'created_by'];

  protected $casts = ['is_active' => 'boolean'];

  public function creator()
  {
    return $this->belongsTo(Admin::class , 'created_by');
  }
}
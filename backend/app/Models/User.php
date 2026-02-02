<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password',
        'avatar_seed', 'bio', 'email_verified_at',
        'inbox_active', 'theme_preference',
        'message_retention_months', 'is_suspended',
        'suspended_reason', 'suspended_at', 'last_login_at',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'inbox_active' => 'boolean',
        'is_suspended' => 'boolean',
        'last_login_at' => 'datetime',
        'suspended_at' => 'datetime',
        'message_retention_months' => 'integer',
    ];

    // Relationships
    public function messages()
    {
        return $this->hasMany(Message::class , 'recipient_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class , 'owner_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function revealInterests()
    {
        return $this->hasMany(RevealInterest::class , 'requester_user_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_suspended', false);
    }

    public function isVerified(): bool
    {
        return !is_null($this->email_verified_at);
    }
}
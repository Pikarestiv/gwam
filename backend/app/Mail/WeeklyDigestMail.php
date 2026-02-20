<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WeeklyDigestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly int $unreadCount
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "You have {$this->unreadCount} unread Gwams waiting 👻");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.weekly-digest');
    }
}
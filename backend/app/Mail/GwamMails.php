<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly User $recipient) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "You have a new Gwam 👻");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new-message');
    }
}

class MessageReadMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly string $recipientUsername) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Your anonymous message was read 👀");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.message-read');
    }
}

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $token,
        public readonly string $email
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Reset your Gwam password');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.password-reset');
    }
}

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
    public User $user;
    public int $unreadCount;

    public function __construct(User $user, int $unreadCount)
    {
        $this->user = $user;
        $this->unreadCount = $unreadCount;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "You have {$this->unreadCount} unread Gwams waiting 👻");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.weekly-digest');
    }
}
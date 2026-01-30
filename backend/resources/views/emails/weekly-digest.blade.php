<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>Unread Gwams waiting</title>
</head>

<body style="font-family: sans-serif; background: #0a0a0f; color: #e2e8f0; padding: 40px; text-align: center;">
  <div
    style="max-width: 480px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 40px; border: 1px solid #7c3aed33;">
    <div style="font-size: 48px; margin-bottom: 16px;">👻</div>
    <h1 style="color: #7c3aed; margin: 0 0 8px;">{{ $unreadCount }} Gwam{{ $unreadCount > 1 ? 's' : '' }} waiting for
      you</h1>
    <p style="color: #94a3b8; margin: 0 0 32px;">Hi {{ $user->name }}, people have been sending you anonymous messages.
      Come see what they said!</p>
    <a href="{{ config('app.frontend_url') }}/inbox"
      style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">Read
      your Gwams →</a>
    <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Gwam anything. No names, no judgment.</p>
    <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;">
    <p style="color: #475569; font-size: 12px;">Made with 💜 by <a href="https://dumostech.com"
        style="color: #7c3aed;">Dumostech</a> · <a href="{{ config('app.frontend_url') }}/settings"
        style="color: #475569;">Unsubscribe</a></p>
  </div>
</body>

</html>
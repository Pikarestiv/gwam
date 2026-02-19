<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Someone tried to send you a Gwam!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 480px;
      margin: 0 auto;
      background: #1e293b;
      border-radius: 16px;
      padding: 32px;
      border: 1px solid #334155;
    }

    .ghost {
      font-size: 48px;
      text-align: center;
      margin-bottom: 16px;
    }

    h1 {
      color: #f8fafc;
      font-size: 22px;
      text-align: center;
      margin: 0 0 8px;
    }

    p {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.6;
      text-align: center;
    }

    .btn {
      display: block;
      margin: 24px auto 0;
      background: #3b82f6;
      color: #fff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      max-width: 240px;
    }

    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: #475569;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="ghost">👻</div>
    <h1>Someone tried to Gwam you!</h1>
    <p>
      Hey <strong>{{ $user->name }}</strong>!<br><br>
      Someone visited your Gwam link at
      <strong>app.gwam.dumostech.com/u/{{ $user->username }}</strong>
      and wanted to send you an anonymous message — but couldn't because your inbox isn't activated yet.
    </p>
    <p style="margin-top: 16px;">
      Verify your email to unlock your inbox and start receiving anonymous messages!
    </p>
    <a href="{{ env('FRONTEND_URL', 'https://app.gwam.dumostech.com') }}/verify-email" class="btn">
      Activate My Inbox →
    </a>
    <div class="footer">
      You're receiving this because someone tried to contact @{{ $user->username }} on Gwam.<br>
      If you didn't sign up, you can safely ignore this email.
    </div>
  </div>
</body>

</html>
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>Verify your Gwam email</title>
</head>

<body style="font-family: sans-serif; background: #0a0a0f; color: #e2e8f0; padding: 40px; text-align: center;">
  <div
    style="max-width: 480px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 40px; border: 1px solid #7c3aed33;">
    <div style="font-size: 48px; margin-bottom: 16px;">👻</div>
    <h1 style="color: #7c3aed; margin: 0 0 8px;">Verify your email</h1>
    <p style="color: #94a3b8; margin: 0 0 32px;">Hi {{ $userName }}, enter this code in the app to activate your Gwam
      inbox.</p>
    <div
      style="background: #0a0a0f; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #7c3aed; margin-bottom: 24px;">
      {{ $otp }}
    </div>
    <p style="color: #64748b; font-size: 13px;">This code expires in 30 minutes. If you didn't create a Gwam account,
      ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;">
    <p style="color: #475569; font-size: 12px;">Made with 💜 by <a href="https://dumostech.com"
        style="color: #7c3aed;">Dumostech</a></p>
  </div>
</body>

</html>
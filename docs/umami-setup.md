# Umami Analytics Setup Guide

Gwam uses [Umami](https://umami.is) for privacy-friendly analytics. Since we are on Namecheap shared hosting, we can self-host Umami using Node.js via cPanel "Setup Node.js App".

## Prerequisites
1. Namecheap cPanel access
2. A subdomain for analytics (e.g., `stats.gwam.dumostech.com`)
3. A MySQL database created in cPanel

## Installation Steps

### 1. Create Database
- Go to **MySQL Database Wizard** in cPanel.
- Create a database (e.g., `gwam_umami`).
- Create a user and grant ALL PRIVILEGES.

### 2. Install Umami
- Go to **Setup Node.js App** in cPanel.
- Click **Create Application**.
  - **Node.js version**: 18.x or 20.x
  - **Application mode**: Production
  - **Application root**: `analytics`
  - **Application URL**: `stats.gwam.dumostech.com`
  - **Startup file**: `yarn start` (we will configure this next)
- Click **Create**.

### 3. Configure Env
- Enter the virtual environment source (copy the command provided in cPanel).
- Run:
  ```bash
  git clone https://github.com/umami-software/umami.git .
  yarn install
  ```
- Create `.env` file in the root:
  ```env
  DATABASE_URL=mysql://user:password@localhost:3306/gwam_umami
  APP_SECRET=random-string-here-32-chars
  ```

### 4. Build & Start
- Run `yarn build` inside the SSH terminal.
- Go back to cPanel Node.js app page.
- Reload the page / Restart the app.

## Integration

1. Login to your new Umami instance (`https://stats.gwam.dumostech.com`).
2. Add a website: `Gwam App` (Domain: `app.gwam.dumostech.com`).
3. Copy the tracking code.
4. Add the tracking code to `frontend/app/layout.tsx` and `landing/index.html`.

### Custom Events
Gwam is pre-configured to track these custom events:
- `message_sent`
- `room_created`
- `ad_interstitial_shown`
- `ad_banner_click`
- `profile_share`

No extra code needed — just check your Umami dashboard.

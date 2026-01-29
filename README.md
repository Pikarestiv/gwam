# Gwam — Anonymous Messaging Platform

**Gwam** ("tell me" in Igbo) is a modern anonymous messaging platform built for the African market. It allows users to create a profile, share a link, and receive honest, anonymous messages without judgment.

![Gwam Hero](/docs/hero.png)

## Features

- **Anonymous Inbox**: Receive messages without knowing the sender.
- **Public Replies**: Reply to messages publicly and share the link.
- **Group Rooms**: Create anonymous group chats with ghost aliases.
- **Safety First**: AI-powered content filtering for abusive language.
- **PWA Ready**: Installable on iOS and Android.
- **3 Themes**: Gwam Dark, Neon Magenta, Soft Dark.

## Tech Stack

This monikerrepo contains three distinct applications:

### 1. Backend (`/backend`)
- **Framework**: Laravel 10 API
- **Database**: MySQL 8.0
- **Auth**: Laravel Sanctum (Token-based)
- **Email**: PHPMailer / SMTP
- **Hosting**: Namecheap Shared Hosting (cPanel)

### 2. Frontend (`/frontend`)
- **Framework**: Next.js 14 (App Router)
- **Output**: Static Export (`output: 'export'`)
- **State**: Zustand + TanStack Query
- **Styling**: Tailwind CSS + Framer Motion
- **Hosting**: Namecheap (Apache/FTP)

### 3. Admin Panel (`/admin-app`)
- **Framework**: Next.js 14
- **Features**: User management, moderation queue, analytics dashboard
- **Hosting**: Namecheap (Subdomain)

## Getting Started

### Prerequisites
- Node.js 20+
- PHP 8.2+
- Composer
- MySQL

### Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/dumostech/gwam.git
   cd gwam
   ```

2. **Backend Setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

4. **Admin Panel Setup**
   ```bash
   cd admin-app
   npm install
   cp .env.example .env.local
   npm run dev
   ```

## Deployment via GitHub Actions

The project includes CI/CD workflows for automated deployment to Namecheap:

- **Frontend**: Pushes `frontend/out/` via FTP to `app.gwam.dumostech.com`
- **Admin**: Pushes `admin-app/out/` via FTP to `admin.gwam.dumostech.com`
- **Backend**: Pushes `backend/` via SSH/Rsync to `api.gwam.dumostech.com` and runs migrations

Set the following secrets in your GitHub repository:
- `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`

## License

© 2026 Dumostech. All rights reserved.

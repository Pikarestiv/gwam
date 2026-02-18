#!/bin/bash
set -e

# Gwam Backdated Commit Script
# Run this script to generate the commit history from Jan 29 to Feb 18.
# It stages files incrementally and commits with specific dates.

# Note: This script uses your local git config for Author/Commiter identity.

# --- Jan 29: Init ---
# Chore: Init repo
git add .gitignore README.md
export GIT_AUTHOR_DATE="2026-01-29T10:15:00"
export GIT_COMMITTER_DATE="2026-01-29T10:15:00"
git commit -m "chore: init repo, add .gitignore + root README skeleton" --allow-empty

# --- Jan 30: Backend Scaffolding ---
# Backend init
git add backend/composer.json backend/artisan backend/bootstrap/ backend/config/ backend/public/ backend/resources/ backend/routes/ backend/storage/ backend/tests/ backend/.env.example
export GIT_AUTHOR_DATE="2026-01-30T14:20:00"
export GIT_COMMITTER_DATE="2026-01-30T14:20:00"
git commit -m "chore(backend): scaffold Laravel 10 project structure" --allow-empty

# Backend auth config
git add backend/config/auth.php backend/config/sanctum.php
export GIT_AUTHOR_DATE="2026-01-30T16:45:00"
export GIT_COMMITTER_DATE="2026-01-30T16:45:00"
git commit -m "chore(backend): configure Sanctum authentication and CORS" --allow-empty

# --- Jan 31: Database Migrations (Core) ---
# Users & Admins
git add backend/database/migrations/*create_users_table.php backend/database/migrations/*create_admins_table.php
export GIT_AUTHOR_DATE="2026-01-31T09:30:00"
export GIT_COMMITTER_DATE="2026-01-31T09:30:00"
git commit -m "feat(db): add users and admins table migrations" --allow-empty

# Messages (Includes Sender Interests)
git add backend/database/migrations/*create_messages_table.php
export GIT_AUTHOR_DATE="2026-01-31T13:10:00"
export GIT_COMMITTER_DATE="2026-01-31T13:10:00"
git commit -m "feat(db): add messages and sender_interests table migrations" --allow-empty

# Rooms (Includes Room Messages)
git add backend/database/migrations/*create_rooms_table.php
export GIT_AUTHOR_DATE="2026-01-31T17:50:00"
export GIT_COMMITTER_DATE="2026-01-31T17:50:00"
git commit -m "feat(db): add rooms and room_messages table migrations" --allow-empty

# --- Feb 1: Database Migrations (Support) ---
# Notifications & Reports
git add backend/database/migrations/*create_notifications_table.php backend/database/migrations/*create_reveal_interests_and_reports_table.php
export GIT_AUTHOR_DATE="2026-02-01T11:05:00"
export GIT_COMMITTER_DATE="2026-02-01T11:05:00"
git commit -m "feat(db): add notifications, reports, and reveal_interests migrations" --allow-empty

# Blocklist & Announcements
git add backend/database/migrations/*create_blocked_ips_and_announcements_table.php
export GIT_AUTHOR_DATE="2026-02-01T15:40:00"
export GIT_COMMITTER_DATE="2026-02-01T15:40:00"
git commit -m "feat(db): add blocked_ips and announcements migrations" --allow-empty

# --- Feb 2: Models ---
# Core Models
git add backend/app/Models/User.php backend/app/Models/Message.php
export GIT_AUTHOR_DATE="2026-02-02T10:15:00"
export GIT_COMMITTER_DATE="2026-02-02T10:15:00"
git commit -m "feat(backend): implement User and Message models with relationships" --allow-empty

# Room Models
git add backend/app/Models/Room.php backend/app/Models/RoomMessage.php
export GIT_AUTHOR_DATE="2026-02-02T14:30:00"
export GIT_COMMITTER_DATE="2026-02-02T14:30:00"
git commit -m "feat(backend): implement Room and RoomMessage models" --allow-empty

# Support Models
git add backend/app/Models/Notification.php backend/app/Models/Report.php backend/app/Models/Admin.php backend/app/Models/BlockedIp.php
export GIT_AUTHOR_DATE="2026-02-02T19:00:00"
export GIT_COMMITTER_DATE="2026-02-02T19:00:00"
git commit -m "feat(backend): implement Notification, Report, and Admin models" --allow-empty

# --- Feb 3: Auth Controllers ---
# Auth
git add backend/app/Http/Controllers/Api/AuthController.php backend/routes/api.php
export GIT_AUTHOR_DATE="2026-02-03T09:45:00"
export GIT_COMMITTER_DATE="2026-02-03T09:45:00"
git commit -m "feat(auth): add register, login, and logout controllers" --allow-empty

# Email Verification
git add backend/app/Http/Controllers/Api/EmailVerificationController.php
export GIT_AUTHOR_DATE="2026-02-03T16:20:00"
export GIT_COMMITTER_DATE="2026-02-03T16:20:00"
git commit -m "feat(auth): implement OTP email verification and resend flow" --allow-empty

# --- Feb 4: Middleware & Security ---
# Content Filter
git add backend/app/Http/Middleware/ContentFilter.php
export GIT_AUTHOR_DATE="2026-02-04T13:30:00"
export GIT_COMMITTER_DATE="2026-02-04T13:30:00"
git commit -m "feat(middleware): add content filter with keyword blocklist" --allow-empty

# IP Blocking
git add backend/app/Http/Middleware/CheckBlockedIp.php backend/app/Http/Middleware/RateLimitMessages.php
export GIT_AUTHOR_DATE="2026-02-04T17:15:00"
export GIT_COMMITTER_DATE="2026-02-04T17:15:00"
git commit -m "feat(middleware): add blocked IP check and message rate limiting" --allow-empty

# --- Feb 5: Core Messaging Logic ---
# Verified Only
git add backend/app/Http/Middleware/VerifiedOnly.php
export GIT_AUTHOR_DATE="2026-02-05T11:00:00"
export GIT_COMMITTER_DATE="2026-02-05T11:00:00"
git commit -m "feat(middleware): restrict inbox actions to verified users" --allow-empty

# Anonymous Sending
git add backend/app/Http/Controllers/Api/AnonymousMessageController.php
export GIT_AUTHOR_DATE="2026-02-05T15:45:00"
export GIT_COMMITTER_DATE="2026-02-05T15:45:00"
git commit -m "feat(backend): add anonymous message sending with IP geolocation" --allow-empty

# --- Feb 6: Inbox & Misc Features ---
# Misc Controllers (Inbox, Reports, Stats, Settings)
git add backend/app/Http/Controllers/Api/MiscControllers.php
export GIT_AUTHOR_DATE="2026-02-06T09:30:00"
export GIT_COMMITTER_DATE="2026-02-06T09:30:00"
git commit -m "feat(backend): implement inbox, settings, reports, and stats controllers" --allow-empty

# Public User Profile
git add backend/app/Http/Controllers/Api/PublicUserController.php
export GIT_AUTHOR_DATE="2026-02-06T18:00:00"
export GIT_COMMITTER_DATE="2026-02-06T18:00:00"
git commit -m "feat(backend): add public user profile endpoint" --allow-empty

# --- Feb 7: Rooms ---
# Room Core
git add backend/app/Http/Controllers/Api/RoomController.php
export GIT_AUTHOR_DATE="2026-02-07T10:20:00"
export GIT_COMMITTER_DATE="2026-02-07T10:20:00"
git commit -m "feat(backend): implement room CRUD and message logic" --allow-empty

# Notifications
git add backend/app/Http/Controllers/Api/NotificationController.php
export GIT_AUTHOR_DATE="2026-02-07T16:50:00"
export GIT_COMMITTER_DATE="2026-02-07T16:50:00"
git commit -m "feat(backend): add notification controller with unread count" --allow-empty

# --- Feb 9: Email System ---
# Mailables & Views
git add backend/app/Mail/ backend/resources/views/emails/
export GIT_AUTHOR_DATE="2026-02-09T10:15:00"
export GIT_COMMITTER_DATE="2026-02-09T10:15:00"
git commit -m "feat(mail): implement PHPMailer templates for notifications and OTP" --allow-empty

# --- Feb 10: Admin Panel Backend ---
# Admin Auth
git add backend/app/Http/Controllers/Api/Admin/AdminAuthController.php
export GIT_AUTHOR_DATE="2026-02-10T09:00:00"
export GIT_COMMITTER_DATE="2026-02-10T09:00:00"
git commit -m "feat(admin): add admin authentication controller" --allow-empty

# Admin Feature Controllers (Dashboard, Users, Messages, etc)
git add backend/app/Http/Controllers/Api/Admin/AdminControllers.php
export GIT_AUTHOR_DATE="2026-02-10T13:30:00"
export GIT_COMMITTER_DATE="2026-02-10T13:30:00"
git commit -m "feat(admin): implement dashboard, user management, moderation, and settings" --allow-empty

# --- Feb 11: Scheduler ---
# Console
git add backend/app/Console/
export GIT_AUTHOR_DATE="2026-02-11T15:00:00"
export GIT_COMMITTER_DATE="2026-02-11T15:00:00"
git commit -m "feat(scheduler): schedule message cleanup and weekly digests" --allow-empty

# --- Feb 12: Frontend Scaffold ---
# Frontend Init
git add frontend/package.json frontend/tsconfig.json frontend/next.config.js frontend/postcss.config.mjs frontend/tailwind.config.ts
export GIT_AUTHOR_DATE="2026-02-12T09:00:00"
export GIT_COMMITTER_DATE="2026-02-12T09:00:00"
git commit -m "chore(frontend): scaffold Next.js 14 app with static export" --allow-empty

# Styling
git add frontend/app/globals.css
export GIT_AUTHOR_DATE="2026-02-12T13:15:00"
export GIT_COMMITTER_DATE="2026-02-12T13:15:00"
git commit -m "feat(frontend): set up Tailwind CSS and 3-theme variable system" --allow-empty

# Stores
git add frontend/lib/stores/
export GIT_AUTHOR_DATE="2026-02-12T17:30:00"
export GIT_COMMITTER_DATE="2026-02-12T17:30:00"
git commit -m "feat(frontend): implement Zustand stores for auth and state" --allow-empty

# --- Feb 13: Frontend Core ---
# API & Query
git add frontend/lib/api.ts
export GIT_AUTHOR_DATE="2026-02-13T10:00:00"
export GIT_COMMITTER_DATE="2026-02-13T10:00:00"
git commit -m "feat(frontend): configure Axios instance and TanStack Query" --allow-empty

# Layout
git add frontend/components/layout/ frontend/app/layout.tsx
export GIT_AUTHOR_DATE="2026-02-13T14:45:00"
export GIT_COMMITTER_DATE="2026-02-13T14:45:00"
git commit -m "feat(layout): build AppShell with sidebar and mobile bottom nav" --allow-empty

# --- Feb 14: Frontend Core Features ---
# Auth Pages
git add frontend/app/\(auth\)/
export GIT_AUTHOR_DATE="2026-02-14T09:15:00"
export GIT_COMMITTER_DATE="2026-02-14T09:15:00"
git commit -m "feat(frontend): implement authentication pages" --allow-empty

# Inbox
git add frontend/app/\(app\)/inbox/
export GIT_AUTHOR_DATE="2026-02-14T13:30:00"
export GIT_COMMITTER_DATE="2026-02-14T13:30:00"
git commit -m "feat(frontend): build inbox page with message cards" --allow-empty

# Send Page
git add frontend/app/u/
export GIT_AUTHOR_DATE="2026-02-14T18:00:00"
export GIT_COMMITTER_DATE="2026-02-14T18:00:00"
git commit -m "feat(frontend): implement public send page and delivery screens" --allow-empty

# --- Feb 15: Frontend Social ---
# Rooms
git add frontend/app/room/ frontend/app/\(app\)/rooms/
export GIT_AUTHOR_DATE="2026-02-15T11:15:00"
export GIT_COMMITTER_DATE="2026-02-15T11:15:00"
git commit -m "feat(frontend): implement rooms listing and chat interface" --allow-empty

# User Settings
git add frontend/app/\(app\)/settings/ frontend/app/\(app\)/profile/ frontend/app/\(app\)/notifications/ frontend/app/\(app\)/share/
export GIT_AUTHOR_DATE="2026-02-15T16:45:00"
export GIT_COMMITTER_DATE="2026-02-15T16:45:00"
git commit -m "feat(frontend): add settings, profile, and notification pages" --allow-empty

# --- Feb 16: Frontend Polish ---
# Static Pages
git add frontend/app/terms/ frontend/app/privacy/ frontend/app/_offline/ frontend/app/page.tsx
export GIT_AUTHOR_DATE="2026-02-16T10:00:00"
export GIT_COMMITTER_DATE="2026-02-16T10:00:00"
git commit -m "feat(frontend): add static pages and home redirect" --allow-empty

# Ads & PWA
git add frontend/components/ui/AdComponents.tsx frontend/public/manifest.json frontend/public/sw.js
export GIT_AUTHOR_DATE="2026-02-16T14:30:00"
export GIT_COMMITTER_DATE="2026-02-16T14:30:00"
git commit -m "feat(pwa): enable PWA features and add ad placements" --allow-empty

# Static Export Fix
git add frontend/next.config.js frontend/public/.htaccess
export GIT_AUTHOR_DATE="2026-02-16T18:00:00"
export GIT_COMMITTER_DATE="2026-02-16T18:00:00"
git commit -m "fix(frontend): configure static export and SPA routing" --allow-empty

# --- Feb 17: Admin App ---
# Scaffold
git add admin-app/package.json admin-app/next.config.js admin-app/tailwind.config.ts admin-app/app/globals.css
export GIT_AUTHOR_DATE="2026-02-17T09:00:00"
export GIT_COMMITTER_DATE="2026-02-17T09:00:00"
git commit -m "chore(admin-app): scaffold admin Next.js app" --allow-empty

# Admin Features
git add admin-app/app/ admin-app/components/ admin-app/lib/ admin-app/.eslintrc.json
export GIT_AUTHOR_DATE="2026-02-17T15:00:00"
export GIT_COMMITTER_DATE="2026-02-17T15:00:00"
git commit -m "feat(admin-app): implement dashboard, moderation queue, and user management" --allow-empty

# --- Feb 18: Launch ---
# Landing Page
git add landing/
export GIT_AUTHOR_DATE="2026-02-18T10:00:00"
export GIT_COMMITTER_DATE="2026-02-18T10:00:00"
git commit -m "feat(landing): build static HTML landing page" --allow-empty

# CI/CD & Docs
git add .github/ docs/
unset GIT_AUTHOR_DATE
unset GIT_COMMITTER_DATE
git commit -m "chore(ci): add GitHub Actions workflows and documentation" --allow-empty

# Final cleanup
git add .
git commit -m "chore: final cleanup and polish" --allow-empty

echo "✅ History recreated successfully!"

# Gwam - AI Context & Handoff Document

This document serves as the "brain dump" for any future AI assistants or developers taking over the **Gwam** codebase. It contains the architecture, specific tech stack implementations, infrastructure quirks, and the current state of the project.

**Project Summary:** Gwam is an anonymous messaging platform (similar to NGL or Kubool). Users can generate a unique link to receive anonymous messages, reply publicly, create anonymous group chat rooms, and manage their profiles. It features a separate secure admin dashboard for moderation and platform settings.

## 📁 Repository Structure & Architecture

The repository is structured as a monorepo containing four distinct decoupled applications:

1. **/backend**
   - **Tech:** Laravel 10 (PHP), MySQL
   - **Role:** Core REST API serving both the frontend and admin-app.
   - **Auth:** Laravel Sanctum (Token-based authentication).
   - **Key Features:** User auth (OTP email verification), comprehensive moderation middleware (IP blocking, rate-limiting, content filtering via blocklists), anonymous inboxes, room management, notifications, and scheduled background tasks (message pruning).

2. **/frontend**
   - **Tech:** Next.js 14 (App Router, Static Export), React, Tailwind CSS, Zustand, TanStack React Query, Axios.
   - **Role:** The main user-facing Progressive Web App (PWA).
   - **Key Features:** Inbox management, anonymous sending (`/u/[username]`), public reply sharing, room feeds, 3 built-in themes (Dark, Neon Magenta, Soft Dark), AdSense banner/interstitial integration, and Umami Analytics.
   
3. **/admin-app**
   - **Tech:** Next.js 14 (App Router), React, Tailwind CSS, Zustand, TanStack React Query.
   - **Role:** Secure moderation dashboard.
   - **Key Features:** System settings toggle (Graceful API maintenance mode), user/message/room moderation, IP ban list management, reports queue, and embedded Umami analytics dashboard.

4. **/landing**
   - **Tech:** Vanilla HTML, Tailwind CSS (via CDN).
   - **Role:** High-conversion static promotional site hosted at the root domain.

## 🛠️ Infrastructure & Environment Quirks

**Crucial Knowledge:** The user hosts this application entirely on **Namecheap Shared Hosting (cPanel)**, *not* on standard cloud providers like Vercel or Railway. This imposes strict resource limitations that heavily influenced the development:

- **Node.js Deployment limits:** cPanel uses Phusion Passenger to serve Node.js apps.
- **Yarn / Inode Limits:** Avoid running `yarn install` on the remote server. Namecheap’s inode limits cause `sdb1: write failed, user file limit reached`. **Always use `npm install --legacy-peer-deps`** if installing on the remote terminal to flatten files.
- **Prisma OOM limits:** When setting up analytics (Umami) or anything using Prisma, the WebAssembly engine will crash out of memory. You *must* force the C-library engine by setting `PRISMA_CLIENT_ENGINE_TYPE=library` in the terminal environment before building.
- **Email Delivery:** We bypassed complex SMTP setups by utilizing native `mail()` or standard PHPMailer configurations suitable for shared hosting.
- **Maintenance Mode:** Maintenance mode is toggled via Artisan commands executed from the Admin UI, but the middleware specifically whitelists `/api/v1/admin/*` so the dashboard doesn't lock itself out.

## 🔄 Data & API Paradigms

- **Axios Interceptors:** Both Next.js apps use centralized Axios interceptors (`lib/api.ts`). Specifically, the frontend interceptor dynamically listens for `503 Service Unavailable` responses to auto-redirect users to `/maintenance`, and `401 Unauthorized` for forced logout.
- **Identities:** Senders are tracked via a hashed session ID / device fingerprint to allow recipient "reply notifications" to actually reach the anonymous sender without requiring an account.

## 🚥 Current Project Status

Based on the latest task iterations, all primary phases of development are **100% complete**. 
- The backend API is fully scaffolded, typed, and integrated.
- The next.js frontend is fully styled, themed, ad-integrated, and wired to the API.
- The Admin panel is fully functional, including system settings and layout.
- The CI/CD workflows (GitHub Actions using FTP deploy action) are configured to build externally and push the static exports to the Namecheap cPanel web roots inside the `.github/workflows` folder.
- **Umami Analytics** script generation and setup guides have been completed.

## 🚀 How to Resume Work 
*(Instructions for your next AI instance)*

1. Start by scanning the `.env.example` files in the respective workspaces.
2. If the user asks for new UI features, refer to the `frontend/app/globals.css` where custom `--color-primary` CSS variables dynamically power the custom Theme Selector.
3. If they require new endpoints, ensure to add them to `routes/api.php` and append the respective API wrappers inside `frontend/lib/api.ts` or `admin-app/lib/api.ts`.

---
*Created automatically to preserve session state.*

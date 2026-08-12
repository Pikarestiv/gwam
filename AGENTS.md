# AGENTS.md — Gwam

Instructions and context for any AI coding agent (Claude, Codex, etc.) working in this repo. Read this before making changes. A companion file, `AI_CONTEXT.md`, exists from an earlier session — this file supersedes it where they disagree (several things in `AI_CONTEXT.md` are now stale, noted below).

## What Gwam is

Anonymous messaging platform (NGL/Kubool-style). Users get a shareable link (`/u/[username]`), receive anonymous messages, can reply publicly, and can create anonymous group chat rooms. There's a separate admin dashboard for moderation. Monetized via AdSense; **no payment/billing system exists yet** — anywhere you see "Pro" or "paid" in the UI, it's a locked/disabled placeholder for a future tier, not a real gate.

"Room" and "group" mean the same thing. The code, DB, and API consistently use **Room** (`Room` model, `rooms` table, `/rooms` routes, `/room/[code]` frontend route). Don't introduce a separate "Group" concept — "group" is just the colloquial name people use for it in conversation.

## Repo structure (monorepo, 4 independent apps)

```
backend/     Laravel 10 (PHP 8.1+), MySQL — REST API for frontend + admin-app
frontend/    Next.js 14, static export (output: "export") — user-facing PWA
admin-app/   Next.js 14, static export — moderation dashboard
landing/     Vanilla HTML + Tailwind CDN — marketing site at the root domain
```

Each has its own `package.json`/`composer.json` and its own GitHub Actions workflow in `.github/workflows/` (`backend.yml`, `frontend.yml`, `admin.yml`, `landing.yml`), triggered on push to `main` scoped by path.

## Deployment targets (Namecheap shared hosting, cPanel + CloudLinux + **LiteSpeed**, not Apache)

| App | How | Where |
|---|---|---|
| `landing/` | FTP | `gwam.dumostech.com` (root) |
| `admin-app/` | FTP, static export with `basePath: "/admin"` | `gwam.dumostech.com/admin` (nested under landing's docroot — **not** a separate subdomain anymore, changed 2026-08) |
| `frontend/` | FTP, static export | `app.gwam.dumostech.com` |
| `backend/` | SSH/rsync + post-deploy script | `api.gwam.dumostech.com` |

**Important, hard-won infra facts** — these cost real debugging time, don't rediscover them:

1. **This server runs LiteSpeed, not Apache**, even though it's cPanel. `.htaccess` PHP-version directives must use LiteSpeed's syntax:
   ```apache
   <IfModule Litespeed>
       AddHandler application/x-httpd-alt-php81___lsphp .php
   </IfModule>
   ```
   The Apache/EasyApache4 equivalent (`SetHandler application/x-httpd-ea-php81`) is silently ignored — it does nothing on this host and will NOT throw an error, it just fails quietly.

2. **CLI PHP and web PHP are configured separately** and can be different versions. The account's default SSH `php` was found running 7.4.33 even after the web-facing `.htaccess` fix was correct. Backend requires PHP `^8.1` (see `backend/composer.json`). The confirmed-working CLI binary path on this server is **`/opt/alt/php81/usr/bin/php`** (CloudLinux `alt-php` layout — `/opt/cpanel/ea-phpXX/...` also exists but is a different, cPanel-UI-facing path; use `/opt/alt/`). `.github/workflows/backend.yml`'s post-deploy SSH step explicitly invokes this binary and bootstraps a local `composer.phar` (Composer isn't in the default SSH PATH at all). If PHP version issues resurface, check both the `.htaccess` handler AND the CLI binary path independently — fixing one does not fix the other.

3. **Laravel's scheduler cron job has not been audited for the same PHP-version pitfall.** `backend/app/Console/Kernel.php` schedules `gwam:delete-expired-messages`, `gwam:archive-inactive-rooms` (daily), and `gwam:weekly-digest` (weekly). This only actually runs if cPanel has a Cron Job entry running `php artisan schedule:run` every minute — and if that cron entry uses the account's default `php` (7.4), it will fail the same way the deploy script did. **Nobody has verified this.** If room expiry or message pruning seem to not be happening, check the cPanel Cron Jobs entry uses `/opt/alt/php81/usr/bin/php`, not bare `php`.

4. **DNS for `gwam.dumostech.com` is hosted at Namecheap** (`dns1/dns2.registrar-servers.com`), **not** on the cPanel server. cPanel's "Email Deliverability" page will offer to "Install suggested record" for SPF/DKIM/DMARC — **do not use that button**, it writes to a DNS zone nothing queries. Add records manually via Namecheap → Domain List → Manage `dumostech.com` → Advanced DNS. As of 2026-08, DKIM/SPF/DMARC TXT records were added for the `gwam` subdomain (SPF IP `68.65.120.104`, confirmed via the domain's own PTR record — don't trust `curl ifconfig.me` on the server for this, it returns the general web-egress IP which was a different, irrelevant address).

5. **Static export + dynamic routes need manual `.htaccess` rewrite rules.** Both `frontend` and `admin-app` use `output: "export"` with `trailingSlash: true`. Dynamic route pages (e.g. `app/room/[code]/page.tsx`, `app/u/[username]/page.tsx`) use `generateStaticParams()` returning a single placeholder (`{ code: "_" }` / `{ username: "_" }`), producing one template HTML file (`out/room/_/index.html`) that the client-side router repopulates from the real URL. This **only works for in-app client-side navigation**. Any hard navigation (page reload, opening a link in a new tab, a bookmarked/shared URL) hits the server directly and needs an explicit rewrite rule in `frontend/public/.htaccess` mapping the real path pattern to the `_` template, e.g.:
   ```apache
   RewriteRule ^room/[^/]+/?$ /room/_/index.html [L,QSA]
   ```
   **This was missing for `/room/[code]` and caused a real bug**: clicking a room from a hard-navigation context fell through to the generic SPA fallback (`/index.html`), which auto-redirects authenticated users to `/inbox` (see `frontend/app/page.tsx`) — this looked exactly like "rooms are broken" from the user's perspective but had nothing to do with room logic. **Whenever you add a new dynamic route to either static-export app, you must add a matching rewrite rule to that app's `.htaccess`, or hard navigations to it will silently misbehave.**

6. Production `.env` files on the server are **not** deployed by CI (`EXCLUDE` list in `backend.yml` excludes `/.env`). They're maintained manually and can drift from `.env.example`. When you change an env var's meaning or add a new one, update `.env.example` for documentation, but remember the actual server value needs manual updating too — it won't happen automatically.

## Backend architecture (`backend/`)

- Laravel 10, Sanctum for **token-based** (not cookie/session) auth.
- Models: `User`, `Admin`, `Room`, `RoomMessage`, `Message` (anonymous inbox messages), `Notification`, `BlockedIp`, `Report`, `Announcement`, `SenderInterest`, `RevealInterest`.
- Key middleware: `ContentFilter` (blocklist filtering), `RateLimitMessages`, `CheckBlockedIp`, `VerifiedOnly`, `PreventRequestsDuringMaintenance` (whitelists `/api/v1/admin/*` so the dashboard can't lock itself out).
- Rooms (`RoomController`): public `show`/`sendMessage` by room `code` (no auth needed to read/post — anonymous "ghost" identity derived from a client-generated `session_token`, consistently mapped to a ghost name via `crc32($token) % count($ghostNames)`); authenticated `index`/`store`/`update`/`destroy` by numeric `id` for the owner. Rooms have an `expires_at` (added 2026-08; free tier fixed at 24h via `Room::DURATION_OPTIONS`, longer durations rejected server-side pending a real payment system — don't build client-side-only enforcement for this). Expired/inactive rooms both 404 the same way; keep `show()` and `sendMessage()` error shapes consistent when you touch either (they diverged once already — `sendMessage()` used to throw via `firstOrFail()` while `show()` returned a custom JSON body for the same "not found" case).
- `gwam:archive-inactive-rooms` (scheduled daily) handles both 30-day-inactive archival and `expires_at`-based archival; hard-deletes rooms archived 6+ months.
- No test suite of consequence (`backend/tests/` has 4 files, default Laravel skeleton). Don't assume test coverage protects against regressions here — verify manually.

## Frontend conventions

- Both `frontend/` and `admin-app/` use Zustand for client state (`lib/stores/`), TanStack Query for server state, Axios with an interceptor in `lib/api.ts` (401 → logout/redirect, and in `frontend` only, 503 → `/maintenance` redirect).
- Theming: `frontend/app/globals.css` defines `--color-*` CSS variables; the in-app theme selector swaps these at runtime (3 built-in themes).
- Brand ghost icon: `frontend/components/ui/GhostSVG.tsx` is the canonical shape (also used to derive `public/icons/*.png` and both apps' `favicon.ico`, generated 2026-08 via ImageMagick from an SVG in the scratchpad — if you need to regenerate them, rebuild the ghost path at `viewBox="0 0 100 120"`, background `#0a0a0f`, ghost fill `#7c3aed`, keep ~30% padding on the maskable PWA icons so Android's circular mask doesn't clip it).

## Conventions for this session / this user

- **Don't add a `Co-Authored-By` / `Claude-Session` trailer to commits in this repo** — the user explicitly asked for this to stop (it was showing up as a confusing second author on GitHub).
- The user directly SSHes into the production server and pastes real command output/logs into the conversation — when debugging infra issues, ask for that output rather than guessing, and treat cPanel UI text (error messages, "Email Deliverability" panels, etc.) as ground truth over assumptions about typical shared-hosting setups.
- PHP files in this repo use **2-space indentation** (not PSR-12's 4-space), consistent throughout `backend/app/` — match it.

## How to extend things

- New API endpoint: add to `backend/routes/api.php`, controller method, then wire it into `frontend/lib/services.ts` or `admin-app/lib/api.ts` (whichever app needs it) — both keep a flat object of named API methods per resource (e.g. `roomsApi`), not one-off inline axios calls in components.
- New dynamic frontend route: remember the `.htaccess` rewrite rule (see infra fact #5 above) or it will break outside of client-side navigation.
- Check `.env.example` in each of `backend/`, `frontend/`, `admin-app/` before assuming what config exists — several env vars (`ADMIN_URL`, `SANCTUM_STATEFUL_DOMAINS`) were updated 2026-08 when admin moved off its own subdomain; the real server `.env` needs the same manual update (see infra fact #6).

## Known open items (as of 2026-08-12)

- Old `admin.gwam.dumostech.com` subdomain (FTP dir + DNS record) still needs manual cleanup now that admin lives at `/admin`.
- Cron job PHP version for the Laravel scheduler is unverified (infra fact #3) — worth checking if scheduled commands (room archival, message pruning, weekly digest) aren't actually firing.
- No real payment/subscription system — `Room::DURATION_OPTIONS` and the frontend's locked duration buttons are the only "Pro tier" scaffolding that exists; don't wire real billing without the user asking for it explicitly.

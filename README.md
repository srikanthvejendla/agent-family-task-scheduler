# Family Task Scheduler

A production-ready, multi-tenant SaaS web app that lets families organize, assign, schedule, and gamify household tasks.

## Features

- Multi-tenant household management with parent/child roles
- Task creation and assignment with recurring schedules (daily/weekly/monthly)
- Points and rewards system
- Calendar, dashboard, and activity feed
- Mobile-first responsive design with dark mode
- Installable PWA with offline support
- Web Push notifications

## Tech Stack

- **Framework:** Next.js 15 (App Router, standalone output)
- **Database:** PostgreSQL 16 (Docker)
- **ORM:** Drizzle
- **Auth:** Better Auth with organization plugin
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **PWA:** Serwist

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for Postgres)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env` and fill in required values:
   ```bash
   cp .env.example .env
   ```

4. Generate secrets:
   ```bash
   # Generate BETTER_AUTH_SECRET
   openssl rand -base64 32
   
   # Generate VAPID keys for Web Push
   npx web-push generate-vapid-keys
   ```

5. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```

6. Run migrations:
   ```bash
   pnpm db:migrate
   ```

7. Seed database with system templates:
   ```bash
   pnpm db:seed
   ```

### Development

```bash
pnpm dev
```

App runs on http://localhost:3000 (or `PORT` from `.env`)

### Production

Build standalone output:
```bash
pnpm build
```

Run production server:
```bash
pnpm start
```

Or use PM2:
```bash
pm2 start ecosystem.config.js
```

### Database Commands

- `pnpm db:migrate` - Run migrations
- `pnpm db:seed` - Seed system templates
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:generate` - Generate new migration

### Testing

```bash
# Unit + integration tests
pnpm test

# E2E tests
pnpm test:e2e
```

## Environment Variables

See `.env.example` for required variables:

- `PORT` - Server port (default: 8003)
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Session encryption key
- `BETTER_AUTH_URL` - Public app URL
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` - Web Push keys
- `SMTP_*` - Email configuration (optional, logs to console if unset)

## Deployment

This app is deployed to `http://100.118.254.91:8003` over Tailscale.

The standalone build runs as a single Node process under PM2 with auto-restart.

## Architecture

- **Single-process deployment:** UI + API + auth in one Next.js server
- **Multi-tenancy:** Every query scoped to `household_id` via `withTenant()` helper
- **Defense in depth:** App-layer filtering + DB constraints + optional RLS
- **Session-based auth:** Secure httpOnly cookies with 7-day rolling expiry

## License

Private - Family Task Scheduler

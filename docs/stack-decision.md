# Stack Decision Record — Family Task Scheduler

> Date: 2026-05-30 · Author: Architect · Companion to `docs/spec.md`

## Context that drives the decision

The single most important constraint is the **deployment target**: this app does **not** ship to
Vercel + Supabase (what `docs/research.md` suggested as a generic default). It is self-hosted on a
**single Mac Studio**, bound to a **fixed pre-allocated port (8003)**, exposed over **Tailscale** at
`http://100.118.254.91:8003`, with **Docker** available locally. Other hard constraints: multi-tenant
(many families), mobile-first responsive, dark mode, and authentication ready.

This reframes the research recommendation: serverless/edge advantages don't apply, and a managed
external DB/auth (Supabase) would add a network dependency that conflicts with the self-contained,
single-host model. We want **one process on one box, plus a local Postgres**, all reproducible.

The choices below are evaluated for **this** project, not in the abstract.

---

## Option A — Next.js 15 (standalone) + Drizzle + Postgres + Better Auth  ✅ CHOSEN

Full-stack Next.js App Router (UI + Route Handlers + Server Actions) compiled to a standalone
Node server, Drizzle ORM over a Dockerized Postgres 16, Better Auth with its `organization`
plugin for multi-tenant households.

**Pros for this project**
- **One deployable unit.** `output: "standalone"` produces a `server.js` that honors `PORT`/`HOSTNAME`
  env vars — drops straight onto port 8003 under PM2. No second backend to run or supervise.
- **Multi-tenancy is native.** Better Auth's `organization` plugin gives organizations + members +
  invitations + RBAC out of the box; "household" maps 1:1 to "organization". Far less hand-rolled
  tenant code than Auth.js v5.
- **Self-hosted, no per-user cost, no external SaaS.** Better Auth is built to be self-hosted with
  data in our own Postgres — ideal for a Tailscale box. Reached ~100K weekly downloads by 2026 and
  is the de-facto default for new Next.js projects.
- **Drizzle fits a single Postgres perfectly.** Typed SQL, tiny runtime, and **you own the migration
  SQL** (`drizzle-kit`) — important because we add composite FKs and optional RLS policies that an
  abstracted ORM would fight. Migrations are reviewable plain SQL (can add `CREATE INDEX CONCURRENTLY`).
- **Mobile-first + dark mode are first-class** with Tailwind v4 + shadcn/ui + `next-themes`.
- **Fast iteration**: shared TS types DB→API→UI; Zod validation shared with forms.

**Cons / mitigations**
- Better Auth docs/community smaller than Auth.js → *Mitigation:* we use only stable, documented
  features (email/password, organization plugin); OAuth is feature-flagged and optional.
- Drizzle is lower-level than Prisma (more SQL knowledge) → *Mitigation:* relational schema is modest;
  Drizzle's relations API + query builder cover all MVP needs; SQL control is a net positive for RLS.
- Standalone Next.js still benefits from a reverse proxy in production → *Mitigation:* acceptable on a
  trusted Tailscale network; security headers + rate limiting added at the app layer; nginx optional later.

---

## Option B — Next.js 15 + Prisma + Postgres + Auth.js (NextAuth) v5

Same shape, but Prisma ORM and Auth.js v5 for auth.

**Pros**
- Prisma 7 (Nov 2025) dropped the Rust engine for a TS/WASM client (~1.6MB), large mature ecosystem,
  excellent DX and Studio GUI.
- Auth.js has the largest community and the most tutorials.

**Cons for this project**
- **Auth.js v5 is still labeled beta and its own maintainers now point new projects to Better Auth**;
  the v5 migration/setup has well-known friction, and **multi-tenant org management is not first-class**
  — we'd hand-roll households, memberships, invitations, and RBAC.
- Prisma's generated migrations use plain (locking) `CREATE INDEX` and can lock tables on column adds;
  RLS + composite-FK tenant guards are awkward to express through Prisma. We'd fight the abstraction
  exactly where tenant isolation matters most.
- Heavier ORM runtime/codegen vs. Drizzle, with no upside on a single non-edge server.

**Verdict:** Viable and "boring," but loses on the two things that matter most here — *first-class
multi-tenancy* and *control over migrations/RLS*. Rejected.

---

## Option C — Separate FastAPI + Postgres backend + Next.js frontend

Python FastAPI (SQLAlchemy 2 async, Pydantic) API service + a separate Next.js frontend.

**Pros**
- Clean API/UI separation; FastAPI is excellent and the team default for many backends.
- Postgres RLS is straightforward from SQLAlchemy.

**Cons for this project**
- **Two processes to deploy and supervise** on one box, and we only have one allocated port (8003).
  We'd need internal port juggling + a reverse proxy just to satisfy a single public port — extra ops
  for zero benefit at this scale.
- **Two languages, two type systems** — auth/session sharing across the boundary adds work; no shared
  Zod/TS types. Slower to ship the MVP.
- Auth must be built or bolted on separately; no equivalent to Better Auth's org plugin in this combo.

**Verdict:** Over-engineered for a single-host, single-port, single-team MVP. Rejected.

---

## Final choice & rationale

**Option A: Next.js 15 (standalone) + Drizzle + PostgreSQL 16 + Better Auth (organization plugin),
styled with Tailwind v4 + shadcn/ui, dark mode via next-themes, PWA via Serwist, Web Push via VAPID.**

Rationale in one line each:
- **Next.js standalone** → exactly one process that binds `PORT=8003` for the Tailscale host.
- **Better Auth + organization plugin** → multi-tenant households, RBAC, and invitations *for free*,
  self-hosted with no per-user cost — the project's defining requirement.
- **Drizzle + Postgres** → typed SQL with hand-owned migrations, the right tool for composite-FK +
  RLS tenant isolation on a single server.
- **Tailwind v4 + shadcn/ui + next-themes** → mobile-first responsive and proper dark mode with
  minimal effort.
- Everything in **one TypeScript codebase** → fastest path to a shippable, secure MVP.

This honors the research's *intent* (Next.js + Postgres + Tailwind + shadcn) while correcting its
deploy/auth assumptions for a self-hosted Tailscale target (Drizzle over Prisma, Better Auth over
Auth.js, local Postgres over Supabase).

---

## Risks & mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Better Auth smaller ecosystem / API churn | Med | Med | Use only stable features (email+password, org plugin); pin version; OAuth feature-flagged; isolate auth behind a thin service so it's swappable. |
| R2 | Multi-tenant data leak (cross-household) | Low | **High** | 4-layer defense: `withTenant` query helper (never trust client `householdId`), composite FKs, optional Postgres RLS, middleware guard. Automated cross-tenant 403/404 test in acceptance criteria (D1–D3). |
| R3 | Recurrence math wrong (timezones, DST) | Med | Med | Standard `rrule` (RFC 5545) + per-household IANA timezone; expand into concrete `task_occurrences` with `UNIQUE(task_id, occurrence_date)`; unit tests on daily/weekly/monthly expansion. |
| R4 | Single host = single point of failure | Med | Med | PM2 auto-restart; nightly `pg_dump` to disk; health endpoint `/api/health`; stateless app server allows future horizontal scale behind a proxy. |
| R5 | No SMTP on host blocks verify/reset flows | High | Low | If `SMTP_*` unset, log verification/reset links to server console so onboarding stays testable; document in README. |
| R6 | Performance regressions on task/calendar lists | Med | Med | Date-bounded queries, pagination, indexes on `household_id`/`due_at`/`occurrence_date`; TanStack Query caching + optimistic UI; Lighthouse ≥85 gate (E1). |
| R7 | PWA offline writes lost / conflicting | Med | Low | Offline shell + read cache first; completions queued best-effort and reconciled on reconnect; conflicts resolved server-side by occurrence status. Full offline-write sync is a non-goal for MVP. |
| R8 | COPPA / child-data compliance | Low | Med | Parent-managed child accounts; collect no child PII beyond display name; `/privacy` + `/terms` + data export (`/api/export`). |
| R9 | Secrets leakage | Low | High | All secrets in `.env` (git-ignored); `BETTER_AUTH_SECRET` + VAPID keys generated at setup; no secrets in repo (F1). |

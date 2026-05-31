# Implementation Plan — Family Task Scheduler

> Status: READY FOR BUILD · Owner: Planner · Date: 2026-05-30
> Source: `docs/spec.md` (§10 build sequence) · `docs/stack-decision.md`

## How to use this plan

The Implementer works these slices **in order, 1 → 9**. Each slice is a vertical
slice that ends in a runnable, testable state. Do not start a slice until its
listed dependencies are merged and their acceptance criteria pass. Every slice
maps back to the spec's acceptance criteria (A1–G6) — those IDs are noted so the
Tester can trace coverage.

**Complexity legend:** S = ≤1h · M = 1–2h · L = 2–3h (split if it runs longer).

**Conventions established in Slice 1 and reused everywhere:**
- All app DB tables carry non-null `household_id`; all access goes through the
  `withTenant(householdId)` service helper (Slice 4) — never trust client `householdId`.
- All API inputs validated with Zod; errors use the envelope
  `{ "error": { "code", "message", "details"? } }`.
- Tests live in `tests/` (Vitest for unit/integration, Playwright for e2e).
- Absolute repo root: `/Users/macmane/projects/20260530-200426-i-want-to-build-a-full-stack-family-task`.

---

## Slice 1 — Scaffold + smoke-deploy

**Goal:** A "hello world" Next.js 15 app builds, runs on PORT 8003 over Tailscale,
and CI/health check pass — proving the deploy path before any feature work.

**What gets built**
- `package.json`, `tsconfig.json` (strict), Next.js 15 App Router with
  `next.config.ts` → `output: "standalone"`.
- Tailwind CSS v4 (`globals.css`, `postcss.config`), shadcn/ui init
  (`components.json`, `lib/utils.ts`, base `Button`/`Card`).
- `next-themes` provider in `app/layout.tsx` (light/dark, system-aware, no FOUC).
- Serwist PWA shell: `app/manifest.ts`, service worker entry, offline fallback page.
- Root page `app/page.tsx` (placeholder landing) + `app/api/health/route.ts`
  returning `{ status: "ok", db: "unchecked" }` (DB wired in Slice 2).
- `.env.example` listing all spec §9 vars; `.gitignore` excludes `.env`.
- `Dockerfile` (build standalone) — **Postgres compose added in Slice 2**.
- CI workflow (`.github/workflows/ci.yml`): install, typecheck, lint, build, run tests.
- PM2 `ecosystem.config.js` binding `PORT=8003`, `HOSTNAME=0.0.0.0`.
- `README.md` skeleton (setup/run); `artifacts/deploy_url.txt` with the URL.
- `/privacy` and `/terms` placeholder pages.

**Tests required**
- Unit: health route returns 200 with expected shape.
- Build smoke: `next build` succeeds with `output: standalone`.
- E2e smoke (Playwright): root page renders; theme toggle switches `html.dark` class.

**Acceptance**
- [ ] `pnpm build` (standalone) succeeds; `pnpm start` serves on `PORT=8003`.
- [ ] App reachable at `http://100.118.254.91:8003`; `GET /api/health` → 200. (G1, G6)
- [ ] Theme toggle works, persists across reload, no flash. (B3)
- [ ] PWA manifest present; app installable; offline fallback renders. (B4)
- [ ] CI is green on a clean checkout. (G3)
- [ ] `artifacts/deploy_url.txt` contains the URL; README has run commands. (G3, G4)

**Dependencies:** none.
**Complexity:** L.

---

## Slice 2 — Database, schema, migrations, seed

**Goal:** Postgres runs in Docker; the full Drizzle schema migrates cleanly from an
empty DB; system task templates seed; health check reports DB connectivity.

**What gets built**
- `docker-compose.yml` for PostgreSQL 16 (named volume, healthcheck).
- Drizzle setup: `drizzle.config.ts`, `db/client.ts` (pooled connection from `DATABASE_URL`).
- `db/schema/` — all app tables from spec §4.2: `households_profile`, `member_profile`,
  `tasks`, `task_occurrences`, `subtasks`, `task_templates`, `rewards`,
  `reward_redemptions`, `points_ledger`, `activity_log`, `push_subscriptions`.
  (Better Auth tables come in Slice 3.) Include all indexes from §4.2/§4.3 and
  `UNIQUE(task_id, occurrence_date)`, `UNIQUE(household_id, user_id)`.
- Composite-FK helpers where practical (occurrence/subtask `task_id` tied to same
  `household_id`) — the §6.4 layer-2 backstop.
- `drizzle-kit` migration generated + committed under `db/migrations/`.
- Seed script `db/seed.ts` loading global system `task_templates`
  (`household_id = null`). npm scripts: `db:migrate`, `db:seed`, `db:studio`.
- Update `/api/health` to run `SELECT 1` and report `db: "ok" | "down"`.

**Tests required**
- Integration: migrate empty DB → all tables/indexes exist (introspection query).
- Integration: seed runs idempotently; system templates present with `household_id null`.
- Unit: health route reports `db: "ok"` when reachable, `down` when not.

**Acceptance**
- [ ] `docker-compose up` brings Postgres up healthy. (G2)
- [ ] `db:migrate` applies cleanly from empty DB; re-run is a no-op. (G2)
- [ ] `db:seed` loads system templates. (G2)
- [ ] `GET /api/health` reports DB connectivity. (G6)
- [ ] Required indexes present on `household_id`, `(household_id, due_at)`,
      `(household_id, occurrence_date, status)`. (E3)

**Dependencies:** Slice 1.
**Complexity:** L.

---

## Slice 3 — Authentication + onboarding

**Goal:** A user can sign up, verify email, sign in/out, reset password, and create
or join a household — landing in the app with an active tenant.

**What gets built**
- Better Auth config `lib/auth.ts` with email/password + `organization` plugin;
  Drizzle adapter; scrypt hashing; 7-day rolling httpOnly/SameSite=Lax sessions.
  Better Auth tables (`user`, `session`, `account`, `verification`, `organization`,
  `member`, `invitation`) added to schema + migration.
- `app/api/auth/[...all]/route.ts` mounting Better Auth handlers (§5.1).
- Email sender `lib/email.ts`: SMTP if configured, else **log link to console** (R5).
- Auth UI: `app/(auth)/sign-in`, `sign-up`, `forgot-password`, `reset-password`,
  `verify-email`; client via Better Auth client + Zod-validated forms.
- Onboarding flow `app/(app)/onboarding`: create household (→ owner=parent) or accept
  invitation → set timezone + `week_starts_on` (writes `households_profile`) → seed
  starter tasks from templates → invite members. Creates `member_profile` row.
- Invite + accept wiring (`organization/invite-member`, `accept-invitation`).
- Household switcher calling `organization/set-active`.

**Tests required**
- Integration: sign-up creates user; verification link issued (captured from log).
- Integration: sign-in sets session cookie; sign-out clears it; password reset e2e.
- Integration: create household → caller is `owner`/parent; `households_profile` +
  `member_profile` created. Invite → accept → invitee is `member`/child.
- E2e: full onboarding happy path to the app shell.

**Acceptance**
- [ ] Sign up with email+password; verification link issued (logged if no SMTP). (A1, C1)
- [ ] Create household → assigned **parent** role. (A2)
- [ ] Parent invites by email/link; invitee accepts and joins as **child**. (A3)
- [ ] Sessions persist via secure httpOnly cookies; sign-out clears. (C2)
- [ ] Password reset works end-to-end. (C3)
- [ ] Passwords hashed (scrypt); no secrets in repo. (F1)

**Dependencies:** Slice 2.
**Complexity:** L.

---

## Slice 4 — Tenant guard, service layer, RLS backstop

**Goal:** Every request is authenticated and tenant-scoped; cross-tenant access is
impossible. This is the security spine all later feature slices build on.

**What gets built**
- `middleware.ts`: validate session, resolve `activeOrganizationId` (= `household_id`),
  redirect unauthenticated → sign-in, missing active household → onboarding (§6.4 layer-4).
- `lib/tenant.ts` — `withTenant(householdId)` query helper injecting
  `WHERE household_id = $session.householdId`; strips any client-supplied `householdId`
  from bodies before use (§6.4 layer-1, D2).
- `lib/api.ts` — request context (session, role, household), Zod parse, the shared
  error envelope, role-guard helper (`requireParent()`).
- `lib/rbac.ts` — capability matrix from §6.3 mapping owner/admin→parent, member→child.
- RLS migration: enable RLS on app tables with policies keyed on
  `SET app.current_household` GUC; service layer sets the GUC per request (§6.4 layer-3).
- A throwaway/protected sample endpoint exercising the helpers end-to-end.

**Tests required**
- Integration: unauthenticated request → 401/redirect.
- Integration (the D1 cross-tenant test): user in Household A gets 403/404 reading or
  mutating any Household B row — reused across feature slices.
- Integration: client-supplied `householdId` in body is ignored. (D2)
- Integration: RLS blocks a cross-tenant query even when the app filter is bypassed. (D3)
- Unit: role guard — child hitting a parent-only guard → 403. (F6)

**Acceptance**
- [ ] Unauthenticated access to any app route redirects to sign-in. (C1)
- [ ] Cross-tenant read/list/mutate returns 403/404 (automated). (D1)
- [ ] No endpoint accepts `householdId` from client. (D2)
- [ ] RLS/composite-FK backstop prevents cross-tenant references. (D3)
- [ ] Multi-household user can switch active household; sees only that tenant's data. (C4)

**Dependencies:** Slice 3.
**Complexity:** M.

---

## Slice 5 — Tasks, occurrences, recurrence engine, subtasks

**Goal:** Parents can CRUD one-off and recurring tasks; recurring tasks expand into
correct occurrences across a date range, per household timezone.

**What gets built**
- Zod schemas `lib/validation/task.ts` (spec §5.2 task body).
- Service `services/tasks.ts` (tenant-scoped CRUD, soft delete, subtasks nested write).
- Recurrence engine `lib/recurrence.ts` using `rrule` + `date-fns`/`@date-fns/tz`:
  expand RRULE over a window, **idempotent upsert** into `task_occurrences`
  (`UNIQUE(task_id, occurrence_date)`); one-off → single occurrence at `due_at` (§4.3).
- Routes: `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/:id` (parent-only mutations),
  `POST /api/occurrences/:id/status` (`in_progress`/`skipped`).
- `GET /api/tasks?from&to&assignee&status` returns tasks + expanded occurrences.
- UI: Tasks tab — task list with cards, create/edit form (recurrence picker:
  daily / weekly-by-day / monthly), subtask checklist, parent-only FAB quick-add.
- TanStack Query data layer + skeleton loaders.

**Tests required**
- Unit: recurrence expansion — daily, weekly-by-day, monthly produce correct dates
  across a range and respect `recurrence_end` and timezone (R3).
- Unit: idempotent upsert — re-expanding the same range creates no duplicates.
- Integration: parent creates/edits/deletes; child gets 403 on mutation. (F6)
- Integration: `GET /api/tasks` is date-bounded (no unbounded fetch). (E3)

**Acceptance**
- [ ] Parent creates a task with title, category, priority, assignee, points, due date. (A4)
- [ ] Parent creates recurring tasks (daily/weekly-by-day/monthly) that expand correctly. (A5)
- [ ] Task/occurrence queries are bounded by date range; key indexes used. (E3)
- [ ] Child cannot create/edit/delete/assign tasks (403). (F6)

**Dependencies:** Slice 4.
**Complexity:** L.

---

## Slice 6 — Completion / approval workflow + points ledger + undo

**Goal:** A child completes assigned occurrences, earns points (with optional parent
approval), and can undo — with the ledger as the single source of truth for balances.

**What gets built**
- Service `services/occurrences.ts`: complete / uncomplete / approve, transactional with
  `points_ledger` writes and `member_profile.points_balance` recompute. Honors
  `households_profile.approval_required` (§5.2): child completion → `pending_approval`,
  points credit only on parent approval.
- Routes: `POST /api/occurrences/:id/complete`, `/uncomplete`, `/approve`.
- `services/points.ts` — ledger writes (`task_completed`, `reward_redeemed`,
  `manual_adjust`) and balance recompute helper.
- Authorization: child may complete only if `assignedTo == self` or unassigned/claimable;
  approve is parent-only (§6.3).
- UI: one-tap complete with celebratory check animation, undo toast, swipe-to-complete,
  optimistic updates via TanStack Query; parent approval queue view.

**Tests required**
- Integration: assigned child completes → points credited; balance matches ledger sum. (A6)
- Integration: `approval_required` on → child completion is `pending_approval`; parent
  approve credits points. (A7)
- Integration: complete → undo reverses status and ledger delta exactly. (A8)
- Integration: child completing an occurrence not assigned to them → 403. (F6)

**Acceptance**
- [ ] Assigned child marks occurrence complete; points credited to balance. (A6)
- [ ] With approval required, completion → `pending_approval`; parent approval credits points. (A7)
- [ ] Complete → Undo reverses status and points ledger correctly. (A8)
- [ ] Optimistic UI feels instant (≤200ms); server round-trip p95 ≤400ms. (E2)

**Dependencies:** Slice 5.
**Complexity:** L.

---

## Slice 7 — Rewards + redemptions + members

**Goal:** Parents manage a rewards catalog and members; children redeem rewards with
their points; balances debit correctly (with optional approval).

**What gets built**
- Service `services/rewards.ts`: CRUD (parent, soft delete), redeem (balance check
  ≥ `point_cost`; pending if `approval_required`; debit ledger on auto/approval).
- Routes: `GET/POST /api/rewards`, `PATCH/DELETE /api/rewards/:id`,
  `POST /api/rewards/:id/redeem`, `POST /api/redemptions/:id/approve`,
  `GET /api/redemptions?status=`.
- Service `services/members.ts` + routes: `GET /api/members` (with `points_balance`),
  `PATCH /api/members/:userId` (display name/color/birthdate), `POST
  /api/members/:userId/points` (parent manual adjust → ledger).
- UI: Rewards tab (catalog, redeem flow, redemption status/approval queue);
  Family tab (member list, points, parent-only edit + manual adjust).

**Tests required**
- Integration: parent creates rewards; member with enough points redeems; balance debits. (A9)
- Integration: redeem with insufficient points → 409/error envelope. (F2)
- Integration: `approval_required` → redemption `pending` until parent approves, then debits.
- Integration: child cannot manage rewards or adjust points (403). (F6)
- Integration: manual point adjust writes ledger and recomputes balance.

**Acceptance**
- [ ] Parent creates rewards; member with sufficient points redeems; balance debits. (A9)
- [ ] Insufficient balance is rejected with the error envelope. (F2)
- [ ] Reward management + manual point adjust are parent-only (403 for child). (F6)
- [ ] Member list shows correct per-member points balances.

**Dependencies:** Slice 6.
**Complexity:** L.

---

## Slice 8 — Calendar, activity feed, dashboard + mobile nav

**Goal:** Household members navigate a month/week/day calendar, see an activity feed,
and a dashboard summary — all mobile-first with bottom-tab/sidebar nav.

**What gets built**
- Routes: `GET /api/calendar?view&date`, `GET /api/activity?limit&cursor` (cursor
  pagination), `GET /api/dashboard` (todayCount, overdueCount, myTasks, leaderboard).
- `activity_log` writes wired into all mutations from Slices 5–7 (create/assign/
  complete/approve/redeem/member_joined) — add the append calls now if not already.
- UI: Calendar tab (month/week/day, timezone-correct occurrence placement);
  Activity feed (infinite scroll); Dashboard (today/overdue/my-tasks/points summary).
- Navigation shell: bottom-tab bar on mobile (Tasks · Calendar · Family · Rewards ·
  Profile), sidebar at ≥`md`; Profile tab with theme toggle + household switcher.
- Skeleton loaders on all data views.

**Tests required**
- Integration: calendar returns occurrences on correct dates for the household timezone. (A10)
- Integration: activity feed records create/assign/complete/approve/redeem events. (A11)
- Integration: dashboard returns today/overdue/my-tasks/points correctly. (A12)
- Integration: activity feed is cursor-paginated (no unbounded fetch). (E3)
- E2e (mobile viewport 360px): bottom-tab nav works, no horizontal scroll, ≥44px targets. (B1)
- E2e: sidebar nav appears at ≥768px. (B2)

**Acceptance**
- [ ] Calendar shows month/week/day with occurrences on correct dates per timezone. (A10)
- [ ] Activity feed records create/assign/complete/approve/redeem events. (A11)
- [ ] Dashboard shows today's tasks, overdue count, my tasks, points summary. (A12)
- [ ] Usable at 360px (bottom-tab nav, no horizontal scroll, ≥44px targets). (B1)
- [ ] Sidebar nav at ≥768px; all screens legible in light + dark. (B2, B3)

**Dependencies:** Slice 7.
**Complexity:** L.

---

## Slice 9 — Notifications, exports, legal, and production hardening

**Goal:** Web Push, ICS + data export, security hardening, and deploy artifacts —
making the app production-ready against the full acceptance checklist.

**What gets built**
- Web Push: `POST /api/push/subscribe` + `/unsubscribe` (writes `push_subscriptions`),
  `lib/push.ts` VAPID dispatcher; trigger pushes on assignment/approval/reminders;
  Serwist push handler in the service worker.
- `GET /api/calendar.ics` (read-only, token-auth in query) and `GET /api/export`
  (parent/owner-only household JSON export — GDPR/COPPA, R8).
- Finalize `/privacy`, `/terms`, cookie/consent notice, COPPA note.
- Security: rate limiting on auth + mutation endpoints (§F4); security headers
  (CSP, X-Content-Type-Options, Referrer-Policy, HSTS-ready) via middleware/config (§F5);
  audit that every input is Zod-validated and CSRF/SameSite is active (F2, F3).
- Ops: confirm PM2 standalone deploy on PORT 8003; finalize README (setup, env,
  migrate, seed, run); confirm `artifacts/deploy_url.txt`.
- Performance pass: Lighthouse mobile ≥85, FCP ≤3.0s on Fast-3G; verify indexes/bounds.

**Tests required**
- Integration: push subscribe/unsubscribe persists/removes subscription.
- Integration: `/api/export` returns the household's data; parent-only (child 403).
- Integration: `/api/calendar.ics` returns valid `text/calendar`.
- Integration: rate limiter returns 429 past the threshold; security headers present.
- Integration: invalid inputs across endpoints return 400 with the error envelope. (F2)
- Full regression: re-run the Slice 4 cross-tenant suite (D1–D3) and role suite (F6).
- Lighthouse CI run on dashboard ≥85. (E1)

**Acceptance**
- [ ] Web Push subscribe/notify works; offline app shell still serves. (B4)
- [ ] `/privacy` + `/terms` exist; `/api/export` returns household JSON (parent-only). (G5)
- [ ] Rate limiting active (429 past threshold); security headers set. (F4, F5)
- [ ] CSRF protection active; all inputs Zod-validated → 400 envelope on bad input. (F2, F3)
- [ ] Lighthouse Performance ≥85 mobile; dashboard FCP ≤3.0s on Fast-3G. (E1)
- [ ] App runs under PM2 on PORT 8003 (auto-restart); README + deploy_url complete. (G1, G3, G4)

**Dependencies:** Slice 8 (and the full chain 1–8).
**Complexity:** L.

---

## Coverage map (spec acceptance → slice)

| Spec group | Criteria | Slice |
|---|---|---|
| A. Features | A1–A3 | 3 |
| | A4–A5 | 5 |
| | A6–A8 | 6 |
| | A9 | 7 |
| | A10–A12 | 8 |
| B. Mobile/dark/PWA | B1–B2 | 8 |
| | B3 | 1 (+verified 8) |
| | B4 | 1 (+push 9) |
| C. Auth | C1 | 3, 4 |
| | C2–C3 | 3 |
| | C4 | 4 |
| D. Tenant isolation | D1–D3 | 4 (regression 9) |
| E. Performance | E1 | 9 |
| | E2 | 6 |
| | E3 | 5, 8 |
| F. Security | F1 | 3 |
| | F2–F5 | 9 |
| | F6 | 5, 6, 7 (regression 9) |
| G. Deploy/ops | G1 | 1, 9 |
| | G2 | 2 |
| | G3–G4 | 1, 9 |
| | G5 | 9 |
| | G6 | 1, 2 |

Every spec acceptance criterion (A1–G6) is covered by at least one slice.

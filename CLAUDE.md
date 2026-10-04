# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Bingooo: a streetwear men's-wear e-commerce platform with a live custom-garment design
studio. npm-workspaces monorepo: `apps/frontend` (customer storefront), `apps/admin`
(27-route back-office), `apps/backend` (NestJS 10 API), `packages/types` (`@bingooo/types`,
shared DTOs/enums), `packages/config`. Frontend also ships to Android via Capacitor.

## Commands

```bash
# Install (root — npm workspaces)
npm install

# Dev servers
npm run dev            # backend (3000) + frontend (5173)
npm run dev:all        # backend + frontend + admin (5174)
npm run dev:api        # apps/backend only
npm run dev:web        # apps/frontend only
npm run dev:admin      # apps/admin only

# Build / typecheck / lint
npm run build          # all workspaces
npm run build:api
npm run build:web
npm run build:admin
npm run typecheck      # tsc --noEmit across all workspaces — must be zero errors before shipping
npm run lint           # apps/frontend uses oxlint; apps/backend has no linter wired up yet

# Android (apps/frontend, Capacitor)
npm run android        # build + cap sync
npm run android:open   # open native project in Android Studio
```

Backend test suites are standalone scripts (no Jest/Vitest) run with `@swc-node/register`,
each exercising one concern end-to-end against the running data layer:

```bash
npm run test:security -w apps/backend     # auth/authz, price-tampering defenses
npm run test:checkout -w apps/backend     # checkout + tax calculation pipeline E2E
npm run test:admin -w apps/backend
npm run test:upload -w apps/backend
npm run test:load -w apps/backend
npm run test:backup -w apps/backend
npm run test:durability -w apps/backend
```

To run just one of these directly: `node --require @swc-node/register apps/backend/test/run-checkout-e2e.ts`.

`npm run test:live` (`node test/live-smoke.mjs`) smoke-tests a **live deployment**, not localhost.

CI (`.github/workflows/ci.yml`, Node 22) runs on every push and PR: `npm ci`, typecheck, build,
`npm audit --omit=dev --audit-level=high`, then the security, checkout, admin, backup and
durability suites with throwaway secrets. Render and Vercel deploy `main` automatically, so
keep it green before merging.

## Architecture

### Monorepo boundaries
`apps/frontend` and `apps/admin` never import source from `apps/backend` or from each other.
Shared interfaces/DTOs/enums live only in `packages/types`; don't redeclare them locally.

### Backend persistence model (read this before touching any data code)
The runtime source of truth is **not** a live database connection per request — it's an
in-memory object `db` defined in `apps/backend/src/common/database/store.ts`, with arrays
mirroring the SQL schema in `supabase/migrations/001_initial_schema.sql`.

- `store.ts` persists `db` to a local JSON snapshot (`store.json`) on every `saveDb()`, and
  reloads it (or a sanitized `data/seed.json` on first boot) when the process starts.
- Durable off-box persistence is **opt-in**: with `DATA_STORE=supabase` set,
  `common/database/app-records.service.ts` mirrors changed records to a Supabase
  `app_records` JSONB table (`supabase/migrations/004_app_records.sql`) and
  `hydrateFromAppRecords()` (called from `main.ts`) rehydrates `db` from it on boot. Without
  that env var nothing leaves the box, so a dev machine holding a prod service key can't
  touch prod data by accident.
- Reads should go through the hash indexes in `common/database/db-index.service.ts`
  (`Map`-based O(1) lookups), not linear `.find()`/`.filter()` over `db` arrays.
- **Invariant:** `store.ts` must never import `db-index.service.ts` directly — that would
  create a circular dependency. Index rebuilds are wired through
  `registerSaveHook(rebuildIndexes)`, an observer registered once at startup; every write
  path goes through `store.ts`, every read path through the indexes.
- `PrismaService`/`prisma/schema.prisma` exist in the tree but aren't injected anywhere — Prisma
  isn't actually part of the live data path.

### Auth & RBAC
Bearer JWT, enforced by `AuthGuard` on protected routes. Authorization is capability-based:
roles hold a flat `permissions: string[]`, checked by `RolesGuard` against an
`@Permissions(...)` decorator on the handler. The vocabulary lives in
`common/auth/permissions.ts` (`PERMISSION_CATALOG`, `BUILT_IN_ROLES`): every code there is
enforced by some route, and roles may only grant those codes. Only `SUPER_ADMIN` (`'*'`)
bypasses checks; `ADMIN` holds every code explicitly, so a new code must be added to the
catalog and granted deliberately. Changing built-in role grants means bumping
`ROLE_PERMISSIONS_VERSION` — `RolesService.onModuleInit` rewrites stored roles (production
roles live in `app_records`) to the new defaults. Owner-or-staff checks inside handlers use
`hasPermission(req.user, code)`; never check role names inline. A `RolesGuard` route without
`@Permissions` is denied to everyone but `SUPER_ADMIN`.

### Payments & pricing
Razorpay is the only payment provider. Webhook signature (`x-razorpay-signature`) is verified
over the **raw** request body — `main.ts` captures `req.rawBody` inside the `express.json()`
`verify` hook specifically so this check can run before JSON parsing. All prices, tax, and
discounts are recalculated server-side from the stored product record on every order; the
backend never trusts a price sent by a client.

### Media uploads
Uploads go through short-lived Cloudflare R2 presigned PUT URLs (UUID keys, MIME whitelist)
generated by the backend — clients never upload binaries through the NestJS API itself.

### API response contract
Every successful response is wrapped as `{ success, data, timestamp, requestId }`
(`common/interceptors/response.interceptor.ts`); errors use standard NestJS HTTP exceptions
(`NotFoundException`, `BadRequestException`, `ConflictException`, etc.) surfaced through
`common/filters/http-exception.filter.ts`.

### Frontend / admin state
Both apps use Zustand for client state (`apps/frontend/src/store`, `apps/admin/src/store`)
and a thin fetch wrapper (`src/lib/api/client.ts`) that unwraps the backend's response
envelope. Design tokens are fixed, not stylistic preference: cream `#F7EEDB` / charcoal
`#171717` / signal red `#E6321C` only, Manrope for UI text, IBM Plex Mono for
specs/prices/SKUs/tables, `lucide-react` icons only (no raw emoji in UI elements). Full token
table and component specs: `design.md`.

## Repo-specific agent workflow

This repo runs its own agent operating procedure on top of normal engineering practice:

- **`AGENTS.md`** is the canonical operating manual — a 5-phase loop
  (`DISCUSS → PLAN → EXECUTE → VERIFY → SHIP`), a security pre-flight checklist, and the
  architectural invariants restated above. Read it before any non-trivial change.
- **`rules.md`** / **`PROJECT_RULES.md`** enumerate the hard invariants (monorepo boundaries,
  TS strictness, the backend/security rules above, commit format `type(scope): description`)
  — treat them as binding, not advisory.
- A generated knowledge graph of the codebase lives under `graphify-out/`
  (`graph.json`, `GRAPH_REPORT.md`). If the `graphify` CLI/MCP tool is available in this
  environment, prefer `graphify query "<question>"` / `graphify explain "<Symbol>"` over
  grepping cold for architecture or cross-file relationship questions, and run
  `graphify update .` after modifying code so the graph doesn't go stale.

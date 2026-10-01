# Milestone: Audit Phase 2 — Durability, Stock Integrity & Real Refunds

## Context
Audit (2026-10-01) found the backend loses data on every Render redeploy: the in-memory store is
persisted to `apps/backend/data/store.json` on an ephemeral disk, and the Supabase sync only
inserts new orders/payments once (status changes never persist; users, returns, coupons,
settings, banners, media never persist). The normalized Supabase tables have drifted from the
app's record shapes (UUID-only ids, `orders.user_id → profiles → auth.users` FK) so most sync
writes fail silently.

Decisions (user, 2026-10-01): **Supabase JSONB record store** as source of truth; **real
Razorpay refunds**.

## Confirmed scope
IN
1. Persist every collection of the in-memory `db` to one Supabase table `app_records` (JSONB),
   write-through on `saveDb()` (diffed, serialized, retried), hydrate on boot **before** serving.
2. One-time migration: if `app_records` is empty, seed it from what the old hydrate produced
   (normalized categories/products/variants/orders/payments when present, rest from local store).
3. Stock integrity: restore stock + coupon usage when an order is cancelled/refunded or an unpaid
   prepaid order expires (30 min); enforce coupon `starts_at`/`ends_at` and optional
   `per_user_limit`.
4. Real refunds: `PaymentsService.issueRefund` calls Razorpay, records `db.refunds`, updates
   payment/order only after Razorpay accepts; wired to `POST /payments/:id/refund` and to the
   Returns page "Refunded" status. Audit entries record the real admin + IP.
5. Repo hygiene: stop tracking `data/store.json` (contains PII/hashes); ship a sanitized
   `data/seed.json` (catalog, settings, roles; no users/orders/addresses) for first boot.

OUT (later milestones): multi-instance locking, Prisma/normalized migration, purging git history,
RBAC permission-vocabulary reconciliation.

## Changes
| File | Change |
|---|---|
| `apps/backend/supabase/migrations/002_app_records.sql` (new) | `app_records(collection text, id text, data jsonb, updated_at timestamptz, PK(collection,id))`, RLS enabled with no policies (service role only). |
| `apps/backend/src/common/database/app-records.service.ts` (new) | `hydrateFromAppRecords()` (paginated load, one-time seed/migration) and save hook: per-record diff (`JSON` fingerprint) → batched upsert/delete via PostgREST; single-flight with dirty re-run; failures keep records dirty and retry with backoff. Singleton collections (`settings`, `customizer_config`) stored as id `__singleton__`; records without `id` keyed by content hash. |
| `common/database/supabase-sync.service.ts` | Removed (replaced). Legacy normalized reads move into the one-time migration. |
| `common/database/store.ts` | Load order `store.json` → `seed.json`; export `replaceDb()` used by hydration; save hooks run even if the local disk write fails. |
| `main.ts`, `vercel.ts` | `await hydrateFromAppRecords()` before `listen()` / first request. |
| `orders/orders.service.ts` | `releaseOrderInventory(order)` (restock + inventory movement + coupon usage decrement, idempotent via `inventory_released`); call on status → cancelled/refunded; `expireUnpaidOrders()` sweep (interval + boot); real actor in audit log. |
| `orders/orders.controller.ts` | Pass `req.user`/IP to `updateStatus`. |
| `coupons/coupons.service.ts` | Enforce date window and `per_user_limit`; `validateCoupon(code, subtotal, userId?)`. |
| `checkout/checkout.service.ts` | Pass `owner.userId` to coupon validation. |
| `payments/payments.service.ts` | `issueRefund(paymentId, {amount?, reason}, actor)` → `razorpay.payments.refund`; partial/full; `db.refunds`; saveDb; webhook `refund.processed` idempotent with it. Refund route permission → `refunds.manage`, list → `payments.read`. |
| `payments/payments.controller.ts` | Refund DTO; pass actor. |
| `returns/returns.service.ts`, `returns.controller.ts`, `returns.module.ts` | Status DTO; `refunded` triggers `issueRefund` for the order's captured Razorpay payment (COD → marked manual); fails loudly if Razorpay rejects. |
| `apps/backend/data/seed.json` (new), `.gitignore`, git index | Sanitized seed; untrack `store.json`. |
| `Dockerfile` | Unchanged path (copies `data/` → now seed only). |
| `test/run-durability-test.ts` (new) + `package.json` script | Diff/serialize logic with a fake PostgREST; stock release; coupon window; refund guards with mocked Razorpay. |

## Risks
- Migration reads legacy tables once; if Supabase is unreachable on first boot the server must
  NOT seed `app_records` from the image (would drop prod data) → hydration failure is fatal when
  Supabase is configured.
- The SQL must be run in Supabase before deploy (server refuses to start if table missing).
- Refunds move real money in live mode; guarded by `refunds.manage`, amount ≤ refundable.

## Verification
- `npm run typecheck`; app-level `tsc -p tsconfig.app.json` for frontend/admin.
- `test:security`, `test:checkout`, `test:backup`, new `test:durability` pass.
- Boot with Supabase unset → local mode works; boot with fake PostgREST → hydrate + write-through.

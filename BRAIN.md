# 🧠 Bingooo Knowledge Brain (`BRAIN.md`)
> **Persistent Architecture, Agent Memory & Engineering Runbook**  
> *Last Updated: September 2026*

---

## 1. Project Overview & Mission

**Bingooo** is an atelier-grade streetwear e-commerce platform and custom apparel studio based in India.
- **Core Value Proposition**: Premium streetwear (240 GSM combed cotton tees, 380 GSM heavyweight fleece hoodies) paired with a real-time bespoke garment design customizer ("Wear What Defines You").
- **Target Channels**: Progressive Web App (PWA), Native Mobile (via Capacitor iOS/Android), and Web Storefront.

---

## 2. Monorepo Architecture

The repository is structured as a TypeScript monorepo:

```
bingooo/
├── apps/
│   ├── frontend/        # React 19 + Vite 8 + Tailwind CSS customer storefront & customizer
│   │   ├── src/pages/   # HomePage, ShopPage, ProductPage, CustomizerPage, CheckoutPage, etc.
│   │   ├── src/components/ # UI kit, Catalog, CartDrawer, Layout, SEO
│   │   ├── src/lib/     # API client, Native Capacitor bridge, SEO schemas, Preloaders
│   │   └── android/     # Capacitor 8 native Android shell
│   ├── backend/         # NestJS 10 REST API server
│   │   ├── src/common/  # Database store, In-memory O(1) hash indexes, Guards, Interceptors
│   │   ├── src/auth/    # Authentication, JWT, Password hashing
│   │   ├── src/products/# Product catalog & inventory
│   │   ├── src/cart/    # User & guest cart management
│   │   ├── src/checkout/# Multi-step checkout pipeline
│   │   ├── src/orders/  # Order processing & state machine
│   │   └── src/payments/# Razorpay, UPI & manual payment flows
│   └── admin/           # Vite 8 + React 19 back-office management dashboard (27 routes)
│       └── src/pages/   # OrdersPage, ProductEditorPage, DashboardPage, SettingsPage, etc.
├── packages/
│   ├── types/           # Shared TypeScript domain models, DTOs & interfaces
│   └── config/          # Shared tsconfig, tooling & lint standards
├── graphify-out/        # Graphify Knowledge Graph persistent memory
└── BRAIN.md             # This file: Single Source of Truth agent memory
```

---

## 3. Graphify Knowledge Graph Memory Layer

The project is indexed with **Graphify** (`graphifyy`), giving all AI assistants and developers structured, deterministic memory of the entire codebase.

### Graph Memory Stats:
- **Total Nodes**: 7,333+ symbols & concepts
- **Total Edges**: 9,922+ relational connections (calls, imports, inherits, references)
- **Communities**: 646 architectural clusters

### Core Memory Artifacts:
- [`graphify-out/graph.json`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/graph.json): Raw graph data used for instant contextual querying.
- [`graphify-out/graph.html`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/graph.html): Interactive visual dependency map (open directly in browser).
- [`graphify-out/GRAPH_REPORT.md`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/GRAPH_REPORT.md): Audit report including God Nodes, hub communities, and integrity checks.

### Querying Graph Memory:
```bash
# Broad question exploration (BFS traversal)
python -m graphify query "<question>"

# Deep execution trace (DFS traversal)
python -m graphify query "Trace order creation from checkout to database" --dfs

# Find exact connection path between two modules
python -m graphify path "<NodeA>" "<NodeB>"

# Detailed symbol explanation
python -m graphify explain "<SymbolName>"

# Keep graph updated after making code changes (AST-only, zero API cost)
python -m graphify update .
```

---

## 4. Key Architectural Patterns & Invariants

### 1. Database & Indexing Layer (`apps/backend/src/common/database/`)
- **Store** ([`store.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/common/database/store.ts)): File-backed in-memory database serialized to disk (`data/store.json`).
- **O(1) Hash Indexes** ([`db-index.service.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/common/database/db-index.service.ts)): Fast lookup maps for products by id/slug, categories, collections, users, and orders.
- **Strict Decoupling Rule**: `store.ts` must **never** directly import or require `db-index.service.ts`. Instead, an observer pattern is used via `registerSaveHook(rebuildIndexes)` to eliminate circular dependencies.

### 2. Security & RBAC Guard Pipeline
- **Authentication**: Bearer JWT tokens validated via `AuthGuard`.
- **Role Permissions**: Controlled with `@Permissions(...)` decorator and enforced by `RolesGuard`.
- **Authoritative Server Pricing**: Cart line-item prices, discounts, all-inclusive pricing, and shipping rules are calculated exclusively on the backend.
- **Razorpay Verification**: HMAC SHA-256 webhook signatures verified with raw request payloads.

### 3. Frontend Aesthetics & Performance
- **Design Tokens**: Strict adherence to [design.md](file:///c:/Users/manip/Desktop/bingooo/design.md) (Warm cream `#F7EEDB`, charcoal `#171717`, signal red `#E6321C`, Manrope font).
- **Iconography**: Crisp Lucide React SVG icons throughout all user interfaces (no raw unicode emojis).
- **Haptic Feedback**: Mobile touch gestures trigger native vibration via `triggerHaptic()` from [`capacitorBridge.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/lib/native/capacitorBridge.ts).
- **SEO & PWA**: Dynamic JSON-LD structured schemas (`Organization`, `Product`, `WebSite`, `LocalBusiness`), service worker offline caching, and PWA install prompts.

---

## 5. Development Runbook & Common Commands

| Task | Command | Directory / Scope |
|---|---|---|
| **Storefront Dev Server** | `npm run dev:web` | Root / `apps/frontend` (Port 5173) |
| **Admin Dev Server** | `npm run dev:admin` | Root / `apps/admin` (Port 5174) |
| **Backend API Server** | `npm run dev:api` | Root / `apps/backend` (Port 3000) |
| **Run Full Dev Suite** | `npm run dev:all` | Root (API + Storefront + Admin) |
| **Typecheck All Workspaces** | `npm run typecheck` | Root |
| **Build All Bundles** | `npm run build` | Root |
| **Android Sync / Open** | `npm run android:sync` / `npm run android:open` | Root |
| **Backend Security Suite** | `npm run test:security` | `apps/backend` |
| **Backend Checkout E2E** | `npm run test:checkout` | `apps/backend` |
| **Re-index Graph Memory** | `python -m graphify update .` | Project Root |

---

## 6. Changelog & Recent Decisions

- **2026-10-06: WhatsApp Cloud API & Email Order Confirmations**
  - Integrated Meta WhatsApp Cloud API and webhook fallback in `WhatsAppService` with named template support (`order_confirmed`).
  - Automated WhatsApp and Resend email order confirmations dispatched on payment capture; updated `OrderSuccessPage` with live parcel tracking timeline and luxury receipt.

- **2026-10-04: Audit Phase 3 — Platform Hygiene**
  - CI workflow (typecheck, build, prod audit, 5 backend suites) on every push; frontend/admin `typecheck` now checks real files — it immediately caught a `codTotal` reference left by the COD removal that had broken the production frontend build.
  - NestJS 10 → 11.2.7 (Express 5, patched multer/body-parser/lodash); production audit has no high advisories (remaining moderate js-yaml is Swagger-only, and Swagger is now off in production unless `ENABLE_SWAGGER=true`). `@capacitor/cli` aligned to 8.
  - RBAC vocabulary unified in `common/auth/permissions.ts`; ADMIN bypass removed (explicit grants), new `orders.read` / `returns.manage`, refunds moved to `POST /returns/:id/refund` (`refunds.manage`); stored roles auto-upgraded on boot; role edits now persist and reject unknown codes.
  - Report-only Content-Security-Policy on the Vercel frontend and admin.

- **2026-09-30: Admin-to-Frontend Catalog Sync, Media Resolution & Speed Insights**
  - Resolved `useProducts` array unwrap bug in frontend hook that prevented live catalog garments from loading.
  - Added missing `/api/(.*)` rewrite in `apps/admin/vercel.json` and production API fallback in `apps/admin/src/lib/api.ts`.
  - Normalized media upload and product enrichment URLs to eliminate broken `localhost:3000` URLs across all environments.
  - Integrated `@vercel/speed-insights` in `@bingooo/frontend` and `@bingooo/admin`.
- **2026-10-01: Cart Drawer Item Integrity & Image Accuracy Fix**
  - Resolved cart drawer and cart page displaying mismatching placeholder t-shirt images and fake swatch colors by enriching backend cart item payloads and persisting client-side product metadata.
- **2026-10-01: Audit Phase 2 — Durable Storage, Stock Integrity & Real Refunds**
  - All in-memory collections now persist to Supabase `app_records` (JSONB, migration `supabase/migrations/004_app_records.sql`) via `common/database/app-records.service.ts`: diffed write-through on `saveDb()`, retry with backoff, flush on shutdown, hydration awaited before serving (fatal if unreachable). Opt-in with `DATA_STORE=supabase` (set in `render.yaml`). Replaces the broken `supabase-sync.service.ts`.
  - `data/store.json` is no longer tracked; first boot loads the sanitized `data/seed.json` (catalog, roles, settings — no customer data).
  - Stock/coupons returned on cancellation, deletion of unshipped orders, and 30-minute unpaid-order expiry; late payments re-reserve stock or alert admins. Coupon date windows and optional `per_user_limit` enforced.
  - Real Razorpay refunds (`PaymentsService.issueRefund`, partial/full, `refunds.manage`) wired to `POST /payments/:id/refund` and the Returns "Refunded" status; refund webhooks reconcile totals; audit logs record the real admin and IP.
- **2026-10-01: Security Audit Phase 1 — Payment, RBAC & Identity Hardening**
  - Razorpay verify now binds the signature to its own payment record and the caller's order (closes ₹1-capture-any-order); create/verify require auth; webhook dedupes on `x-razorpay-event-id`, requires raw body, only moves forward.
  - `RolesGuard` denies by default when a route has no `@Permissions`; admin/backup/audit routes now declare `analytics.read`, `settings.manage`, `backups.manage`, `audit.read`; settings use an allow-listed DTO.
  - `AuthGuard`: super-admin only for confirmed Supabase emails in `ADMIN_EMAILS` (hardcoded list removed), no unverified email account-linking, suspended/deleted users rejected, password change/reset revokes older tokens.
  - Backup label path traversal fixed; staff roles validated (only SUPER_ADMIN grants ADMIN/SUPER_ADMIN, no default password); reviews/checkout/cart/returns bound to the authenticated owner; idempotency cache scoped per caller+route; email templates HTML-escaped; Vercel CORS allow-list enforced; `store.json` written atomically and never overwritten when corrupt.
  - `EmailModule` registered (transactional email was never wired); password reset now emails a hashed-at-rest token instead of logging it.
  - Frontend: `admin_origin` allow-listed before tokens are forwarded; service worker caches public catalog API only and caches are cleared on sign-out.
- **2026-10-01: Phase 3 Automated WhatsApp Order Confirmation & Live Tracking (Plan 3.2)**
  - Implemented `WhatsAppService` in `apps/backend/src/notifications/` with support for Meta Cloud API, webhooks, and simulated fallbacks.
  - Automatically triggers formatted WhatsApp notifications upon order placement (`OrdersService.createOrder`) and payment capture (`PaymentsService`).
  - Added dedicated instant WhatsApp confirmation card with live parcel tracking link on `OrderSuccessPage.tsx`.
- **2026-10-01: Phase 3 Real-Time 3D Garment Mockup Studio (Three.js)**
  - Built procedural Three.js 3D garment geometries (Oversized Boxy, Heavyweight Crewneck, Double-Layered Hoodie) with cotton weave bump mapping.
  - Implemented real-time dynamic texture projection for custom typography and artwork in `CustomizerPage.tsx`.
  - Added seamless 2D/3D studio toggle with 360° turntable orbit, view snapping, and studio lighting presets.
- **2026-09-28: Security Hardening, Auth Guard Fixes & Catalog Restoration**
  - Patched zero-day unauthenticated password reset vulnerability with cryptographically signed tokens.
  - Hardened backend `AuthGuard` to automatically grant `SUPER_ADMIN` grants to authorized admin Google OAuth logins.
  - Restored complete product catalog, variants, and fallback garments in `store.json` and `fallbackProducts.ts`.
  - Cleaned out dummy address defaults from `CheckoutPage.tsx` and locked down CORS to explicit production origins.
- **2026-09-17: Comprehensive UI/UX Iconography Refactor**

  - Standardized all UI components, badges, social blocks, and navigation elements on Lucide React vector icons.
- **2026-09-17: Atelier Command Console Admin Login & Redesigns**
  - Redesigned Admin Login, 404 Error page, and Size & Fit Guide with editorial brutalist architecture and interactive calculators.
- **2026-09-17: Mobile Navigation & Footer Accordions**
  - Upgraded mobile footers with collapsible touch dropdowns and bottom sticky action bars for conversion flow.
- **2026-09-17: Circular Dependency Elimination & Graphify Integration**
  - Decoupled `apps/backend/src/common/database/store.ts` from `db-index.service.ts` using the `registerSaveHook` subscription pattern.
  - Indexed 7,300+ symbols into persistent Graphify knowledge graph.
- **2026-10-03: Permanent Removal of Cash on Delivery (COD)**
  - Transitioned platform to 100% secure prepaid checkout (Razorpay UPI, Cards, NetBanking) with 5% instant discount, removing all COD and Partial COD paths from backend, admin, storefront, and shared types.
- **2026-10-05: Non-blocking Async Store Flushes, Test Catalog Fallbacks & Schema Migrations**
  - Converted `store.ts` to async coalesced disk flushes with `StoreShutdown` hook and graceful exit handlers.
  - Added self-contained test catalog fallbacks in `run-security-suite.ts` and `run-checkout-e2e.ts` for clean boots.
  - Formatted SQL migrations 005–008 for COD cleanup and placeholder demo product removal.
  - Enhanced customizer hoodie SVG styling and updated SEO copy/prerender schemas for prepaid operations.
- **2026-10-05: Universal Free Shipping Pan-India & Admin UI Refinements**
  - Standardized store policy to 100% universal free delivery across all orders; stripped redundant shipping fee/threshold calculators from checkout, cart, shipping services, and schemas.
  - Streamlined admin navigation by deprecating the unused Banners route and elevated admin table, badges, and view craftsmanship across admin pages.
- **2026-10-05: Admin Orders Visual Thumbnail Preview & Image Enrichment**
  - Replaced text-heavy Order Ref column in Admin Orders table with interactive product/customizer thumbnail previews, 3D/multi-item badges, and modal item previews with backend image enrichment.
- **2026-10-07: Restore Selected Garment Image Visibility in Checkout & Admin Orders**
  - Resolved missing cart images and NaN pricing in Checkout order summaries (`CheckoutPage.tsx`), improved image enrichment and normalized preview paths across backend orders and checkout services, and restored thumbnail image previews on Admin Orders page (`OrdersPage.tsx`).
- **2026-10-08: Complete Removal of Customizer Page & Custom Entry Points**
  - Completely decommissioned customizer studio and customizer routes, redirected legacy custom URLs to `/shop`, updated navbar/mobile navigation to feature the Wishlist tab, and streamlined all product cards, search modals, and campaign banners to pure ready-to-wear streetwear catalog collections.




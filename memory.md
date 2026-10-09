# 🧠 BINGOOO — Persistent System Memory & Agent Context (`memory.md`)

> **Document Version:** 1.2.0  
> **Type:** Single Source of Truth (SSOT) Persistent Memory & Runbook  
> **Status:** Active / Authoritative  
> **Last Synchronized:** October 10, 2026  
> **Primary Consumer:** AI Pair Programmers, Code Reviewers, Core Maintainers

---

## 1. System Identity & Mission

- **Brand:** **BINGOOO.** (Wordmark strictly styled in uppercase with a red period dot: `BINGOOO.`)
- **Brand Motto / Tagline:** *"Wear what defines you."* • *"Clothing · Custom · Culture"*
- **Domain:** High-end Indian menswear, luxury streetwear (240–280 GSM combed cotton t-shirts, 380–420 GSM French terry fleece hoodies, drop-shoulder silhouettes, tactical cargos), and bespoke real-time garment customization.
- **Aesthetic Direction:** Editorial brutalist luxury. Warm cream paper canvas (`#F7EEDB`), charcoal typography (`#171717`), and crisp brand signal red (`#E6321C`). Crisp Lucide React vector icons throughout (no unicode emojis in UI elements).

---

## 2. Graphify Knowledge Graph Memory Layer

The entire Bingooo monorepo is indexed by **Graphify** (`graphifyy`), establishing a deterministic graph memory of the codebase.

### Graph Memory Telemetry:
- **Total Indexed Nodes:** 9,164+ symbols (classes, functions, interfaces, routes, variables)
- **Total Edges:** 12,824+ relationships (`calls`, `imports`, `inherits`, `references`, `renders`)
- **Community Clusters:** 797 modular architectural domains

### Persistent Graph Artifacts:
- [`graphify-out/graph.json`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/graph.json): Raw directed multigraph used for instant programmatic querying.
- [`graphify-out/graph.html`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/graph.html): Visual 3D force-directed dependency canvas (open in browser).
- [`graphify-out/GRAPH_REPORT.md`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/GRAPH_REPORT.md): System audit report identifying God Nodes, hub communities, and circular dependencies.

### Command Line Querying:
```bash
# Broad question exploration (Breadth-First Search)
python -m graphify query "<question>"

# Deep execution trace from UI to Database (Depth-First Search)
python -m graphify query "Trace order creation from checkout to database" --dfs

# Find relationship path between two symbols
python -m graphify path "<SymbolA>" "<SymbolB>"

# Inspect symbol implementation & dependencies
python -m graphify explain "<SymbolName>"

# Re-index graph after modifying code (AST-only, zero API cost)
python -m graphify update .
```

---

## 3. Non-Negotiable Architectural Invariants & Solved Gotchas

### 🚨 Invariant 1: Database Store & Index Decoupling (`store.ts` vs. `db-index.service.ts`)
- **Issue:** Previously, `apps/backend/src/common/database/store.ts` and `db-index.service.ts` had a circular import dependency, causing runtime bootstrap crashes in NestJS.
- **Strict Rule:** `store.ts` must **NEVER** import `db-index.service.ts` or any service class.
- **Solution:** `store.ts` exposes a subscriber hook:
  ```typescript
  export function registerSaveHook(hook: () => void | Promise<void>) {
    saveHooks.push(hook);
  }
  ```
  `DbIndexService` subscribes to this hook during NestJS module lifecycle (`onModuleInit`), completely eliminating circular references.

---

### 🚨 Invariant 2: Authoritative Server-Side Pricing
- **Issue:** Client-submitted shopping bags can be tampered with in DevTools to submit orders with ₹1 prices.
- **Strict Rule:** The frontend is treated as completely untrusted. The client submits only `productId`, `variantId`, `quantity`, and `customizationSpecs`.
- **Solution:** `CheckoutService` fetches the genuine product price from the database store, validates variant stock, applies all-inclusive pricing (no extra tax surcharges), applies validated coupon rules, and applies 100% universal free delivery Pan-India (₹0 shipping fee across all orders) with 100% secure prepaid checkout (COD removed).

---

### 🚨 Invariant 3: Presigned Cloudflare R2 Upload Pipeline
- **Issue:** Uploading high-res 25MB customer artwork files through the NestJS API server exhausts server memory and ties up Express worker threads.
- **Strict Rule:** The API server must **NEVER** accept direct multipart/form-data image binaries for storage.
- **Solution:** Direct client-to-R2 pipeline:
  1. Client calls `POST /api/v1/media/presign-upload` with filename and MIME type.
  2. Server validates MIME against whitelist (`image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`), generates a UUID object key, and returns an AWS S3-compatible presigned PUT URL expiring in 15 minutes.
  3. Client uploads binary directly to Cloudflare R2.
  4. Client passes the returned CDN public URL in the order or customization payload.

---

### 🚨 Invariant 4: Razorpay Webhook Raw Buffer Capture
- **Issue:** Verifying Razorpay HMAC SHA-256 signatures (`x-razorpay-signature`) fails if Express parses the request body as JSON prior to signature verification because whitespace and key order differences break the HMAC digest.
- **Strict Rule:** Express must preserve the raw unparsed Buffer.
- **Solution:** Implemented in `apps/backend/src/main.ts`:
  ```typescript
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  ```
  `PaymentsService.verifyWebhookSignature()` strictly uses `req.rawBody` for cryptographic verification.

---

### 🚨 Invariant 5: Zero Frontend Secrets
- **Strict Rule:** No private keys, database service-role secrets, or payment secret keys in client repositories (`apps/frontend`, `apps/admin`).
- **Whitelisted Client Env Vars:** Only variables prefixed with `VITE_` containing public identifiers:
  - `VITE_API_BASE_URL` (API URL)
  - `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` (Public client auth)
  - `VITE_RAZORPAY_KEY_ID` (Public merchant ID, e.g. `rzp_test_...`)

---

### 🚨 Invariant 6: Native Capacitor Bridge Guards
- **Issue:** Calling native mobile plugins in standard web browser contexts causes unhandled promise rejections.
- **Strict Rule:** All native plugin invocations in `capacitorBridge.ts` must be guarded with `Capacitor.isNativePlatform()` checks:
  ```typescript
  import { Capacitor } from '@capacitor/core';
  import { Haptics, ImpactStyle } from '@capacitor/haptics';

  export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.impact({ style: ImpactStyle[style.toUpperCase()] });
    } catch {
      // Gracefully silent on unsupported web browsers
    }
  }
  ```

---

### 🚨 Invariant 7: Customizer Transparent Photography Pipeline & Zero Mockup Clipart
- **Strict Rule:** No cartoon vector icons, generic clipart shirts, or placeholder text overlays (`YOUR LINE HERE`, `BACK PRINT ARTWORK`) in the customer-facing customizer or homepage.
- **Solution:** The Admin Panel Customizer Studio (`/customizer`) is the single authority for uploaded garment transparent PNGs. The customizer renders real photography with alpha transparency, allowing customers to preview their artwork directly on authentic apparel fabric.

---

### 🚨 Invariant 8: Production Database Integrity & Real Customer Orders
- **Strict Rule:** `store.json` contains only authentic orders, official catalog products, real staff accounts, and verified coupons.
- **Solution:** Synthetic bot users and fake dummy orders are permanently purged. All orders placed through the storefront write directly to `store.json` and appear instantly in the Admin Orders queue with automated WhatsApp dispatch notifications.

---

## 4. Key Code Locations & Symbol Map

| Domain / Responsibility | Primary Files & Symbols |
|:---|:---|
| **Core Database Store** | [`apps/backend/src/common/database/store.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/common/database/store.ts) (`store`, `saveStore`, `registerSaveHook`) |
| **O(1) Hash Indexes** | [`apps/backend/src/common/database/db-index.service.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/common/database/db-index.service.ts) (`DbIndexService`, `rebuildIndexes`) |
| **Checkout & Pricing** | [`apps/backend/src/checkout/checkout.service.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/checkout/checkout.service.ts) (`CheckoutService.createOrder`) |
| **Payments & Razorpay** | [`apps/backend/src/payments/payments.service.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/payments/payments.service.ts) (`PaymentsService.verifyWebhookSignature`) |
| **Media & Presigned R2** | [`apps/backend/src/media/media.service.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/media/media.service.ts) (`MediaService.createPresignedUpload`) |
| **Customer Router (32 Pgs)**| [`apps/frontend/src/app/router.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/app/router.tsx) (`router`, `lazyPage`) |
| **Cart State (Frontend)** | [`apps/frontend/src/store/useCartStore.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/store/useCartStore.ts) (`useCartStore`) |
| **Customizer Canvas UI** | [`apps/frontend/src/pages/CustomizerPage.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/CustomizerPage.tsx) (`CustomizerPage`) |
| **Admin Router (27 Rts)** | [`apps/admin/src/app/router.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/app/router.tsx) (`router`, `AdminGuard`) |
| **Product Editor Matrix** | [`apps/admin/src/pages/ProductEditorPage.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/ProductEditorPage.tsx) (`ProductEditorPage`) |
| **Design Tokens & Audit** | [`design.md`](file:///c:/Users/manip/Desktop/bingooo/design.md) & [`apps/frontend/src/styles/theme.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/styles/theme.ts) |
| **Prisma Relational DB** | [`prisma/schema.prisma`](file:///c:/Users/manip/Desktop/bingooo/prisma/schema.prisma) (Full PostgreSQL Schema) |

---

## 5. Environment Variables & Secret Configuration

| Variable | Scope | Purpose & Example Value | Confidentiality |
|:---|:---|:---|:---|
| `PORT` | Backend | HTTP server port (Default: `8080` in container, `3000` in dev) | Public |
| `NODE_ENV` | Backend | Environment flag (`development`, `production`, `test`) | Public |
| `CORS_ORIGINS` | Backend | Comma-separated allowed origins for CORS requests | Public |
| `SUPABASE_URL` | Backend/Front | Supabase project URL (`https://xyz.supabase.co`) | Public |
| `SUPABASE_ANON_KEY` | Backend/Front | Supabase anonymous public client key | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Supabase elevated admin key (RLS bypass) | **CRITICAL SECRET** |
| `RAZORPAY_KEY_ID` | All Apps | Razorpay public merchant ID (`rzp_test_...` or `rzp_live_...`) | Public |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay private API secret key | **CRITICAL SECRET** |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | HMAC SHA-256 secret for webhook verification | **CRITICAL SECRET** |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Backend | Cloudflare account identifier for R2 | Confidential |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`| Backend | S3-compatible R2 access key ID | Confidential |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY`| Backend | S3-compatible R2 secret access key | **CRITICAL SECRET** |
| `CLOUDFLARE_R2_BUCKET` | Backend | R2 storage bucket name (`bingooo-assets`) | Public |
| `CLOUDFLARE_R2_PUBLIC_DOMAIN` | All Apps | Public CDN custom domain (`https://cdn.bingooo.in`) | Public |
| `DATABASE_URL` | Backend | PostgreSQL connection string for Prisma ORM | **CRITICAL SECRET** |

---

## 6. Development Runbook & Common Commands

```bash
# ─── Local Development ───
npm run dev:web        # Start Customer Storefront (Vite on :5173)
npm run dev:admin      # Start Admin Control Center (Vite on :5174)
npm run dev:api        # Start NestJS Backend (HTTP on :3000)
npm run dev:all        # Launch Storefront, Admin, and Backend concurrently

# ─── Verification & Quality Gates ───
npm run typecheck      # Run TypeScript compilation check across all workspaces
npm run build          # Compile production bundles for all apps
npm run lint           # Run linter across all workspaces

# ─── Automated Testing Suites ───
npm run test:security -w apps/backend   # Execute security regression suite
npm run test:checkout -w apps/backend   # Execute end-to-end checkout & pricing test
npm run test:admin -w apps/backend      # Execute admin operations suite
npm run test:upload -w apps/backend     # Test R2 presigned upload pipeline

# ─── Mobile Shell (Capacitor) ───
npm run android        # Build frontend and sync to Android project
npm run android:sync   # Synchronize web assets to native Android container
npm run android:open   # Open native project in Android Studio

# ─── Graph Knowledge Base ───
python -m graphify update .   # Keep graph.json and GRAPH_REPORT.md updated
```

---

## 7. Changelog & Architectural Decisions

- **2026-09-17: Comprehensive UI/UX Iconography Refactor**
  - Standardized all UI components, badges, social blocks, and navigation elements on Lucide React vector icons.
- **2026-09-17: Atelier Command Console Admin Login & Redesigns**
  - Redesigned Admin Login, 404 Error page, and Size & Fit Guide with editorial brutalist architecture and interactive calculators.
- **2026-09-17: Mobile Navigation & Footer Accordions**
  - Upgraded mobile footers with collapsible touch dropdowns and bottom sticky action bars for conversion flow.
- **2026-09-17: Circular Dependency Elimination & Graphify Integration**
  - Decoupled `apps/backend/src/common/database/store.ts` from `db-index.service.ts` using the `registerSaveHook` subscription pattern.
  - Indexed 7,333+ symbols into persistent Graphify knowledge graph.
- **2026-09-21: Core Documentation Suite Deployment**
  - Created canonical `prd.md`, `architecture.md`, `memory.md`, `rules.md`, and `task.md` root artifacts.
- **2026-10-01: Phase 3 Real-Time 3D Garment Mockup Studio (Three.js)**
  - Built procedural Three.js 3D garment geometries with cotton weave bump mapping and real-time texture projection.
- **2026-10-03: Permanent Removal of Cash on Delivery (COD)**
  - Transitioned platform to 100% secure prepaid checkout (Razorpay UPI, Cards, NetBanking) with 5% instant discount.
- **2026-10-05: Universal Free Shipping Pan-India & Admin UI Refinements**
  - Standardized store policy to 100% universal free delivery across all orders; stripped redundant shipping fee calculators.
- **2026-10-10: Atelier Customizer Image Pipeline & Admin-Driven Dynamic Garments**
  - Purged fake mockup clipart, cartoon shirt icons, and text overlays in customizer & homepage; Admin Customizer Studio is the single authority for uploaded garment PNGs with transparent layer preservation.
- **2026-10-10: Admin Panel Layout Overhaul & Responsive Viewport Engineering**
  - Permanent document-flow desktop sidebar and mobile off-canvas drawer; eliminated table squishing across all 15 routes.
- **2026-10-10: Production Database Sanitization & Test Data Purge**
  - Purged 180+ automated bot users, 50 synthetic test orders, and duplicate demo products; preserved official catalog apparel, real admin accounts, and promotional coupons.
- **2026-10-10: End-to-End Promotional Coupon Engine & Real-Time Checkout Recalculation**
  - Linked coupon management between Admin Panel, NestJS backend `CouponsService`, and Storefront checkout (`BINGOOO10`, `WELCOME20`, `FREESHIP`).

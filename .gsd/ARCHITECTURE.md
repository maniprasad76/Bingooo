# Architecture

> Project Architecture for BINGOOO. Synthesized from canonical `architecture.md` on 2026-10-01.

## Overview

BINGOOO is an atelier-grade luxury streetwear e-commerce platform and 2D/3D customizer studio built as a TypeScript monorepo (`apps/frontend`, `apps/admin`, `apps/backend`, `packages/types`, `packages/config`, `android/`).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENTS / ACCESS POINTS                          │
│   • Storefront (React 19 + Vite 8 PWA)      • Admin (React 19 + Vite 8)     │
│   • Native Android/iOS (Capacitor 8 Shell)                                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS REST API (/api/v1)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND API (NestJS 10 REST SERVER)                   │
│   • Auth & RBAC (@Permissions, AuthGuard, RolesGuard)                       │
│   • Commerce & Orders (6-stage state machine, authoritative pricing)        │
│   • Atelier Studio (Customizer engine, placement validation)                │
│   • Payments (Razorpay SDK, HMAC SHA-256 raw webhook verification)          │
└───────────────────────┬───────────────────────────────┬─────────────────────┘
                        │                               │
                        ▼                               ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     PERSISTENCE & HASH INDEXING      │  │        EXTERNAL INTEGRATIONS      │
│  • File Store (`data/store.json`)    │  │  • Razorpay Payments Gateway      │
│  • O(1) In-Memory `DbIndexService`   │  │  • Cloudflare R2 Media CDN        │
│  • Supabase PostgreSQL (Prisma DB)   │  │  • Vercel Edge Global CDN         │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

## Components

### Component 1: Customer Storefront (`apps/frontend`)
- **Purpose:** Customer catalog, PDP with GSM specifications, flyout cart drawer, checkout modal, and 2D customizer studio.
- **Location:** `apps/frontend/src`
- **Pattern:** React 19 SPA + Tailwind CSS + Lucide Icons + Capacitor Bridge.

### Component 2: Operations Control Center (`apps/admin`)
- **Purpose:** 27-route administrative control center covering Catalog, Orders, Marketing, Finance, Customers, and Settings.
- **Location:** `apps/admin/src`
- **Pattern:** High-density enterprise dashboard with granular RBAC and variant Cartesian generator.

### Component 3: Application Server (`apps/backend`)
- **Purpose:** High-throughput NestJS API providing authoritative pricing, cart validation, order fulfillment, and payment webhooks.
- **Location:** `apps/backend/src`
- **Pattern:** Modular NestJS architecture with controllers, services, guards, and decoupled observer indexing.

### Component 4: Shared Types & Config (`packages/types`, `packages/config`)
- **Purpose:** Single source of truth for TypeScript interfaces (Order, Product, Cart, Customizer, User) and build configurations.
- **Location:** `packages/types/src`, `packages/config`
- **Pattern:** Workspace packages consumed by all monorepo apps.

## Data Flow

1. **User Customizes Garment:** Customer configures garment silhouette, colorway, typography, and uploads artwork on the 2D canvas. Surcharges (DTG/Embroidery/DTF) are computed interactively.
2. **Authoritative Cart & Pricing:** When adding to cart or initiating checkout, frontend sends item IDs and configurations. `apps/backend` recalculates all subtotal, GSM validation, GST (12%/18%), discounts, and shipping from the authoritative catalog.
3. **Payment & Webhook Verification:** Razorpay order is created. On completion, Razorpay fires a webhook. NestJS intercepts the raw request body, verifies the HMAC SHA-256 signature, and transitions the order state to `Confirmed`.
4. **Fulfillment State Machine:** Orders transition through `Confirmed → Processing → Shipped → Out for Delivery → Delivered` with status updates.

## Technical Debt & Invariants

- [x] Invariant: `store.ts` must NEVER directly import `db-index.service.ts`; communication is strictly via observer hook `registerSaveHook(rebuildIndexes)`.
- [x] Invariant: Authoritative server-side pricing; never trust prices sent by the client.
- [x] Invariant: Brand design tokens strictly enforced (`#F7EEDB`, `#171717`, `#E6321C`, Manrope font, Lucide React icons only).
- [ ] Database sync: In-memory `store.json` dual storage model needs automated sync with Supabase PostgreSQL tables.
- [ ] Automated admin integration tests across all 27 admin routes.

---

*Last updated: 2026-10-01*

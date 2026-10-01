# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: Specification finalized and locked for v1.0.

## Vision
**BINGOOO.** (*"Wear what defines you."*) is an atelier-grade Indian menswear and luxury streetwear platform that merges high-density heavyweight apparel with a real-time, bespoke 2D garment customization studio and an integrated 27-route operations control center.

## Goals
1. **Curated Luxury Heavyweight Streetwear** — Deliver ready-to-wear heavyweight combed cotton t-shirts (240–280 GSM), double-layered French terry hoodies (380–420 GSM), drop-shoulder crewnecks, and tactical cargo trousers with verified GSM specs.
2. **Interactive 2D Bespoke Customizer Studio** — Provide a browser- and mobile-first 2D design canvas allowing users to customize garments with custom typography (14 curated display fonts), uploaded vector/raster artwork, and print craftsmanship selection (DTG, High-Density Embroidery, DTF) with dynamic surcharge estimation.
3. **High-Density Operations & Fulfillment Center** — Provide a 27-route administrative control center orchestrating a 6-stage order fulfillment workflow, custom artwork print queues, real-time inventory management, Razorpay payment reconciliation, and granular staff RBAC.
4. **Authoritative & Secure Financial Engine** — Enforce server-side authoritative price recalculation (cart totals, GST 12%/18%, discounts, shipping) and raw HMAC SHA-256 Razorpay webhook verification.
5. **Cross-Platform Native Experience** — Deliver a unified PWA storefront and Capacitor 8 native Android/iOS container with native tactile haptics, status bar styling, and offline resilience.

## Non-Goals (Out of Scope)
- Mass-market cheap, lightweight fast-fashion (sub-200 GSM garments are strictly excluded).
- Client-side authoritative pricing (frontend-submitted prices are strictly untrusted).
- Unsanitized inline custom SVG/HTML injection in customer canvas renders.
- Off-brand arbitrary color palettes or unicode emoji icons in UI surfaces.

## Users
- **Streetwear Connoisseurs (Rahul)**: Demands authentic heavyweight boxy apparel, transparent GSM specs, fit guide recommendations, instant UPI checkout, and live parcel tracking.
- **Creatives & Individualists (Aman)**: Graphic designers, musicians, and creators designing statement pieces via the 2D customizer canvas with high-res asset uploads and front/back positioning.
- **Bulk & B2B Buyers (Kiran)**: College fests, dance crews, and startups ordering 20–500 custom garments with volume pricing tiers.
- **Fulfillment & Operations Team (Sneha)**: Warehouse staff managing 6-stage fulfillment pipelines, downloading print-ready vector artwork, and monitoring stock levels.
- **Store Owners & Admins (Mani)**: Brand directors tracking GMV telemetry, managing discounts, reviewing financial ledgers, and configuring staff roles.

## Constraints
- **Color Palette & Brand Identity**: Warm cream `#F7EEDB`, Charcoal `#171717`, Signal red `#E6321C`, and strictly derived tints. Typography: Manrope only. Icons: Lucide React only.
- **Database Architecture Invariant**: `store.ts` must never directly import `db-index.service.ts`; coupling only via `registerSaveHook(rebuildIndexes)`.
- **Payment & Financial Integrity**: Razorpay webhook HMAC SHA-256 signature verification over raw request body; zero price trust from client payloads.
- **Ports & Runtimes**: Backend API on `3000`, Frontend on `5173`, Admin on `5174`.

## Success Criteria
- [x] Zero TypeScript errors across all workspaces (`npm run typecheck`).
- [x] Clean production builds across `apps/frontend`, `apps/admin`, and `apps/backend`.
- [x] 32 storefront customer routes and 27 administrative operational routes fully functional.
- [x] 2D customizer canvas renders interactive typography, front/back flips, and artwork uploads with craft surcharges.
- [x] Automated security and checkout price validation suites pass with 100% assertions.
- [x] Capacitor 8 Android shell runs with native haptics and status bar theming.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| REQ-01: Monorepo Foundation | Must-have | React 19 + NestJS 10 + Capacitor 8 + Shared packages |
| REQ-02: Storefront & PDP | Must-have | 32 routes, GSM callouts, size & fit guide, stock radar |
| REQ-03: Bespoke Customizer Canvas | Must-have | 2D canvas, 14 fonts, vector upload, DTG/Embroidery/DTF |
| REQ-04: Authoritative Pricing & Checkout | Must-have | Razorpay UPI/Cards/COD, server-side GST, HMAC webhook |
| REQ-05: 27-Route Admin Control Center | Must-have | Orders state machine, catalog matrix, finance ledger, RBAC |
| REQ-06: Cloudflare R2 Media Storage | Must-have | Presigned upload URLs, MIME validation, CDN delivery |
| REQ-07: Real-time 3D Mockup Studio | Should-have | Three.js / React Three Fiber interactive garment 3D preview |
| REQ-08: Order Notification Webhooks | Should-have | WhatsApp & SMS automated updates upon fulfillment transitions |
| REQ-09: GST B2C Compliance Reports | Should-have | Admin CSV/Excel export for HSN 6109 and tax reconciliation |
| REQ-10: PostgreSQL Prisma Sync | Should-have | Synchronization between in-memory `store.json` and Supabase DB |

---

*Last updated: 2026-10-01*

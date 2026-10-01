---
milestone: v1.0 Production
version: 1.0.0
updated: 2026-10-01T06:40:00+05:30
---

# Roadmap

> **Current Phase:** 3 - Production Hardening & Enhancement
> **Status:** executing

## Must-Haves (from SPEC)

- [x] Monorepo Architecture with shared packages (`packages/types`, `packages/config`)
- [x] Luxury streetwear catalog browsing with GSM specifications & fit guides
- [x] Interactive 2D Bespoke Customizer Studio with 14 display fonts & artwork upload
- [x] Authoritative backend pricing calculation (GST, shipping, coupons) & Razorpay checkout
- [x] 27-route Admin Control Center with 6-stage fulfillment state machine
- [x] Capacitor 8 Android native wrapper with haptics & status bar integration
- [ ] Real-time 3D garment mockup preview (Three.js / React Three Fiber)
- [ ] Automated SMS & WhatsApp customer notification triggers on order status changes
- [ ] Admin exportable GST compliance reports (B2C breakdown, HSN 6109 summary)
- [ ] Automated PostgreSQL sync runner between in-memory store and Supabase Prisma

---

## Phases

### Phase 1: Core E-Commerce Foundation
**Status:** ✅ Complete
**Objective:** Deliver core storefront catalog, shopping bag, authoritative pricing engine, and Razorpay payment integration.
**Requirements:** REQ-01, REQ-02, REQ-04

**Plans:**
- [x] Plan 1.1: Monorepo scaffolding, npm workspaces, shared types, and Tailwind tokens
- [x] Plan 1.2: Storefront catalog, PDP with GSM specifications, fit guide, and stock radar
- [x] Plan 1.3: Persistent shopping bag drawer with free-shipping meter & promo code engine
- [x] Plan 1.4: Authoritative NestJS pricing service and Razorpay checkout modal with raw HMAC webhook verification
- [x] Plan 1.5: 6-stage order fulfillment state machine (`Placed → Confirmed → Processing → Shipped → Out for Delivery → Delivered`)

---

### Phase 2: Atelier Studio, Admin & Mobile
**Status:** ✅ Complete
**Objective:** Deliver interactive 2D customizer canvas, 27-route administrative control center, Cloudflare R2 media pipeline, and Capacitor 8 Android shell.
**Requirements:** REQ-03, REQ-05, REQ-06

**Plans:**
- [x] Plan 2.1: 2D garment customizer engine with front/back flip, colorway switching, 14 curated typography display fonts, and vector/raster drag-and-scale
- [x] Plan 2.2: Craftsmanship surcharge engine (DTG, High-Density Embroidery, DTF) with stitch count and placement estimates
- [x] Plan 2.3: 27-route administrative control center across 7 divisions with variant matrix generator
- [x] Plan 2.4: Cloudflare R2 presigned upload pipeline with UUID asset isolation and MIME whitelisting
- [x] Plan 2.5: Capacitor 8 Android shell with tactile haptic feedback and status bar theming
- [x] Plan 2.6: Decouple `store.ts` from `db-index.service.ts` and index 7,333+ nodes in Graphify

---

### Phase 3: Production Hardening & Enhancement
**Status:** 🔄 In Progress
**Objective:** Enhance the user experience with 3D garment previews, automated customer notification webhooks, GST B2C compliance reporting, database synchronization, and PWA background sync.
**Requirements:** REQ-07, REQ-08, REQ-09, REQ-10

**Plans:**
- [x] Plan 3.1: Implement real-time 3D garment mockup preview (Three.js / React Three Fiber) as an optional toggle in the customizer
- [x] Plan 3.2: Integrate WhatsApp & SMS notification webhooks for live parcel tracking updates
- [ ] Plan 3.3: Implement admin exportable CSV/Excel reports for GST compliance (B2C tax breakdown, HSN 6109 summary)
- [ ] Plan 3.4: Configure automated PostgreSQL migration & sync runner to bridge in-memory `store.json` with Supabase Prisma tables
- [ ] Plan 3.5: Implement PWA background synchronization for offline cart and wishlist mutations

---

### Phase 4: Logistics Scale & Direct Courier Integrations
**Status:** ⬜ Not Started
**Objective:** Direct carrier integrations (Shiprocket / Delhivery), 4×6 thermal shipping labels, advanced cohort LTV analytics, and native iOS App Store release.
**Depends on:** Phase 3

**Plans:**
- [ ] Plan 4.1: Direct carrier API integration for automated AWB generation and reverse pickups
- [ ] Plan 4.2: 4×6 thermal shipping label generator and barcode picklists for warehouse packing
- [ ] Plan 4.3: Advanced customer LTV cohort analytics and geographic demand heatmaps
- [ ] Plan 4.4: Capacitor iOS project configuration, certificates, and TestFlight deployment

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1: Foundation | ✅ | 5/5 | 100% |
| 2: Atelier & Admin | ✅ | 6/6 | 100% |
| 3: Production Hardening | 🔄 | 2/5 | 40% |
| 4: Logistics & Scale | ⬜ | 0/4 | 0% |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1: Foundation | 2026-08-01 | 2026-08-20 | 20 days |
| 2: Atelier & Admin | 2026-08-21 | 2026-09-18 | 29 days |
| 3: Production Hardening | 2026-10-01 | — | In Progress |
| 4: Logistics & Scale | — | — | — |

# DECISIONS.md — Architecture Decision Records

> **Purpose**: Log significant technical decisions and their rationale for BINGOOO.

## Decisions

### [DECISION-001] Decoupled Store and In-Memory Hash Indexes via Observer Hook
**Date**: 2026-09-15  
**Status**: Accepted  
**Context**: Direct import between `store.ts` and `db-index.service.ts` created a circular dependency, complicating testing and index invalidation.  
**Decision**: Invert control by registering a save hook (`registerSaveHook(rebuildIndexes)`). `store.ts` never imports `db-index.service.ts`.  
**Consequences**: Clean separation of concerns; instant O(1) hash lookups upon mutation without cyclic bundling issues.  

### [DECISION-002] Server-Side Authoritative Pricing
**Date**: 2026-08-10  
**Status**: Accepted  
**Context**: Client-side pricing calculations are vulnerable to tampering in e-commerce apps.  
**Decision**: All item prices, taxes (GST 12%/18%), discount codes, and shipping fees are calculated exclusively on the backend (`apps/backend`). Client prices are strictly untrusted.  
**Consequences**: Total immunity against client price modification attacks; strict checkout validation.  

### [DECISION-003] Raw Request Body Razorpay Webhook Verification
**Date**: 2026-08-15  
**Status**: Accepted  
**Context**: JSON parsing middleware before webhook verification alters whitespace and key order, invalidating HMAC SHA-256 signatures.  
**Decision**: Capture raw request buffer for the Razorpay webhook route before any JSON transformation.  
**Consequences**: Reliable cryptographic verification of payment events without false signature mismatches.  

### [DECISION-004] Capacitor 8 Unified PWA Container
**Date**: 2026-09-01  
**Status**: Accepted  
**Context**: Separate native mobile codebases (Kotlin/Swift) double maintenance overhead for a fast-moving streetwear platform.  
**Decision**: Use Capacitor 8 wrapping `apps/frontend` with native haptics, status bar styling, and camera access.  
**Consequences**: 100% shared code with native tactile polish on mobile devices.  

### [DECISION-005] Curated Design System & Lucide React Iconography
**Date**: 2026-08-05  
**Status**: Accepted  
**Context**: Visual inconsistency and emoji clutter detract from luxury streetwear brand positioning.  
**Decision**: Strict palette of Warm cream `#F7EEDB`, Charcoal `#171717`, Signal red `#E6321C`, Manrope typography, and Lucide React vector icons only.  
**Consequences**: High-end aesthetic cohesion across all 32 storefront and 27 admin views.  

### [DECISION-006] Admin Panel Authority for Garment Customizer Photography & Zero Mockup Clipart
**Date**: 2026-10-10  
**Status**: Accepted  
**Context**: Synthetic cartoon shirt icons, vector mockups, and fake overlay text (`"YOUR LINE HERE"`, `"BACK PRINT ARTWORK"`) cheapen the bespoke customizer and fail to accurately show real garment drape or fabric textures.  
**Decision**: Completely decommission mockup clipart and fake text overlays across the storefront and homepage. Establish Admin Panel Customizer Studio (`/customizer`) as the authoritative source for high-resolution transparent PNG garment photography (front/back), dynamic swatches, and sizing specs.  
**Consequences**: Customers design on authentic streetwear photography with true-to-life alpha transparency; administrators have dynamic control over customizer apparel without code redeploys.  

### [DECISION-007] 100% Universal Free Shipping Pan-India & Zero Cash on Delivery (100% Secure Prepaid)
**Date**: 2026-10-05  
**Status**: Accepted  
**Context**: Complex tiered shipping rules (₹999 thresholds) and Cash on Delivery (COD) cause high Return to Origin (RTO) rates, cart friction, and reconciliation overhead.  
**Decision**: Standardize platform to 100% complimentary Pan-India shipping on all orders regardless of cart value, and transition exclusively to 100% secure prepaid payments (Razorpay UPI, Cards, NetBanking) with a 5% instant discount.  
**Consequences**: Frictionless one-page checkout, zero RTO fraud, simplified order pipeline, and guaranteed seller revenue capture.  

---

*Last updated: 2026-10-10*

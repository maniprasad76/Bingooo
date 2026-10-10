# Plan: Comprehensive Full-Stack & E2E Testing Suite (Storefront, Admin & Backend)

> **Status:** Phase 5 — Complete & Verified (219 Automated E2E Tests Passing Across All Workspaces)  
> **Target Date:** October 10, 2026  
> **Scope:** Full-Stack End-to-End Realtime User Simulation across all Storefront pages, Admin Operations Console, and NestJS Backend APIs.

---

## 1. Objectives & Scope

Deliver complete verification of the entire Bingooo platform simulating a real user experience across:
1. **Backend Integration & Security Suites**:
   - `test:security`: Auth, Roles, Headers, Rate limits, Input validation.
   - `test:checkout`: Cart calculations, Pricing invariants, Razorpay order generation, HMAC verification.
   - `test:admin`: Administrative endpoints, RBAC enforcement, mutations.
   - `test:upload`: Media asset uploads and validation.
   - `test:studio`: Customizer studio configuration API.
   - `test:durability`: Persistence store and index synchronization.
2. **Production Smoke & Infrastructure Probes**:
   - Domain resolution, SSL status, API liveness/readiness, statutory legal pages, feeds.
3. **Storefront Customer-Facing Pages (E2E with Playwright)**:
   - `/` (Home): Hero, curation collections, product cards, footer.
   - `/shop`: Catalog grid, category filters, sorting.
   - `/category/:slug`: Filtered collection views (`t-shirts`, `hoodies`).
   - `/product/:slug`: Image gallery, variant selection, "Find Your Fit" Size Advisor modal, Add to Cart.
   - `/customize`: Customizer Studio garment picker, canvas text/image, front/back rotation, size picker, real-time pricing, Add Custom to Cart.
   - `/cart`: Bag drawer and page, quantity changes, pricing recalculation, coupon input.
   - `/search`: Search modal (`Ctrl+K`) and dedicated `/search?q=...` page.
   - `/track-order`: Order number lookup and input validation.
   - `/login`, `/signup`, `/forgot-password`: Authentication forms and validations.
   - `/about`, `/faq`, `/contact`, `/policies`, `/privacy-policy`, `/terms`, `/shipping-policy`, `/returns-refunds`, `/cancellation-policy`, `/size-guide`, `/artwork-guidelines`: Legal and brand pages.
   - `/404`: Non-existent route error handling.
4. **Admin Operations Console Pages (E2E with Playwright)**:
   - `/login`: Admin login interface.
   - `/dashboard`: KPI analytics, revenue, orders metrics.
   - `/orders`: Order records, status filters, Shiprocket dispatch, 4×6" Thermal Shipping Label preview, Orders CSV export.
   - `/products` & `/products/new`: Product catalog management and creation form.
   - `/categories`: Category manager.
   - `/inventory`: Stock levels and variant inventory matrix.
   - `/customizer`: Customizer studio garment photo manager and configurations.
   - `/customers`: Customer CRM.
   - `/reviews`: Customer reviews moderation.
   - `/returns`: Return requests management.
   - `/coupons`: Promotional discount codes.
   - `/settings`: General store settings and logistics configurations.
5. **Real-time User Journeys**:
   - Journey 1: Customer discovery -> Size Advisor recommendation -> Cart -> Checkout.
   - Journey 2: Customizer Studio creation -> Personalization -> Add to Cart.
   - Journey 3: Store Admin operations -> Order management -> CSV Export -> Thermal Label generation.

---

## 2. Test Execution Architecture

| Step | Component | Action | Verification Criteria |
|---|---|---|---|
| 1 | Backend API | Run backend test suites (`security`, `checkout`, `admin`, `upload`, `studio`, `durability`) | 100% tests passing |
| 2 | Live Smoke | Run `test/live-smoke.mjs` against live endpoints | All endpoints 200 OK |
| 3 | Dev Servers | Launch Frontend (port 5173) and Admin (port 5174) with active Backend (port 3000) | Servers listening & responding |
| 4 | Playwright E2E Suite | Run comprehensive headless browser suite (`test/comprehensive-e2e.mjs`) | Every page loads, interacts, and reports status |
| 5 | Complete Report | Generate comprehensive markdown artifact detailing results, timings, and findings | Clean sign-off |

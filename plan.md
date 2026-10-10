# Plan: Shiprocket Logistics Integration, 4×6" Thermal Shipping Labels, Orders CSV Export & Storefront Fit Intelligence

> **Status:** Phase 5 — Complete & Verified (All Workspaces Typechecked with 0 Errors)  
> **Target Date:** October 10, 2026  
> **Scope:** Full-Stack Logistics, Warehouse Tooling, Sales Telemetry & Fit Recommendation Engine

---

## 1. Feature Architecture & Objectives

### A. Shiprocket Logistics Integration & Automated AWB Workflow
- **Backend Service (`apps/backend/src/shipping/shiprocket.service.ts`)**:
  - Secure authentication with Shiprocket API v2 (`/v1/external/auth/login`) with in-memory token cache (10 days TTL).
  - Environment-aware credentials (`SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`), with automated sandbox/mock fallback when credentials are unconfigured.
  - **Serviceability Check (`checkServiceability`)**: Queries delivery pincode, parcel weight, and returns courier options (Delhivery, Bluedart, DTDC, Xpressbees) with ETAs.
  - **Shipment Order Creation (`createShipment`)**: Pushes order items, dimension (30×25×5 cm), weight (0.45 kg per 240 GSM tee), customer delivery address, and prepaid payment status.
  - **AWB Generation (`generateAWB`)**: Assigns courier partner and captures AWB code.
  - **Live Tracking & Webhook (`trackShipment` & `handleWebhook`)**: Ingests automated tracking events and updates order status + triggers WhatsApp updates.
- **Shipping Controller (`apps/backend/src/shipping/shipping.controller.ts`)**:
  - `POST /shipping/shiprocket/create-shipment/:orderId`
  - `POST /shipping/shiprocket/generate-awb/:orderId`
  - `GET /shipping/shiprocket/serviceability`
  - `POST /shipping/shiprocket/webhook`
  - `GET /shipping/label/:orderId` (generates thermal label)

### B. 4×6" Thermal Shipping Label Generator
- **Dedicated Printable Layout (`apps/backend/src/shipping/shipping-label.util.ts` & Admin Modal)**:
  - Exact 4×6 inch (100mm × 150mm) thermal label CSS styling (`@media print { @page { size: 4in 6in; margin: 0; } }`).
  - Scannable Code128 SVG barcode for Order Number and AWB.
  - BINGOOO Dispatch Hub origin address + GSTIN details.
  - Customer shipping destination, phone number, pin code routing box.
  - Order manifest items (SKU, Size, Color, Qty) + "PREPAID — DO NOT COLLECT CASH" watermark.

### C. Admin Orders CSV / Excel Export
- **Export Engine (`apps/admin/src/pages/OrdersPage.tsx`)**:
  - Export filtered orders to CSV with UTF-8 BOM encoding for seamless Excel / Numbers / Google Sheets compatibility.
  - Fields included: Order #, Created At, Customer Name, Email, Phone, Items Summary, Units, Payment Mode, Order Total (₹), Discount (₹), Shipping Status, AWB Code, Courier, Destination City, State, Pincode.

### D. Custom Studio Real Garment Photos Setup
- Ensure the newly saved transparent PNG garments (`Oversized T-Shirt 240 GSM` with Obsidian Black and Pure White front/back views) are properly populated in `db.customizer_config` and active for storefront display on `/customize`.

### E. "Find Your Fit" Size Recommendation Calculator
- **Component (`apps/frontend/src/components/catalog/SizeAdvisorModal.tsx`)**:
  - Height (cm or ft/in) slider or input.
  - Weight (kg or lbs) selector.
  - Fit preference: Fitted / Regular Drop-Shoulder / Boxy Heavyweight Oversized.
  - Algorithmic calculation matching Bingooo 240 GSM streetwear drape specs (`S: 42" chest`, `M: 44" chest`, `L: 46" chest`, `XL: 48" chest`, `XXL: 50" chest`).
  - Integrated into `ProductPage.tsx` and `CustomizerPage.tsx`.

---

## 2. File Modification & Implementation Plan

| File | Change Details |
|---|---|
| `apps/backend/src/shipping/shiprocket.service.ts` | **Create**: Core Shiprocket client with token auth, order creation, AWB generation, serviceability, and mock sandbox mode |
| `apps/backend/src/shipping/shipping-label.util.ts` | **Create**: HTML/SVG 4×6 thermal printable shipping label generator |
| `apps/backend/src/shipping/shipping.controller.ts` | **Update**: Endpoints for Shiprocket dispatch, AWB, tracking, thermal label, and webhook |
| `apps/backend/src/shipping/shipping.module.ts` | **Update**: Register ShiprocketService and imports |
| `apps/admin/src/pages/OrdersPage.tsx` | **Update**: Add Shiprocket dispatch action, CSV Export button, and 4×6 Thermal Label Print preview |
| `apps/frontend/src/components/catalog/SizeAdvisorModal.tsx` | **Create**: "Find Your Fit" interactive size recommendation modal |
| `apps/frontend/src/pages/ProductPage.tsx` | **Update**: Connect "Find Your Fit" button beside size guide |
| `apps/frontend/src/pages/CustomizerPage.tsx` | **Update**: Connect "Find Your Fit" button to size selector |

---

## 3. Verification & Acceptance Criteria
1. `npm run typecheck` passes with zero errors across all workspaces.
2. Orders page allows 1-click CSV export with valid download.
3. Orders page allows 1-click Shiprocket dispatch & 4×6 Thermal Label printing with barcode.
4. Storefront displays Size Advisor modal that calculates accurate size recommendation.
5. All tests and git push to GitHub `origin/main` complete cleanly.

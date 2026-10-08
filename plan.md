# Implementation Plan: Update Custom Page Default Compared Price to ₹1,499

## Objective
Update the default compared price (`compareAtPrice`) for the bespoke Studio/Custom page (`/custom`) to ₹1,499 (previously ₹1,299) across the storefront, backend defaults, and admin studio defaults, and polish the display with discount percentage badges.

## Proposed Changes

### 1. Storefront (`apps/frontend/src/pages/CustomizerPage.tsx`)
- Update `DEFAULT_GARMENTS.oversized.compareAtPrice` from `1299` to `1499`.
- In the Fit selector buttons, show both offer price and struck-through compared price.
- In the Sticky Bauhaus Action Bar, display the offer price (₹649), struck-through compared price (₹1499), and a dynamic discount badge (e.g., 57% OFF).

### 2. Backend API (`apps/backend/src/customizations/customizations.service.ts`)
- In `CANONICAL_DEFAULTS`, update `oversized.compareAtPrice` from `1299` to `1499`.
- In `getStudioConfig()`, automatically migrate any existing cached default of `1299` to `1499`.

### 3. Admin Studio (`apps/admin/src/pages/CustomizerStudioPage.tsx`)
- In `DEFAULT_GARMENTS`, update `oversized.compareAtPrice` from `1299` to `1499`.

## Verification Plan
- Run `npm run typecheck` across all workspaces to guarantee zero compilation errors.
- Verify pricing calculations and display formatting.

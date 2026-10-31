# Plan: Complete Removal of Cash on Delivery (COD) & Partial COD (Prepaid Only)

> **Archived:** October 27, 2026  
> **Status:** Completed & Shipped (`commit 982ea31`)  
> **Branch:** `main`

## Goal
Transition the Bingooo platform to operate strictly on 100% secure prepaid orders (Razorpay UPI, Credit/Debit Cards, NetBanking) with universal free shipping pan-India. Completely remove all COD payment options, partial-COD residue, COD fee calculations, and update all customer-facing policies, FAQs, thermal labels, and SEO meta tags.

---

## Executed Changes

### 1. Shared Types
#### `packages/types/src/order.ts`
- Changed `PaymentMethod` type to strictly `'prepaid'`.
- Removed COD references from `OrderStatus` comments.

---

### 2. Backend Validation & Order Pipeline
#### `apps/backend/src/checkout/dto/checkout.dto.ts`
- Updated `CheckoutValidationDto`:
  - Locked `@IsIn(['prepaid'])`.
  - Changed `paymentMethod!: 'prepaid'`.

#### `apps/backend/src/checkout/checkout.service.ts`
- Removed `isCod` logic and custom-item COD restrictions.
- Standardized `shippingFee` to `0` (universal free delivery).
- Set `payableNow: total`.

#### `apps/backend/src/orders/orders.service.ts`
- In `createOrder`:
  - Ensured `status: 'pending_payment'` for all orders until payment capture.
  - Removed COD notification bypasses.
- In `expireUnpaidOrders`:
  - Removed COD check.
- In `sendConfirmationEmail`:
  - Enforced captured payment before confirmation email dispatch.
  - Set `paymentMethod: 'Razorpay (Prepaid)'`.

#### `apps/backend/src/shipping/shiprocket.service.ts`
- Set `payment_method: 'Prepaid'` and ₹0 collect amount.

#### `apps/backend/src/shipping/shipping-label.util.ts`
- Set thermal label watermark to `PREPAID · ₹${totalAmount}`.

#### `apps/backend/src/email/email.service.ts`
- Removed COD message from email confirmation template.

#### `apps/backend/test/run-security-suite.ts`
- Updated security assertions: verifying that COD payment method is rejected with `400 Bad Request` and labels watermark prepaid.

---

### 3. Storefront Frontend
#### `apps/frontend/src/pages/CheckoutPage.tsx`
- Changed `type PaymentMethodType = 'upi' | 'cards'`.
- Removed Option 3 (Cash on Delivery) radio box and description card.
- In `onSubmit`, removed COD bypass branch; all orders proceed to Razorpay payment flow.
- Removed COD surcharge calculations.

#### `apps/frontend/src/pages/OrderSuccessPage.tsx`
- Removed `isCod` checks and labels. Displaying "Order confirmed" and "Paid online // 100% Secure".

#### `apps/frontend/src/pages/FaqPage.tsx`
- Updated FAQ to explain 100% secure prepaid checkout policy via UPI/Cards with universal free delivery.

#### `apps/frontend/src/pages/ShippingPolicyPage.tsx`
- Removed ₹80 cash on delivery mentions from SEO description and policy text.

#### `apps/frontend/src/pages/HomePage.tsx`, `ShopPage.tsx`, `SEO.tsx`, `index.html`, `scripts/prerender-seo.mjs`, `src/lib/seo/catalog-seo.mjs`
- Purged all "cash on delivery available" copy from meta descriptions, keywords, and structured JSON-LD schemas.

---

## Verification Summary
1. `npm run typecheck` — 0 errors across `@bingooo/admin`, `@bingooo/api`, `@bingooo/frontend`, `@bingooo/types`.
2. `npm run test:security -w apps/backend` — 49/49 tests passed.
3. `npm run test:checkout -w apps/backend` — 10/10 tests passed.
4. `python -m graphify update .` — 9,131 nodes, 12,951 edges, 774 communities indexed.
5. `git push origin main` — Shipped to GitHub (`982ea31`).

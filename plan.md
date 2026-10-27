# Plan: Complete Removal of Cash on Delivery (COD) & Partial COD (Prepaid Only)

## Goal
Transition the Bingooo platform to operate strictly on 100% secure prepaid orders (Razorpay UPI, Credit/Debit Cards, NetBanking) with universal free shipping pan-India. Completely remove all COD payment options, partial-COD residue, COD fee calculations, and update all customer-facing policies, FAQs, thermal labels, and SEO meta tags.

---

## Proposed Changes

### 1. Shared Types
#### `packages/types/src/order.ts`
- Change `PaymentMethod` type to strictly `'prepaid'`.
- Remove any COD descriptions/references from `OrderStatus` comments.

---

### 2. Backend Validation & Order Pipeline
#### `apps/backend/src/checkout/dto/checkout.dto.ts`
- Update `CheckoutValidationDto`:
  - Change `@IsIn(['prepaid', 'cod'])` to `@IsIn(['prepaid'])`.
  - Change `paymentMethod!: 'prepaid' | 'cod'` to `paymentMethod!: 'prepaid'`.

#### `apps/backend/src/checkout/checkout.service.ts`
- Remove `const isCod = dto.paymentMethod === 'cod'`.
- Remove the custom-items COD rejection check (`COD_NOT_AVAILABLE`).
- Standardize `shippingFee` to `0` (universal free delivery).
- Set `payableNow: total`.

#### `apps/backend/src/orders/orders.service.ts`
- In `createOrder`:
  - Set `status: 'pending_payment'` always (all orders start unpaid until payment gateway capture).
  - Remove `if (isCod) this.notifyConfirmed(order);` (confirmation notifications happen only when payment is captured via Razorpay).
- In `expireUnpaidOrders`:
  - Remove `|| order.payment_method === 'cod'` check since all orders are prepaid.
- In `sendConfirmationEmail`:
  - Remove conditional `paymentMethod: cod ? 'Cash on delivery' : 'Razorpay'`; set to `'Razorpay (Prepaid)'`.
  - Require captured payment before sending email.

#### `apps/backend/src/shipping/shiprocket.service.ts`
- In `createCustomOrderPayload`:
  - Set `payment_method: 'Prepaid'` always.
  - Set `sub_total: 0` for collect amount (0 COD charge).

#### `apps/backend/src/shipping/shipping-label.util.ts`
- Remove COD watermark check (`isCod ? COD · COLLECT... : PREPAID...`).
- Always watermark shipping labels with `PREPAID · ₹${totalAmount}`.

#### `apps/backend/src/email/email.service.ts`
- In `sendOrderConfirmationEmail` HTML template:
  - Remove the ternary checking `params.paymentMethod === 'Cash on delivery'`.

#### `apps/backend/test/run-security-suite.ts`
- Update test cases that used `payment_method: 'cod'` or tested COD refusal to test prepaid flows and ensure invalid payment methods like `'cod'` are rejected by the checkout validator.

---

### 3. Storefront Frontend
#### `apps/frontend/src/pages/CheckoutPage.tsx`
- Change `type PaymentMethodType = 'upi' | 'cards' | 'cod'` to `'upi' | 'cards'`.
- Remove the Option 3 Cash on Delivery (COD) radio box UI card.
- In `onSubmit`:
  - Remove the `if (paymentMethod === 'cod')` branch.
  - All orders create an order with `paymentMethod: 'prepaid'` and proceed to Razorpay modal.
- Remove `isPrepaid` / `paymentMethod === 'cod'` shipping fee calculations (shipping fee is always ₹0).

#### `apps/frontend/src/pages/OrderSuccessPage.tsx`
- Remove `isCod` state check (`order.payment_method === 'cod' || Boolean(navState.isCod)`).
- Clean up order status badges and descriptions: display "Order confirmed" and "Paid online // 100% Secure".

#### `apps/frontend/src/pages/FaqPage.tsx`
- Update FAQ item "Is Cash on Delivery (COD) available?" to state:
  - "No. To ensure fast, seamless dispatch and zero delivery friction, Bingooo operates exclusively on 100% secure prepaid checkout via UPI (Google Pay, PhonePe, Paytm, CRED), Cards, and NetBanking, with free delivery on every order."

#### `apps/frontend/src/pages/ShippingPolicyPage.tsx`
- Update meta description and policy text to remove all mentions of "₹80 cash on delivery".

#### `apps/frontend/src/pages/HomePage.tsx`, `ShopPage.tsx`, `SEO.tsx`, `index.html`, `scripts/prerender-seo.mjs`, `src/lib/seo/catalog-seo.mjs`
- Update SEO descriptions and structured FAQ schemas to remove "cash on delivery available" and state "100% secure prepaid checkout & universal free delivery across India".

---

## Verification Plan

### Automated Checks
1. Typecheck: `npm run typecheck` across all monorepo packages and apps (`packages/types`, `apps/backend`, `apps/frontend`, `apps/admin`).
2. Run backend security test suite: `npm run test:security` in `apps/backend`.
3. Re-index codebase with Graphify: `python -m graphify update .`.

### Git Push
1. Check `git status` and `git diff`.
2. Commit with clean GSD message: `feat(checkout): enforce 100% prepaid-only orders and remove all COD and partial COD`.
3. Push to GitHub: `git push origin main`.

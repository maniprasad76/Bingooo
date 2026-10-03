# BINGOOO Milestone Plan: Complete Removal of COD (Cash on Delivery)

## Goal
Completely remove Cash on Delivery (COD) and Partial COD from the BINGOOO project, establishing a 100% secure prepaid architecture (UPI, Cards, NetBanking via Razorpay) across the backend API, shared types, admin console, frontend checkout, policy pages, and SEO metadata.

---

## 1. Scope & Decision Record

### IN SCOPE
1. **Frontend Checkout (`apps/frontend/src/pages/CheckoutPage.tsx`)**:
   - Remove Partial COD (Option 2) and Full COD (Option 3) radio options, state variables, and handlers.
   - Remove COD calculation, COD fees, advance token breakdown, and conditional COD validation alerts.
   - Streamline checkout payment options to Prepaid UPI (PhonePe, GPay, Paytm, Any UPI) and Cards / NetBanking / Wallets via Razorpay.
   - Retain 5% Instant Prepaid Discount across all orders.

2. **Frontend Policies & Marketing (`apps/frontend`)**:
   - `FaqPage.tsx`: Clarify that Bingooo operates 100% prepaid with instant dispatch, and refunds route directly to original payment source.
   - `ShippingPolicyPage.tsx`: Replace COD delivery mentions with contactless secure OTP delivery.
   - `ReturnsRefundsPage.tsx`: Clarify automated Razorpay refunds to original UPI/Card source.
   - `TermsPage.tsx`: Remove COD advance commitment terms; emphasize encrypted prepaid checkout.
   - `HomePage.tsx`, `ShopPage.tsx`, `ProductPage.tsx`, `SEO.tsx`, `schema.ts`: Remove "COD" references from meta descriptions and schema `paymentAccepted`.

3. **Admin Settings (`apps/admin/src/pages/SettingsPage.tsx`)**:
   - Remove COD and Partial COD toggles and input fields (`cod_enabled`, `partial_cod_enabled`, `partial_cod_advance_amount`, `max_cod_limit`, `cod_deposit_percentage`).
   - Retain Prepaid Discount (%) configuration under "Payments & Prepaid Policy".

4. **Shared Types (`packages/types`)**:
   - `packages/types/src/order.ts`: Update `PaymentMethod` to `'prepaid'`. Remove `codDeposit` and `codRemaining` from order types.

5. **Backend Data & Logic (`apps/backend`)**:
   - `apps/backend/src/checkout/dto/checkout.dto.ts`: Lock `paymentMethod` to `@IsIn(['prepaid'])`.
   - `apps/backend/src/checkout/checkout.service.ts`: Remove COD and Partial COD calculation logic and exceptions (`PARTIAL_COD_DISABLED`, `COD_DISABLED`, `COD_LIMIT_EXCEEDED`).
   - `apps/backend/src/orders/orders.service.ts`: Create all orders as `pending_payment` / `prepaid` until captured by Razorpay.
   - `apps/backend/src/payments/payments.service.ts`: Strip COD config from `getPaymentConfig()`. Ensure payable amount always equals order total.
   - `apps/backend/src/email/email.service.ts`: Remove COD advance notice block from order confirmation email template.
   - `apps/backend/src/admin/dto/settings.dto.ts`: Remove COD-related fields from whitelist validation.
   - `apps/backend/src/common/database/store.ts` & `apps/backend/data/seed.json` & `store.json`: Clean up COD settings and update sample orders.
   - `apps/backend/test/run-security-suite.ts`: Update test order creation from `'cod'` to `'prepaid'`.

6. **Documentation (`prd.md`)**:
   - Update payment selection specs to 100% prepaid.

### OUT OF SCOPE
- Changing Razorpay integration flow or webhook verification (remains raw HMAC SHA-256).
- Modifying return inspection or standard RMA flow (returns still issue real refunds via Razorpay).

---

## 2. Execution Phases

### Phase 2.1: Types & Backend Core
1. Update [packages/types/src/order.ts](file:///c:/Users/manip/Desktop/bingooo/packages/types/src/order.ts)
2. Update [apps/backend/src/checkout/dto/checkout.dto.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/checkout/dto/checkout.dto.ts)
3. Update [apps/backend/src/checkout/checkout.service.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/checkout/checkout.service.ts)
4. Update [apps/backend/src/orders/orders.service.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/orders/orders.service.ts)
5. Update [apps/backend/src/payments/payments.service.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/payments/payments.service.ts)
6. Update [apps/backend/src/admin/dto/settings.dto.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/admin/dto/settings.dto.ts)
7. Update [apps/backend/src/common/database/store.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/common/database/store.ts)
8. Update [apps/backend/src/email/email.service.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/email/email.service.ts)
9. Update [apps/backend/data/seed.json](file:///c:/Users/manip/Desktop/bingooo/apps/backend/data/seed.json) and [apps/backend/data/store.json](file:///c:/Users/manip/Desktop/bingooo/apps/backend/data/store.json)
10. Update [apps/backend/test/run-security-suite.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/test/run-security-suite.ts)

### Phase 2.2: Admin Console
1. Update [apps/admin/src/pages/SettingsPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/SettingsPage.tsx)

### Phase 2.3: Frontend Storefront & Policies
1. Update [apps/frontend/src/pages/CheckoutPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/CheckoutPage.tsx)
2. Update [apps/frontend/src/pages/FaqPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/FaqPage.tsx)
3. Update [apps/frontend/src/pages/ShippingPolicyPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/ShippingPolicyPage.tsx)
4. Update [apps/frontend/src/pages/ReturnsRefundsPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/ReturnsRefundsPage.tsx)
5. Update [apps/frontend/src/pages/TermsPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/TermsPage.tsx)
6. Update [apps/frontend/src/pages/HomePage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/HomePage.tsx), [ShopPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/ShopPage.tsx), [ProductPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/ProductPage.tsx), [SEO.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/components/common/SEO.tsx), and [schema.ts](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/lib/seo/schema.ts)
7. Update [prd.md](file:///c:/Users/manip/Desktop/bingooo/prd.md)

### Phase 2.4: Verification & Graph
1. Run `npm run typecheck` across all workspaces (must be 0 errors).
2. Run backend test suites: `npm run test:security -w apps/backend`, `npm run test:checkout -w apps/backend`, `npm run test:admin -w apps/backend`.
3. Run `python -m graphify update .` to sync codebase AST knowledge graph.

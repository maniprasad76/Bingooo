# Plan: Fix Critical Security, Auth, Checkout & Catalog Issues

## Objective
Remediate the critical bugs and security vulnerabilities identified in the audit:
1. Secure the password reset flow against account takeover.
2. Fix Admin Google OAuth role assignment in backend AuthGuard.
3. Clean out dummy address pre-fill in CheckoutPage.
4. Restrict CORS to exact authorized production and preview domains (remove `*.vercel.app` wildcard).
5. Restore the product catalog with genuine garments in `store.json`, `store.ts`, and `fallbackProducts.ts`.

---

## Files to Modify

1. **`apps/backend/src/auth/dto/auth.dto.ts`**
   - Update `ResetPasswordDto` to take `token` and `newPassword`.
2. **`apps/backend/src/auth/auth.service.ts`**
   - In `forgotPassword`: generate a secure token (stored with 1-hour expiry on user record).
   - In `resetPassword`: validate token, verify expiry, and hash new password.
3. **`apps/backend/src/auth/auth.controller.ts`**
   - Update `resetPassword` endpoint to pass `body.token` and `body.newPassword`.
4. **`apps/backend/src/common/guards/auth.guard.ts`**
   - Check if incoming email belongs to `AUTHORIZED_ADMIN_EMAILS`.
   - Assign `role: 'SUPER_ADMIN'` and `permissions: ['*']` automatically.
   - Call `saveDb()` when registering user.
5. **`apps/backend/src/main.ts`**
   - Remove `origin.endsWith('.vercel.app')` wildcard.
   - Keep only explicit authorized domains and localhost.
6. **`apps/frontend/src/pages/CheckoutPage.tsx`**
   - Remove fake default address fields ("Aditi Sharma", Bengaluru address).
7. **`apps/backend/src/common/database/store.ts` & `apps/backend/data/store.json`**
   - Provide default seed products if `products.length === 0`.
8. **`apps/frontend/src/data/fallbackProducts.ts`**
   - Populate `FALLBACK_PRODUCTS` with complete streetwear garments matching the store catalog.

---

## Verification Steps
1. Run `npm run typecheck` across all workspaces to guarantee zero compiler errors.
2. Verify `POST /api/v1/auth/reset-password` without valid token returns `400 BadRequest`.
3. Verify `AuthGuard` grants `SUPER_ADMIN` to `basaprasaduu@gmail.com`.
4. Verify `CheckoutPage.tsx` defaults are clean.
5. Verify `products` in `store.json` and `fallbackProducts.ts` are populated.

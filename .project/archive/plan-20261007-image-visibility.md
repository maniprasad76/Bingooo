# PLAN: Fix Selected Cart Item and Order Item Images Across Checkout & Admin

> **Goal:** Ensure user-selected images (and custom artwork previews) are properly visible in both the Checkout Order Summary (`apps/frontend/src/pages/CheckoutPage.tsx`) and the Admin Orders Page (`apps/admin/src/pages/OrdersPage.tsx`), and resolve the ₹NaN price display in Checkout, without touching unrelated code.

---

## 1. Problem Diagnosis

1. **Frontend Checkout Page (`CheckoutPage.tsx`)**:
   - The Order Summary (both desktop line ~754 and mobile line ~406) only checks `item.customization?.previewKey`. If undefined (standard catalog items like "Brown Shirt"), it immediately falls back to displaying `<span className="font-heading font-black text-xs text-muted">BGO</span>`.
   - The price line uses `₹{item.total_price || item.unit_price * item.quantity}`. Since the backend returns `item.total` and `item.unitPrice`, `item.unit_price` is `undefined`, resulting in `undefined * 1` = `₹NaN`.

2. **Admin Orders Page (`OrdersPage.tsx`) & Backend Enrichment**:
   - In `OrdersPage.tsx`, `rawImg` only checks a few fields and misses `firstItem?.product?.images`, `variant?.image`, etc.
   - In `apps/admin/src/lib/api.ts`, `resolveImageUrl` does not handle relative API URLs in production on `admin.bingooo.co.in`, nor does it normalize broken default image URLs.
   - In `apps/backend/src/customizations/customizations.service.ts`, line 32 hardcodes a nonexistent file `/custom/tshirt-step-3-black.png` instead of `/custom/black-front.png`.
   - In `apps/backend/src/orders/orders.service.ts`, `createOrder` doesn't save `image_url` on `db.order_items`, and `enrichOrder` doesn't fall back to product title or alternate image fields.
   - In `store.json`, existing customizations have the dead URL `/custom/tshirt-step-3-black.png`.

---

## 2. Target Files & Concrete Changes

### File 1: `apps/frontend/src/pages/CheckoutPage.tsx`
- Import `resolveImageUrl` from `../lib/utils` and `getCartItemMeta` from `../lib/cartMeta`.
- Update item thumbnail rendering in both Desktop (lines ~753-763) and Mobile (lines ~405-415):
  - Check `item.customization?.previewKey || item.customization?.preview_key || item.image || item.imageUrl || item.product?.primaryImage || item.product?.images?.[0]?.url || item.product?.images?.[0] || item.variant?.image || item.variant?.imageUrl || meta?.image`.
  - Resolve with `resolveImageUrl`.
  - Add `onError` handling so if an image fails to load, it falls back to the BGO placeholder badge cleanly.
- Fix item price rendering (lines ~776 and ~422):
  - Use `item.total ?? (item.unitPrice ? item.unitPrice * item.quantity : (item.price ? item.price * item.quantity : (item.total_price ?? (item.unit_price ? item.unit_price * item.quantity : (meta?.price ? meta.price * item.quantity : 0)))))` to ensure zero `NaN` occurrences.
- Fix item title/size fallback with `meta?.title` and `meta?.size`.

### File 2: `apps/admin/src/lib/api.ts`
- In `resolveImageUrl(url)`:
  - If `url` contains `tshirt-step-3-black.png`, replace with `/custom/black-front.png`.
  - In production (`admin.bingooo.co.in`), ensure relative `/api/` or `api/` URLs point to `https://api.bingooo.co.in`.
  - Ensure `/custom/...` URLs resolve to local admin public folder or production domain.

### File 3: `apps/admin/src/pages/OrdersPage.tsx`
- In `OrdersPage.tsx`, expand image resolution for `rawImg`:
  - Check `o.primary_image`, `firstItem?.image_url`, `firstItem?.imageUrl`, `firstItem?.image`, `firstItem?.product?.images?.[0]?.url`, `firstItem?.product?.images?.[0]`, `firstItem?.product?.image_url`, `firstItem?.product?.primary_image`, `firstItem?.variant?.image`, `firstItem?.customization?.previewKey`, `firstItem?.customization?.preview_url`, `firstItem?.customization?.preview_key`.
- In the table row thumbnail (lines ~311-326), create a clean image error handler so broken images fall back to the Shirt icon instead of leaving a blank empty space.
- In the inspection modal (lines ~534-556), apply the same robust image resolution and fallback.

### File 4: `apps/backend/src/orders/orders.service.ts` & `checkout.service.ts`
- In `enrichOrder(order)`:
  - Enhance product resolution: if `productId` is not in `db.products`, try finding by `i.title_snapshot`.
  - Resolve `imageUrl` considering `i.image_url`, `primaryImage`, `product?.image_url`, `customization?.preview_url`, etc.
  - Map `tshirt-step-3-black.png` to `/custom/black-front.png`.
- In `checkout.service.ts` & `createOrder`:
  - Preserve `imageUrl` in `calculation.items` and store `image_url` on `db.order_items`.

### File 5: `apps/backend/src/customizations/customizations.service.ts` & `store.json`
- Change default preview URL from `/custom/tshirt-step-3-black.png` to `/custom/black-front.png`.
- Update stale entries in `store.json`.

---

## 3. Verification & Acceptance Criteria
- [ ] `npm run typecheck` passes with zero errors across all workspaces.
- [ ] Cart item image displays correctly on `/checkout` order summary for both catalog items and custom items.
- [ ] Price on `/checkout` order summary displays valid INR numbers (no `₹NaN`).
- [ ] Mobile order summary accordion on `/checkout` displays the item image and correct price.
- [ ] Admin `/orders` page displays the item preview image in the "ITEM / PREVIEW" column.
- [ ] Admin order inspect modal displays the item image.
- [ ] No regression in other components ("otherwise dont touch anything").

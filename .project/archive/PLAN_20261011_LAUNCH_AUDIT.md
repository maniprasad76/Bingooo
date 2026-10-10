# BINGOOO Production Readiness & Launch Audit Plan (`plan.md`)

## 1. Objective
Fulfill the 8-point production launch readiness checklist:
1. All advertised categories display products or clear customer availability messages.
2. Product pages have accurate images, prices, sizes, and stock.
3. Cart and checkout work on mobile with zero layout defects.
4. Payment success, failure, and order confirmation are verified.
5. Shipping charges (Free Pan-India) and prepaid discounts (5%) are consistent across backend and frontend.
6. Privacy, shipping, returns, and size-guide pages are complete.
7. Order tracking and customer support are functional with WhatsApp concierge fallback.
8. Search indexing and GA4 analytics are fully configured.

---

## 2. File-by-File Changes

### 2.1 Backend Data & Catalog Seeding
- **File:** `apps/backend/data/store.json` and `apps/backend/data/seed.json`
- **Changes:**
  - Add `shirts` (`id: cat-shirts-001`, `name: "Shirts"`, `slug: "shirts"`) and `bottoms` (`id: cat-bottoms-001`, `name: "Bottoms"`, `slug: "bottoms"`) to `categories`.
  - Add flagship catalog apparel items for all 4 categories (`t-shirts`, `hoodies`, `shirts`, `bottoms`):
    - `classic-oversized-tee` (T-Shirts, 240 GSM, base ₹999, compare ₹1499, variants S–XXL)
    - `acid-wash-tee-drop-02` (T-Shirts, 300 GSM, base ₹1499, compare ₹2299, variants S–XXL, active status)
    - `boxy-fleece-hoodie` (Hoodies, 430 GSM, base ₹2499, compare ₹3499, variants S–XXL)
    - `relaxed-cuban-camp-shirt` (Shirts, 210 GSM, base ₹1699, compare ₹2499, variants S–XXL)
    - `tactical-street-cargo-bottoms` (Bottoms, 320 GSM, base ₹2199, compare ₹2999, variants S–XXL)
    - Update `heavyweight-studio-test-tee` with valid `category_id: c84b5a5d-517a-4630-9eb7-42ba0481bd88` (T-Shirts) and variants.
  - Insert corresponding `product_variants` (sizes XS–XXL, SKUs, inventory > 20 per variant) and `product_images` for each product.

### 2.2 Category URL Normalization & Redirects
- **File:** `apps/frontend/src/components/layout/Navbar.tsx`
  - Change Bottoms shortcut link from `/category/jeans` to `/category/bottoms`.
- **File:** `apps/frontend/src/app/router.tsx`
  - Add redirect from `/category/jeans` to `/category/bottoms` for backward compatibility.

### 2.3 Storefront Catalog & Empty State UX
- **File:** `apps/frontend/src/pages/ShopPage.tsx`
  - Replace admin-oriented empty text (`"Products added from the Admin Panel will appear here live"`) with premium customer-facing messaging:
    - Title: `"LIMITED ATELIER PRODUCTION"`
    - Subtitle: `"This silhouette is currently between drops. Join our WhatsApp concierge for drop access or reset your filters."`
    - Actions: `"RESET FILTERS"` button + `"WHATSAPP CONCIERGE"` button.
  - Ensure filter tabs for `Men` and `Women` query tag/description matches so gender navigation displays the corresponding catalog apparel.

### 2.4 Google Analytics 4 Script Integration
- **File:** `apps/frontend/index.html`
  - Inject official Google Analytics tag in `<head>` for Measurement ID `G-N5EGTHS9SG`:
    ```html
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-N5EGTHS9SG"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-N5EGTHS9SG', { send_page_view: false });
    </script>
    ```
    (Note: `send_page_view: false` prevents duplicate hits since `analytics.ts` already sends page views on SPA route transitions).

---

## 3. Execution Sequence

1. **Step 1:** Update `apps/backend/data/store.json` and `apps/backend/data/seed.json` with the complete categories, products, images, and variants.
2. **Step 2:** Normalize bottom category routes in `Navbar.tsx` and `router.tsx`.
3. **Step 3:** Polish customer empty state in `ShopPage.tsx` with luxury copy and WhatsApp link.
4. **Step 4:** Add GA4 script tag in `index.html`.
5. **Step 5:** Run `npm run typecheck` to verify zero TypeScript errors across all workspaces.
6. **Step 6:** Run `python -m graphify update .` to synchronize knowledge graph.

---

## 4. Verification Checklist (Phase 4 Pre-flight)
- [x] Category pages (`/category/t-shirts`, `/category/hoodies`, `/category/shirts`, `/category/bottoms`) display products.
- [x] Product page displays images, price, S–XXL size chips, stock countdown, and size advisor modal.
- [x] Cart and mobile drawer open, calculate ₹0 delivery and 5% prepaid discount.
- [x] `/order-success/:orderNumber` and `/payment/failure` render properly.
- [x] Privacy, Shipping, Returns, Size-guide render without broken links.
- [x] Tracking page resolves order status and fallback WhatsApp link.
- [x] GA4 script loads without console errors.
- [x] `npm run typecheck` exits with code 0.
- [x] Custom Studio page (`/customize`) renders active garments, colors, and canvas stage.

# Implementation Plan: Connect Admin, Backend & Frontend Product Catalog

## 1. Problem Summary
When a product is created or updated in `admin.bingooo.co.in` or locally:
1. `apps/frontend/src/hooks/useProducts.ts` expected `res.data` to be an array, but `api.get` in `apps/frontend/src/lib/api/client.ts` already unwraps `json.data` as the array. `Array.isArray(res.data)` was `false`, causing `useProducts` to discard live database products and always return hardcoded mock products.
2. `apps/frontend/src/pages/SearchPage.tsx` accessed `data?.products` instead of `data?.data`, yielding 0 search results.
3. `apps/admin/src/lib/api.ts` lacked a production fallback (`https://api.bingooo.co.in/api/v1`) when `VITE_API_URL` is omitted, and `apps/admin/vercel.json` was missing the `/api/(.*)` rewrite proxy to `https://api.bingooo.co.in/api/$1`.
4. Uploaded product images were saved in `store.json` with `http://localhost:3000/api/v1/media/file/...` because `APP_URL` defaulted to `http://localhost:3000` in `media.service.ts`.
5. Display components in frontend and admin (`HomePage`, `ShopPage`, `ProductPage`, `CartPage`, `ProductsPage`) did not sanitize/resolve image URLs with `resolveImageUrl()`, leading to broken image loads on production domains.

---

## 2. Proposed Changes

### apps/frontend
- **`src/hooks/useProducts.ts`**:
  - Update `useProducts` query function to extract items via:
    `const items = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null;`
  - If `items` is an array, return `{ data: items, meta: res?.meta || { total: items.length, page: params.page || 1, limit: params.limit || items.length, totalPages: 1 } }`.
  - Only fall back to `filterFallbackProducts(params)` if the API request throws a network/server error and no items could be fetched.
- **`src/lib/utils.ts`**:
  - Enhance `resolveImageUrl(url)` to detect `localhost:3000` and rewrite to `https://api.bingooo.co.in` in production storefronts or relative `/api/` in dev proxy mode.
- **`src/pages/HomePage.tsx`**:
  - Wrap primary product images with `resolveImageUrl(...)`.
- **`src/pages/ShopPage.tsx`**:
  - Wrap catalog product images with `resolveImageUrl(...)`.
- **`src/pages/ProductPage.tsx`**:
  - Wrap gallery image URLs with `resolveImageUrl(...)`.
- **`src/pages/SearchPage.tsx`**:
  - Read `const products = data?.data || data?.products || [];` and resolve images.
- **`src/pages/CartPage.tsx`**:
  - Safely extract recommendation items whether `recProducts` is an array or `{ data: [...] }`.

### apps/admin
- **`src/lib/api.ts`**:
  - Add production fallback to `https://api.bingooo.co.in/api/v1` when on `admin.bingooo.co.in` or Vercel preview.
  - Export `resolveImageUrl` helper for admin views.
- **`vercel.json`**:
  - Add `/api/(.*)` rewrite to `https://api.bingooo.co.in/api/$1` before the catch-all `/index.html` rewrite.
- **`src/pages/ProductsPage.tsx`**:
  - Wrap product primary images with `resolveImageUrl(...)`.
- **`src/pages/ProductEditorPage.tsx`**:
  - Wrap slot preview images with `resolveImageUrl(...)`.

### apps/backend
- **`src/media/media.service.ts`**:
  - In `saveUploadedFile`, `saveBase64File`, and `getPresignedUrl`, detect production environment (`process.env.NODE_ENV === 'production' || process.env.RENDER`) to use `https://api.bingooo.co.in` instead of `http://localhost:3000`.
- **`src/products/products.service.ts`**:
  - In `enrichProduct(product)`:
    - Sanitize `image.url` and `image.object_key`: if it starts with `http://localhost:3000/api/v1/media/file/`, replace `http://localhost:3000` with the active base URL so existing items like `"browneee tshirt"` automatically serve valid URLs.

---

## 3. Verification Plan
1. Run `npm run typecheck` across the entire monorepo to ensure zero TypeScript errors.
2. Test product retrieval via node / curl simulating both direct backend calls and frontend parsing.
3. Validate that `useProducts` accurately parses the live `"browneee tshirt"` product.
4. Verify image URL resolution produces valid `https://api.bingooo.co.in/api/v1/media/file/...` URLs.

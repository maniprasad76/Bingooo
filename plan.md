# BINGOOO Plan: Replace Order Ref with Item Thumbnail Image in Admin Orders

## 1. Goal
Replace the text-heavy "Order Ref" column (e.g. `BGO-20261005-1083`) in the Admin Orders table (`apps/admin/src/pages/OrdersPage.tsx`) with a clean, visual-first "Item / Preview" image thumbnail of the ordered garment (or 3D custom print preview). The full order reference remains accessible on hover via tooltip, inside the Order Details Inspector modal, and in search/print manifests.

---

## 2. Scope & Technical Architecture

### IN SCOPE
1. **Backend Order Enrichment (`apps/backend/src/orders/orders.service.ts`)**:
   - In `enrichOrder(order: any)`:
     - For each item in `order.items`, resolve its parent product (`db.products`) using `item.product_id` or `variant.product_id`.
     - Fetch primary product image via `getImagesByProductId`.
     - Set `imageUrl` / `image_url` on each item, giving priority to custom design previews (`customization.preview_url` / `preview_key`), then product images, then `product.image_url`.
     - Expose `primary_image` on the enriched order object for high-efficiency frontend rendering.

2. **Admin Order Interfaces & Page (`apps/admin/src/pages/OrdersPage.tsx`)**:
   - Update `OrderItem` and `Order` interface definitions to support `image_url?: string`, `imageUrl?: string`, `primary_image?: string`.
   - Update table header from `<th>Order Ref</th>` to `<th>Item / Preview</th>`.
   - In the table body cell:
     - Render an interactive thumbnail preview button (aspect-square, rounded-xl, subtle border, smooth hover scale, shadow).
     - Display the resolved product or custom print image via `resolveImageUrl`.
     - Provide a stylish fallback garment icon (`Shirt` / `Package`) if an older record lacks an image.
     - Display a `3D` badge if bespoke customization is present.
     - Display a `+N` badge if the order contains multiple garments.
     - Clicking the thumbnail opens the Order Details Inspector modal.
     - Display the order number on hover (native `title` attribute + accessible label).
   - In the Order Details Inspector modal:
     - Display each item's thumbnail image inside the manifest items list alongside title, specs (size, color), quantity, and price.

### OUT OF SCOPE
- Altering order creation, payment gateway, or database storage schemas.
- Modifying customer-facing storefront orders unless required for type alignment.

---

## 3. Files to Touch
1. [apps/backend/src/orders/orders.service.ts](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/orders/orders.service.ts)
2. [apps/admin/src/pages/OrdersPage.tsx](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/OrdersPage.tsx)

---

## 4. Verification Steps
- Root `npm run typecheck` passes with zero errors.
- Visual check of the Orders & Shipments table in `apps/admin`.
- Ensure search still works by Order #, Customer Name, and Phone.
- Verify modal inspect shows item preview images.
- Re-index knowledge graph with `python -m graphify update .`.

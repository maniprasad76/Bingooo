# Plan: Cash on Delivery (COD) Implementation & Pricing Adjustments

## 1. Objectives & Confirmed Decisions
1. **Cash on Delivery (COD)**:
   - Provide "Cash on Delivery (COD)" payment option at checkout alongside existing UPI and Card/NetBanking methods.
   - For COD orders, do not trigger Razorpay payment gateway; place the order directly and navigate to the order success page.
   - For custom printed items, require prepaid checkout with a clear notice (bespoke made-to-order garments).
2. **Shipping Charge Logic**:
   - **Prepaid Orders**: 100% Free Shipping pan-India (₹0 shipping fee).
   - **COD Orders**: Flat ₹80 shipping & COD handling charge added to order total.
3. **Prepaid Discount**:
   - **Prepaid Orders**: Apply 5% discount on the discounted subtotal.
   - **COD Orders**: No prepaid discount (0%).
4. **Order Success & Tracking**:
   - COD orders are created with `status: 'confirmed'`, `payment_method: 'cod'`, `payment_status: 'pending'` (payable on delivery in cash/UPI).
   - Order Success page celebrates COD orders appropriately ("Order confirmed (Cash on Delivery)", showing amount payable at delivery and ₹80 delivery fee breakdown).
5. **Architectural Invariants & Security**:
   - Strict server-side pricing: All calculation of subtotal, coupon discounts, prepaid discount (0% for COD, 5% for prepaid), shipping charge (₹80 for COD, ₹0 for prepaid), and total payable is enforced in `apps/backend/src/checkout/checkout.service.ts`.
   - Prevent stock expiry reaper (`sweepExpiredOrders`) from cancelling COD orders which are pending cash payment on delivery.
   - Shared types in `packages/types/src/order.ts`.

---

## 2. File-by-File Changes

### 2.1 Shared Types
- **File**: `packages/types/src/order.ts`
  - Update `PaymentMethod` to `'prepaid' | 'cod'`.
  - Add optional `shippingFee?: number;`, `prepaidDiscount?: number;`, and `paymentMethod?: PaymentMethod;` to `Order` interface.

### 2.2 Backend Checkout & Order DTOs
- **File**: `apps/backend/src/checkout/dto/checkout.dto.ts`
  - Update `paymentMethod` in `CheckoutValidationDto`: `@IsIn(['prepaid', 'cod'])`.
- **File**: `apps/backend/src/checkout/checkout.service.ts`
  - In `validateAndCalculate`:
    - Check `dto.paymentMethod`:
      - If `'prepaid'`: apply 5% prepaid discount, set `shippingFee = 0`.
      - If `'cod'`: set `prepaidDiscount = 0`, set `shippingFee = 80`.
    - Calculate total: `Math.max(0, discountedSubtotal - prepaidDiscount + shippingFee)`.
    - Return `shippingFee`, `prepaidDiscount`, `paymentMethod`, `payableNow: dto.paymentMethod === 'cod' ? 0 : total`.
- **File**: `apps/backend/src/orders/orders.service.ts`
  - In `createOrder`:
    - Save `payment_method: dto.paymentMethod`, `shipping_fee: calculation.shippingFee`, `prepaid_discount: calculation.prepaidDiscount`.
    - Set `status: dto.paymentMethod === 'cod' ? 'confirmed' : 'pending_payment'`.
    - Set `payment_status: dto.paymentMethod === 'cod' ? 'pending' : 'pending'`.
  - In `sweepExpiredOrders`:
    - Ensure order sweeps only target `payment_method !== 'cod'` (do not cancel confirmed COD orders).

### 2.3 Storefront Checkout Page
- **File**: `apps/frontend/src/pages/CheckoutPage.tsx`
  - Expand `PaymentMethodType` to include `'cod'`.
  - Compute `isPrepaid = paymentMethod !== 'cod'`.
  - Set `shippingFee = paymentMethod === 'cod' ? 80 : 0`.
  - Set `prepaidDiscount = isPrepaid ? Math.round(subtotalAfterCoupon * (prepaidDiscountPct / 100)) : 0`.
  - Set `total = Math.max(0, subtotalAfterCoupon - prepaidDiscount + shippingFee)`.
  - Add COD payment card in "CHOOSE PAYMENT METHOD" section with badge showing "+₹80 Shipping Charge" and note that 5% discount applies only to prepaid orders.
  - Disable or show notice if cart contains custom bespoke items.
  - In Order Summary breakdown:
    - Display Delivery line: `shippingFee > 0 ? '₹80' : 'FREE'`.
    - Display Prepaid discount line only when `isPrepaid && prepaidDiscount > 0`.
  - In submit handler `onSubmit`:
    - If `paymentMethod === 'cod'`:
      - Call `api.post('/orders', { cartId, couponCode, paymentMethod: 'cod', shippingAddress })`.
      - Clear cart via `clearCart()`.
      - Show toast: "Order Placed! Order #{order_number} confirmed."
      - Navigate to `/order-success/{order_number}` with `{ order, paid: false, isCod: true }`.
      - Skip Razorpay modal.
    - If prepaid (`upi` / `cards`):
      - Continue existing Razorpay checkout flow.

### 2.4 Storefront Order Success Page
- **File**: `apps/frontend/src/pages/OrderSuccessPage.tsx`
  - Detect `isCod = order.payment_method === 'cod'`.
  - Display appropriate hero and badge for COD:
    - Status: "Order confirmed (Cash on Delivery)"
    - Subtitle: "Your Cash on Delivery order is confirmed! Please keep ₹{order.total} ready in cash or UPI at the time of delivery."
    - Total line: "TOTAL AMOUNT (CASH ON DELIVERY)".
    - Delivery line: `order.shipping_fee > 0 ? formatINR(order.shipping_fee) : 'FREE'`.

---

## 3. Verification Steps
1. Run `npm run typecheck` across all workspaces to verify zero TypeScript errors.
2. Verify COD order creation via API / tests:
   - Validating checkout with `paymentMethod: 'cod'` gives `shippingFee: 80`, `prepaidDiscount: 0`.
   - Validating checkout with `paymentMethod: 'prepaid'` gives `shippingFee: 0`, `prepaidDiscount: 5%`.
3. Verify frontend checkout behaves smoothly:
   - Selecting COD updates order summary to +₹80 Delivery and removes 5% prepaid discount.
   - Selecting UPI or Cards restores FREE Delivery and 5% prepaid discount.
   - Placing COD order skips Razorpay and reaches Order Success with clear COD instructions.
4. Run `python -m graphify update .` to sync knowledge graph.

// ─────────────────────────────────────────────────────────
// @bingooo/types — Order, OrderItem, Payment, Shipment
// ─────────────────────────────────────────────────────────

/** Order lifecycle statuses from doc 01 */
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

/** Payment status (separate from order status) */
export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

/** Payment method */
export type PaymentMethod = 'prepaid' | 'cod' | 'partial_cod';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  addressSnapshot: AddressSnapshot;
  createdAt: string;
  items?: OrderItem[];
  payments?: Payment[];
  shipments?: Shipment[];
}

export interface AddressSnapshot {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  customizationId: string | null;
  sku: string;
  titleSnapshot: string;
  variantSnapshot: VariantSnapshot;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VariantSnapshot {
  size?: string;
  color?: string;
  colorHex?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  providerRefundId: string | null;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  reason: string | null;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string | null;
  trackingNumber: string | null;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
  shippedAt: string | null;
  deliveredAt: string | null;
}

/** Checkout validation request */
export interface CheckoutValidateInput {
  cartId: string;
  addressId: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

/** Checkout validation response */
export interface CheckoutSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  items: CheckoutItem[];
  codDeposit?: number;
  codRemaining?: number;
}

export interface CheckoutItem {
  variantId: string;
  title: string;
  sku: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  available: boolean;
}

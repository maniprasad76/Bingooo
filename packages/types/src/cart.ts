// ─────────────────────────────────────────────────────────
// @bingooo/types — Cart and CartItem
// ─────────────────────────────────────────────────────────

export type CartStatus = 'active' | 'merged' | 'converted' | 'abandoned';

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: CartStatus;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  customizationId: string | null;
  /** Populated from variant join */
  variant?: CartItemVariant;
}

export interface CartItemVariant {
  sku: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number;
  stockQuantity: number;
  product: {
    id: string;
    title: string;
    slug: string;
    primaryImage: string | null;
  };
}

export interface AddCartItemInput {
  variantId: string;
  quantity: number;
  customizationId?: string;
}

export interface UpdateCartItemInput {
  quantity: number;
}

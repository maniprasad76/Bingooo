/**
 * Google Analytics 4 (GA4) Integration for Bingooo
 * Tracking ID: G-N5EGTHS9SG
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || 'G-N5EGTHS9SG';

/** Safely calls gtag if available in the browser */
export function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

/** Track SPA page navigation */
export function trackPageView(path: string, title?: string) {
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title || (typeof document !== 'undefined' ? document.title : undefined),
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
  });
}

/** Track custom event */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  gtag('event', eventName, params);
}

/** Track viewing a product (GA4 view_item) */
export function trackViewItem(product: {
  id?: string;
  name: string;
  price?: number;
  category?: string;
}) {
  gtag('event', 'view_item', {
    currency: 'INR',
    value: Number(product.price) || 0,
    items: [
      {
        item_id: product.id || product.name,
        item_name: product.name,
        item_category: product.category || 'Apparel',
        price: Number(product.price) || 0,
        quantity: 1,
      },
    ],
  });
}

/** Track adding item to cart (GA4 add_to_cart) */
export function trackAddToCart(item: {
  id?: string;
  name: string;
  price?: number;
  quantity?: number;
}) {
  const qty = item.quantity || 1;
  const price = Number(item.price) || 0;
  gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: price * qty,
    items: [
      {
        item_id: item.id || item.name,
        item_name: item.name,
        price,
        quantity: qty,
      },
    ],
  });
}

/** Track checkout initiation (GA4 begin_checkout) */
export function trackBeginCheckout(value: number, itemCount: number = 1) {
  gtag('event', 'begin_checkout', {
    currency: 'INR',
    value: Number(value) || 0,
    items_count: itemCount,
  });
}

/** Track completed purchase (GA4 purchase) */
export function trackPurchase(order: {
  orderNumber: string;
  amount: number;
  items?: Array<{ id?: string; name?: string; price?: number; quantity?: number }>;
}) {
  gtag('event', 'purchase', {
    transaction_id: order.orderNumber,
    value: Number(order.amount) || 0,
    currency: 'INR',
    items: (order.items || []).map((it) => ({
      item_id: it.id || it.name || 'item',
      item_name: it.name || 'Bingooo Apparel',
      price: Number(it.price) || 0,
      quantity: it.quantity || 1,
    })),
  });
}

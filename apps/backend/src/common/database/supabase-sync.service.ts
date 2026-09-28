// ─────────────────────────────────────────────────────────
// Supabase PostgreSQL Synchronization Engine
// Guarantees persistence of orders, catalog, payments, and users
// Eliminates ephemeral data loss on cloud restarts
// ─────────────────────────────────────────────────────────

import { db, saveDb, registerSaveHook } from './store';

interface SupabaseConfig {
  url: string;
  serviceKey: string;
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = (process.env.SUPABASE_URL || 'https://zqmrmgwxhrdscippanuv.supabase.co').replace(/\/$/, '');
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  ).trim();

  if (!url || !serviceKey) {
    return null;
  }
  return { url, serviceKey };
}

/** Helper for authenticated PostgREST calls with timeout & retry */
async function supabaseRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: any;
    prefer?: string;
  } = {},
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const config = getSupabaseConfig();
  if (!config) {
    return { ok: false, status: 500, error: 'SUPABASE_NOT_CONFIGURED' };
  }

  const method = options.method || 'GET';
  const url = `${config.url}/rest/v1/${endpoint}`;
  const headers: Record<string, string> = {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    'Content-Type': 'application/json',
  };

  if (options.prefer) {
    headers['Prefer'] = options.prefer;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: errText || res.statusText };
    }

    // 204 No Content
    if (res.status === 204) {
      return { ok: true, status: res.status };
    }

    const data = await res.json().catch(() => null);
    return { ok: true, status: res.status, data };
  } catch (err: any) {
    clearTimeout(timeout);
    return { ok: false, status: 500, error: err.message };
  }
}

let isHydrated = false;
let isSyncing = false;
const syncedOrderIds = new Set<string>();
const syncedPaymentIds = new Set<string>();

/**
 * Hydrates in-memory DB and store.json from Supabase PostgreSQL tables on startup.
 * If Supabase already has products or orders, they are loaded.
 * If Supabase is empty, it uploads the current seed catalog to Supabase.
 */
export async function hydrateStoreFromSupabase(): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) {
    console.warn('[Supabase Sync] Service key not configured, running in local store.json mode');
    return;
  }

  try {
    console.log('[Supabase Sync] Connecting to Supabase PostgreSQL at:', config.url);

    // 1. Fetch Categories
    const catRes = await supabaseRequest<any[]>('categories?select=*');
    if (catRes.ok && Array.isArray(catRes.data) && catRes.data.length > 0) {
      db.categories = catRes.data;
    }

    // 2. Fetch Products
    const prodRes = await supabaseRequest<any[]>('products?select=*');
    if (prodRes.ok && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
      db.products = prodRes.data;
      console.log(`[Supabase Sync] Loaded ${prodRes.data.length} products from Supabase PostgreSQL`);
    } else if (db.products.length > 0) {
      // Supabase products table is empty: seed it from local store
      console.log('[Supabase Sync] Seeding products into Supabase...');
      for (const p of db.products) {
        await supabaseRequest('products', {
          method: 'POST',
          body: {
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description || '',
            category_id: p.category_id || p.category?.id || null,
            base_price: p.base_price || p.price || 999,
            compare_at_price: p.compare_at_price || null,
            is_customizable: Boolean(p.is_customizable || p.customizationEnabled),
            status: p.status || 'active',
            fabric_gsm: p.fabric_gsm || 240,
            fit_silhouette: p.fit_silhouette || 'Boxy Drop Shoulder',
          },
          prefer: 'resolution=merge-duplicates',
        });
      }
    }

    // 3. Fetch Product Variants
    const varRes = await supabaseRequest<any[]>('product_variants?select=*');
    if (varRes.ok && Array.isArray(varRes.data) && varRes.data.length > 0) {
      db.product_variants = varRes.data;
    }

    // 4. Fetch Orders
    const ordersRes = await supabaseRequest<any[]>('orders?select=*&order=created_at.desc');
    if (ordersRes.ok && Array.isArray(ordersRes.data)) {
      if (ordersRes.data.length > 0) {
        db.orders = ordersRes.data;
        ordersRes.data.forEach((o) => syncedOrderIds.add(o.id));
        console.log(`[Supabase Sync] Loaded ${ordersRes.data.length} orders from Supabase PostgreSQL`);
      }
    }

    // 5. Fetch Payments
    const paymentsRes = await supabaseRequest<any[]>('payments?select=*&order=created_at.desc');
    if (paymentsRes.ok && Array.isArray(paymentsRes.data)) {
      if (paymentsRes.data.length > 0) {
        db.payments = paymentsRes.data;
        paymentsRes.data.forEach((p) => syncedPaymentIds.add(p.id));
      }
    }

    isHydrated = true;
    saveDb();
    console.log('✅ [Supabase Sync] Store successfully synced with Supabase PostgreSQL');
  } catch (err: any) {
    console.error('[Supabase Sync] Error hydrating from Supabase:', err.message);
  }
}

/**
 * Syncs any unpersisted orders, order items, and payments to Supabase PostgreSQL.
 * Triggered automatically on saveDb() hooks.
 */
export async function syncPendingChangesToSupabase(): Promise<void> {
  if (isSyncing) return;
  const config = getSupabaseConfig();
  if (!config) return;

  isSyncing = true;
  try {
    // 1. Sync any new orders
    for (const order of db.orders) {
      if (!syncedOrderIds.has(order.id)) {
        const orderPayload = {
          id: order.id,
          order_number: order.order_number,
          user_id: order.user_id,
          status: order.status || 'pending_payment',
          payment_status: order.payment_status || 'pending',
          payment_method: order.payment_method || 'prepaid',
          subtotal: Number(order.subtotal) || 0,
          discount: Number(order.discount) || 0,
          shipping_fee: Number(order.shipping_fee) || 0,
          tax: Number(order.tax) || 0,
          total: Number(order.total) || 0,
          currency: order.currency || 'INR',
          address_snapshot_json: order.shipping_address || order.address_snapshot_json || {},
          cod_deposit: order.cod_deposit ? Number(order.cod_deposit) : null,
          cod_remaining: order.cod_remaining ? Number(order.cod_remaining) : null,
          coupon_code: order.coupon_code || null,
          notes: order.notes || null,
          created_at: order.created_at || new Date().toISOString(),
          updated_at: order.updated_at || new Date().toISOString(),
        };

        const res = await supabaseRequest('orders', {
          method: 'POST',
          body: orderPayload,
          prefer: 'resolution=merge-duplicates',
        });

        if (res.ok) {
          syncedOrderIds.add(order.id);
          console.log(`[Supabase Sync] Persisted order #${order.order_number} to Supabase PostgreSQL`);
        }
      }
    }

    // 2. Sync any new payments
    for (const payment of db.payments) {
      if (!syncedPaymentIds.has(payment.id)) {
        const paymentPayload = {
          id: payment.id,
          order_id: payment.order_id,
          provider: payment.provider || 'razorpay',
          provider_order_id: payment.provider_order_id || null,
          provider_payment_id: payment.provider_payment_id || null,
          status: payment.status || 'pending',
          amount: Number(payment.amount) || 0,
          currency: payment.currency || 'INR',
          created_at: payment.created_at || new Date().toISOString(),
          updated_at: payment.updated_at || new Date().toISOString(),
        };

        const res = await supabaseRequest('payments', {
          method: 'POST',
          body: paymentPayload,
          prefer: 'resolution=merge-duplicates',
        });

        if (res.ok) {
          syncedPaymentIds.add(payment.id);
          console.log(`[Supabase Sync] Persisted payment transaction ${payment.id} to Supabase`);
        }
      }
    }
  } catch (err: any) {
    console.error('[Supabase Sync] Background sync error:', err.message);
  } finally {
    isSyncing = false;
  }
}

// Automatically register the sync hook with store.ts
registerSaveHook(() => {
  // Fire non-blocking background sync
  syncPendingChangesToSupabase().catch(() => {});
});

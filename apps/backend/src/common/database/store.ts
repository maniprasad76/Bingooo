// ─────────────────────────────────────────────────────────
// In-memory data store — replaces Supabase until connected
// Mirrors the exact database schema from migration 001
// ─────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { getDataDir } from '../utils/paths.util';

const DATA_DIR = getDataDir();
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const BUNDLED_STORE_FILE = STORE_FILE;


export const db = {
  categories: [] as any[],
  collections: [] as any[],
  products: [] as any[],
  product_images: [] as any[],
  product_variants: [] as any[],
  product_collections: [] as any[],
  users: [] as any[],

  roles: [
    { id: 'role-super-admin', name: 'Super Admin', code: 'SUPER_ADMIN', description: 'Full unrestricted system and database access.', is_system: true, permissions: ['*'] },
    { id: 'role-admin', name: 'Admin', code: 'ADMIN', description: 'Comprehensive store management.', is_system: true, permissions: ['products.read','products.create','products.update','products.delete','orders.read','orders.update','customizations.review','payments.read','refunds.manage','inventory.read','inventory.update','reviews.manage','banners.manage','coupons.manage'] },
    { id: 'role-order-manager', name: 'Order Manager', code: 'ORDER_MANAGER', description: 'Handle order verification, fulfillment and logistics.', is_system: false, permissions: ['orders.read','orders.update','customizations.review','payments.read'] },
    { id: 'role-product-manager', name: 'Product Manager', code: 'PRODUCT_MANAGER', description: 'Manage catalog, garments, inventory and banners.', is_system: false, permissions: ['products.read','products.create','products.update','inventory.read','inventory.update','banners.manage'] },
    { id: 'role-support', name: 'Customer Support', code: 'SUPPORT', description: 'Assist customers with orders, returns and reviews.', is_system: false, permissions: ['orders.read','reviews.manage','returns.manage'] },
    { id: 'role-customer', name: 'Customer', code: 'CUSTOMER', description: 'End customer shopping permissions.', is_system: true, permissions: ['orders.own','profile.own','reviews.create','customizations.create'] },
  ] as any[],

  permissions: [
    { key: 'products.read', label: 'View Products & Catalog', group: 'Products' },
    { key: 'products.create', label: 'Create New Garments', group: 'Products' },
    { key: 'products.update', label: 'Update Pricing & Specs', group: 'Products' },
    { key: 'products.delete', label: 'Archive / Delete Garments', group: 'Products' },
    { key: 'orders.read', label: 'View Customer Orders', group: 'Orders' },
    { key: 'orders.update', label: 'Update Fulfillment & Status', group: 'Orders' },
    { key: 'customizations.review', label: 'Review Custom Artwork', group: 'Custom Studio' },
    { key: 'payments.read', label: 'View Payment Ledgers', group: 'Finance' },
    { key: 'refunds.manage', label: 'Issue & Authorize Refunds', group: 'Finance' },
    { key: 'users.manage', label: 'Manage Staff Members', group: 'Team' },
    { key: 'roles.manage', label: 'Modify Permissions Matrix', group: 'Team' },
    { key: 'settings.manage', label: 'Configure Store Parameters', group: 'Settings' },
  ] as any[],

  inventory_movements: [] as any[],
  wishlists: [] as any[],
  carts: [] as any[],
  cart_items: [] as any[],
  orders: [] as any[],
  order_items: [] as any[],
  payments: [] as any[],
  refunds: [] as any[],
  returns: [] as any[],
  coupons: [] as any[],
  coupon_redemptions: [] as any[],
  custom_requirements: [] as any[],
  reviews: [] as any[],
  customizations: [] as any[],
  customization_assets: [] as any[],
  shipments: [] as any[],
  notifications: [] as any[],
  audit_logs: [] as any[],
  addresses: [] as any[],
  profiles: [] as any[],
  banners: [] as any[],
  settings: {
    store_name: 'Bingooo Luxury Streetwear',
    store_email: 'care@bingooo.in',
    store_phone: '+91 98765 43210',
    support_hours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
    cod_enabled: true,
    partial_cod_enabled: true,
    partial_cod_advance_amount: 79,
    max_cod_limit: 5000,
    cod_deposit_percentage: 30,
    shipping_fee_default: 99,
    free_shipping_threshold: 999,
    gst_enabled: false,
    tax_rate_percentage: 0,
    max_upload_size_mb: 15,
    currency: 'INR',
    return_window_days: 7,
    dtg_print_lead_days: 3,
    prepaid_discount_percentage: 5,
  } as any,
  media_assets: [] as any[],
  customizer_config: {
    garments: [] as any[],
    updatedAt: new Date().toISOString(),
  } as any,
};

type SaveHook = () => void;
const saveHooks: SaveHook[] = [];

export function registerSaveHook(hook: SaveHook): void {
  saveHooks.push(hook);
}

export function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');

    // Notify registered hooks (e.g. rebuild in-memory indexes) without circular import
    for (const hook of saveHooks) {
      try {
        hook();
      } catch (err) {
        console.error('[Database] Save hook error:', err);
      }
    }
  } catch (err) {
    console.error('[Database] Failed to save store to disk:', err);
  }
}

// Load persisted state from disk if available, otherwise initialize file
try {
  let storePathToLoad: string | null = null;
  if (fs.existsSync(STORE_FILE)) {
    storePathToLoad = STORE_FILE;
  } else if (fs.existsSync(BUNDLED_STORE_FILE)) {
    storePathToLoad = BUNDLED_STORE_FILE;
  }

  if (storePathToLoad) {
    const raw = fs.readFileSync(storePathToLoad, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      for (const [key, val] of Object.entries(parsed)) {
        (db as any)[key] = val;
      }
    }
  } else {
    saveDb();
  }
} catch (err) {
  console.error('[Database] Could not load persisted store.json, using in-memory seed:', err);
}


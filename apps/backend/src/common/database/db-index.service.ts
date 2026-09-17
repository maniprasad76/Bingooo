// ─────────────────────────────────────────────────────────
// In-Memory Hash Indexes for O(1) Lookups
// Replaces linear .find() / .filter() scans on db arrays
// ─────────────────────────────────────────────────────────

import { db } from './store';

// ── Single-record indexes (Map<key, record>) ──
const productsById = new Map<string, any>();
const productsBySlug = new Map<string, any>();
const categoriesById = new Map<string, any>();
const categoriesBySlug = new Map<string, any>();
const collectionsById = new Map<string, any>();
const collectionsBySlug = new Map<string, any>();
const usersById = new Map<string, any>();
const usersByEmail = new Map<string, any>();

// ── Multi-record indexes (Map<key, record[]>) ──
const variantsByProductId = new Map<string, any[]>();
const imagesByProductId = new Map<string, any[]>();
const ordersById = new Map<string, any>();
const ordersByOrderNumber = new Map<string, any>();
const ordersByUserId = new Map<string, any[]>();
const orderItemsByOrderId = new Map<string, any[]>();
const collectionsByProductId = new Map<string, string[]>(); // product_id → collection_id[]
const productsByCollectionId = new Map<string, string[]>(); // collection_id → product_id[]
const addressesByUserId = new Map<string, any[]>();
const reviewsByProductId = new Map<string, any[]>();

/**
 * Rebuild ALL indexes from current db state.
 * Call this after every saveDb() and on startup.
 */
export function rebuildIndexes(): void {
  // Clear all maps
  productsById.clear();
  productsBySlug.clear();
  categoriesById.clear();
  categoriesBySlug.clear();
  collectionsById.clear();
  collectionsBySlug.clear();
  usersById.clear();
  usersByEmail.clear();
  variantsByProductId.clear();
  imagesByProductId.clear();
  ordersById.clear();
  ordersByOrderNumber.clear();
  ordersByUserId.clear();
  orderItemsByOrderId.clear();
  collectionsByProductId.clear();
  productsByCollectionId.clear();
  addressesByUserId.clear();
  reviewsByProductId.clear();

  // ── Products ──
  for (const p of db.products) {
    productsById.set(p.id, p);
    if (p.slug) productsBySlug.set(p.slug, p);
  }

  // ── Categories ──
  for (const c of db.categories) {
    categoriesById.set(c.id, c);
    if (c.slug) categoriesBySlug.set(c.slug, c);
  }

  // ── Collections ──
  for (const c of db.collections) {
    collectionsById.set(c.id, c);
    if (c.slug) collectionsBySlug.set(c.slug, c);
  }

  // ── Users ──
  for (const u of db.users) {
    usersById.set(u.id, u);
    if (u.email) usersByEmail.set(u.email.toLowerCase(), u);
  }

  // ── Variants by product ──
  for (const v of db.product_variants) {
    const list = variantsByProductId.get(v.product_id) || [];
    list.push(v);
    variantsByProductId.set(v.product_id, list);
  }

  // ── Images by product ──
  for (const img of db.product_images) {
    const list = imagesByProductId.get(img.product_id) || [];
    list.push(img);
    imagesByProductId.set(img.product_id, list);
  }

  // ── Orders ──
  for (const o of db.orders) {
    ordersById.set(o.id, o);
    if (o.order_number) ordersByOrderNumber.set(o.order_number, o);
    const list = ordersByUserId.get(o.user_id) || [];
    list.push(o);
    ordersByUserId.set(o.user_id, list);
  }

  // ── Order items by order ──
  for (const item of db.order_items) {
    const list = orderItemsByOrderId.get(item.order_id) || [];
    list.push(item);
    orderItemsByOrderId.set(item.order_id, list);
  }

  // ── Product ↔ Collection mappings ──
  for (const pc of db.product_collections) {
    const colList = collectionsByProductId.get(pc.product_id) || [];
    colList.push(pc.collection_id);
    collectionsByProductId.set(pc.product_id, colList);

    const prodList = productsByCollectionId.get(pc.collection_id) || [];
    prodList.push(pc.product_id);
    productsByCollectionId.set(pc.collection_id, prodList);
  }

  // ── Addresses by user ──
  if (db.addresses) {
    for (const addr of db.addresses) {
      const list = addressesByUserId.get(addr.user_id) || [];
      list.push(addr);
      addressesByUserId.set(addr.user_id, list);
    }
  }

  // ── Reviews by product ──
  if (db.reviews) {
    for (const rev of db.reviews) {
      const list = reviewsByProductId.get(rev.product_id) || [];
      list.push(rev);
      reviewsByProductId.set(rev.product_id, list);
    }
  }
}

// ── Typed lookup functions ──

export function getProductById(id: string) { return productsById.get(id) || null; }
export function getProductBySlug(slug: string) { return productsBySlug.get(slug) || null; }
export function getCategoryById(id: string) { return categoriesById.get(id) || null; }
export function getCategoryBySlug(slug: string) { return categoriesBySlug.get(slug) || null; }
export function getCollectionById(id: string) { return collectionsById.get(id) || null; }
export function getCollectionBySlug(slug: string) { return collectionsBySlug.get(slug) || null; }
export function getUserById(id: string) { return usersById.get(id) || null; }
export function getUserByEmail(email: string) { return usersByEmail.get(email.toLowerCase()) || null; }
export function getVariantsByProductId(productId: string) { return variantsByProductId.get(productId) || []; }
export function getImagesByProductId(productId: string) { return imagesByProductId.get(productId) || []; }
export function getOrderById(id: string) { return ordersById.get(id) || null; }
export function getOrderByOrderNumber(num: string) { return ordersByOrderNumber.get(num) || null; }
export function getOrdersByUserId(userId: string) { return ordersByUserId.get(userId) || []; }
export function getOrderItemsByOrderId(orderId: string) { return orderItemsByOrderId.get(orderId) || []; }
export function getProductIdsByCollectionId(collectionId: string) { return productsByCollectionId.get(collectionId) || []; }
export function getAddressesByUserId(userId: string) { return addressesByUserId.get(userId) || []; }
export function getReviewsByProductId(productId: string) { return reviewsByProductId.get(productId) || []; }

// Build indexes on module load
rebuildIndexes();

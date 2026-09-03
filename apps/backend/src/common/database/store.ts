// ─────────────────────────────────────────────────────────
// In-memory data store — replaces Supabase until connected
// Mirrors the exact database schema from migration 001
// ─────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';

// ── Seed data matching supabase/seed.sql ────────────────

const categoryIds = {
  tshirts: uuidv4(),
  hoodies: uuidv4(),
  sweatshirts: uuidv4(),
  caps: uuidv4(),
  accessories: uuidv4(),
};

const collectionIds = {
  summer: uuidv4(),
  streetwear: uuidv4(),
  custom: uuidv4(),
  bestSellers: uuidv4(),
};

const productIds = {
  classicTee: uuidv4(),
  graphicTee: uuidv4(),
  hoodie: uuidv4(),
};

function generateVariants(
  productId: string,
  prefix: string,
  sizes: string[],
  colors: Array<{ code: string; name: string; hex: string }>,
  price: number,
  stock: number,
) {
  const variants: any[] = [];
  for (const size of sizes) {
    for (const color of colors) {
      variants.push({
        id: uuidv4(),
        product_id: productId,
        sku: `${prefix}-${size}-${color.code}`,
        size,
        color: color.name,
        color_hex: color.hex,
        price,
        stock_quantity: stock,
        reserved_quantity: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  return variants;
}

const teeVariants = generateVariants(
  productIds.classicTee,
  'COT',
  ['S', 'M', 'L', 'XL', 'XXL'],
  [
    { code: 'BLK', name: 'Black', hex: '#111111' },
    { code: 'WHT', name: 'White', hex: '#FFFFFF' },
    { code: 'SNS', name: 'Sandstone', hex: '#D4C4A8' },
  ],
  1299,
  25,
);

const graphicVariants = generateVariants(
  productIds.graphicTee,
  'GPT',
  ['S', 'M', 'L', 'XL'],
  [{ code: 'BLK', name: 'Black', hex: '#111111' }],
  1499,
  15,
);

const hoodieVariants = generateVariants(
  productIds.hoodie,
  'EPH',
  ['S', 'M', 'L', 'XL', 'XXL'],
  [
    { code: 'CHR', name: 'Charcoal', hex: '#333333' },
    { code: 'OAT', name: 'Oatmeal', hex: '#E8DCC8' },
  ],
  2499,
  10,
);

export const db = {
  categories: [
    { id: categoryIds.tshirts, name: 'T-Shirts', slug: 't-shirts', parent_id: null, image_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: categoryIds.hoodies, name: 'Hoodies', slug: 'hoodies', parent_id: null, image_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: categoryIds.sweatshirts, name: 'Sweatshirts', slug: 'sweatshirts', parent_id: null, image_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: categoryIds.caps, name: 'Caps', slug: 'caps', parent_id: null, image_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: categoryIds.accessories, name: 'Accessories', slug: 'accessories', parent_id: null, image_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ] as any[],

  collections: [
    { id: collectionIds.summer, name: 'Summer 2025', slug: 'summer-2025', description: 'Fresh summer collection with bold prints and light fabrics.', banner_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: collectionIds.streetwear, name: 'Streetwear Essentials', slug: 'streetwear-essentials', description: 'Core streetwear pieces for everyday style.', banner_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: collectionIds.custom, name: 'Custom Favourites', slug: 'custom-favourites', description: 'Most popular customizable products.', banner_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: collectionIds.bestSellers, name: 'Best Sellers', slug: 'best-sellers', description: 'Our top-selling products.', banner_key: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ] as any[],

  products: [
    {
      id: productIds.classicTee,
      category_id: categoryIds.tshirts,
      title: 'Classic Oversized Tee',
      slug: 'classic-oversized-tee',
      description: 'Premium 220 GSM cotton oversized tee with dropped shoulders. Perfect canvas for custom designs.',
      status: 'active',
      base_price: 1299,
      compare_at_price: 1599,
      customization_enabled: true,
      seo_title: 'Classic Oversized Tee — Bingooo',
      seo_description: 'Premium oversized tee in 220 GSM cotton. Customize with your own design or wear it plain.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: productIds.graphicTee,
      category_id: categoryIds.tshirts,
      title: 'Graphic Print Tee — Midnight',
      slug: 'graphic-print-tee-midnight',
      description: 'Bold midnight-themed graphic print on soft cotton.',
      status: 'active',
      base_price: 1499,
      compare_at_price: null,
      customization_enabled: false,
      seo_title: 'Graphic Print Tee Midnight — Bingooo',
      seo_description: 'Stand out with our midnight graphic print on premium cotton.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: productIds.hoodie,
      category_id: categoryIds.hoodies,
      title: 'Essential Pullover Hoodie',
      slug: 'essential-pullover-hoodie',
      description: 'Cozy 350 GSM fleece-lined hoodie. Adjustable hood, kangaroo pocket, ribbed cuffs.',
      status: 'active',
      base_price: 2499,
      compare_at_price: 2999,
      customization_enabled: true,
      seo_title: 'Essential Pullover Hoodie — Bingooo',
      seo_description: 'Warm and customizable pullover hoodie in premium fleece.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as any[],

  product_images: [
    { id: uuidv4(), product_id: productIds.classicTee, url: '/custom/tshirt-step-1.png', object_key: '/custom/tshirt-step-1.png', alt_text: 'Classic Oversized Tee in Natural Beige', sort_order: 0, is_primary: true },
    { id: uuidv4(), product_id: productIds.graphicTee, url: '/custom/tshirt-step-3-black.png', object_key: '/custom/tshirt-step-3-black.png', alt_text: 'Graphic Print Tee in Midnight Obsidian', sort_order: 0, is_primary: true },
    { id: uuidv4(), product_id: productIds.hoodie, url: '/custom/tshirt-step-2.png', object_key: '/custom/tshirt-step-2.png', alt_text: 'Essential Custom Apparel in Sandstone', sort_order: 0, is_primary: true },
  ] as any[],
  product_variants: [...teeVariants, ...graphicVariants, ...hoodieVariants] as any[],
  product_collections: [
    { product_id: productIds.classicTee, collection_id: collectionIds.streetwear },
    { product_id: productIds.classicTee, collection_id: collectionIds.custom },
    { product_id: productIds.classicTee, collection_id: collectionIds.bestSellers },
    { product_id: productIds.graphicTee, collection_id: collectionIds.summer },
    { product_id: productIds.hoodie, collection_id: collectionIds.streetwear },
    { product_id: productIds.hoodie, collection_id: collectionIds.custom },
  ] as any[],
  inventory_movements: [] as any[],
  wishlists: [] as any[],
  carts: [] as any[],
  cart_items: [] as any[],
  orders: [] as any[],
  order_items: [] as any[],
  payments: [] as any[],
  refunds: [] as any[],
  coupons: [
    { id: uuidv4(), code: 'WELCOME10', type: 'percentage', value: 10, min_order_value: 500, max_discount: 200, usage_limit: 100, usage_count: 0, starts_at: null, ends_at: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuidv4(), code: 'FLAT200', type: 'fixed', value: 200, min_order_value: 1000, max_discount: null, usage_limit: 50, usage_count: 0, starts_at: null, ends_at: null, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ] as any[],
  coupon_redemptions: [] as any[],
  reviews: [] as any[],
  customizations: [] as any[],
  customization_assets: [] as any[],
  shipments: [] as any[],
  notifications: [] as any[],
  audit_logs: [] as any[],
  addresses: [] as any[],
  profiles: [] as any[],
  banners: [
    {
      id: 'ban-1',
      title: 'Wear What Feels Like You',
      subtitle: 'Streetwear silhouettes. Heavyweight 240 GSM combed cotton.',
      ctaText: "Shop Men's Wear",
      targetUrl: '/shop',
      desktopImageUrl: '/hero-banner.png',
      mobileImageUrl: '/hero-banner.png',
      badge: 'DROP 01 • OVERSIZED FIT',
      priority: 1,
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ban-2',
      title: 'Everyday Luxury. Built to Last.',
      subtitle: 'Minimalist cuts crafted from premium combed cotton. Elevated aesthetics.',
      ctaText: 'Explore Drop 02',
      targetUrl: '/shop',
      desktopImageUrl: '/hero-banner-2.jpg',
      mobileImageUrl: '/hero-banner-2.jpg',
      badge: 'STUDIO DROP • ARCHITECTURAL EDIT',
      priority: 2,
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ban-3',
      title: 'Tailored Statement Menswear',
      subtitle: 'Signature back prints, relaxed drape, and confident proportions.',
      ctaText: 'Shop The Look',
      targetUrl: '/shop',
      desktopImageUrl: '/hero-banner-3.jpg',
      mobileImageUrl: '/hero-banner-3.jpg',
      badge: 'CAMPAIGN 2026 • SIGNATURE FIT',
      priority: 3,
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ban-4',
      title: 'Natural Earth Tones & Minimalism',
      subtitle: 'Warm cream streetwear essentials with precision embroidery.',
      ctaText: 'Discover Essentials',
      targetUrl: '/shop',
      desktopImageUrl: '/hero-banner-4.jpg',
      mobileImageUrl: '/hero-banner-4.jpg',
      badge: 'LIMITED EDITION • NATURAL PALETTE',
      priority: 4,
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ban-5',
      title: 'Heavyweight Crimson Collection',
      subtitle: 'Ultra-warm drop-shoulder hoodies with iconic distressed B artwork.',
      ctaText: 'Create Your Design',
      targetUrl: '/customize',
      desktopImageUrl: '/hero-banner-5.jpg',
      mobileImageUrl: '/hero-banner-5.jpg',
      badge: 'CUSTOM STUDIO • HOODIES & TEES',
      priority: 5,
      isActive: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as any[],
  settings: {
    cod_enabled: true,
    cod_deposit_percentage: 30,
    shipping_fee_default: 99,
    free_shipping_threshold: 999,
    max_upload_size_mb: 15,
    currency: 'INR',
  } as Record<string, any>,
};

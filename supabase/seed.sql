-- ================================================================
-- Bingooo E-Commerce — Seed Data
-- Sample categories, products, variants for development
-- ================================================================

-- ── Roles ──────────────────────────────────────────────────────
INSERT INTO roles (code, name) VALUES
  ('SUPER_ADMIN', 'Super Administrator'),
  ('ADMIN', 'Administrator'),
  ('MANAGER', 'Manager'),
  ('STAFF', 'Staff'),
  ('CUSTOMER', 'Customer');

-- ── Permissions ────────────────────────────────────────────────
INSERT INTO permissions (code, name) VALUES
  ('products.read', 'Read Products'),
  ('products.write', 'Write Products'),
  ('orders.read', 'Read Orders'),
  ('orders.update', 'Update Orders'),
  ('customers.read', 'Read Customers'),
  ('customizations.review', 'Review Customizations'),
  ('payments.refund', 'Process Refunds'),
  ('settings.manage', 'Manage Settings');

-- ── Categories ─────────────────────────────────────────────────
INSERT INTO categories (name, slug, is_active) VALUES
  ('T-Shirts', 't-shirts', true),
  ('Hoodies', 'hoodies', true),
  ('Sweatshirts', 'sweatshirts', true),
  ('Caps', 'caps', true),
  ('Accessories', 'accessories', true);

-- ── Collections ────────────────────────────────────────────────
INSERT INTO collections (name, slug, description, is_active) VALUES
  ('Summer 2025', 'summer-2025', 'Fresh summer collection with bold prints and light fabrics.', true),
  ('Streetwear Essentials', 'streetwear-essentials', 'Core streetwear pieces for everyday style.', true),
  ('Custom Favourites', 'custom-favourites', 'Most popular customizable products.', true),
  ('Best Sellers', 'best-sellers', 'Our top-selling products.', true);

-- ── Sample Products ────────────────────────────────────────────
INSERT INTO products (category_id, title, slug, description, status, base_price, compare_at_price, customization_enabled, seo_title, seo_description)
VALUES
  (
    (SELECT id FROM categories WHERE slug = 't-shirts'),
    'Classic Oversized Tee',
    'classic-oversized-tee',
    'Premium 220 GSM cotton oversized tee with dropped shoulders. Perfect canvas for custom designs.',
    'active',
    1299.00,
    1599.00,
    true,
    'Classic Oversized Tee — Bingooo',
    'Premium oversized tee in 220 GSM cotton. Customize with your own design or wear it plain.'
  ),
  (
    (SELECT id FROM categories WHERE slug = 't-shirts'),
    'Graphic Print Tee — Midnight',
    'graphic-print-tee-midnight',
    'Bold midnight-themed graphic print on soft cotton.',
    'active',
    1499.00,
    NULL,
    false,
    'Graphic Print Tee Midnight — Bingooo',
    'Stand out with our midnight graphic print on premium cotton.'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'hoodies'),
    'Essential Pullover Hoodie',
    'essential-pullover-hoodie',
    'Cozy 350 GSM fleece-lined hoodie. Adjustable hood, kangaroo pocket, ribbed cuffs.',
    'active',
    2499.00,
    2999.00,
    true,
    'Essential Pullover Hoodie — Bingooo',
    'Warm and customizable pullover hoodie in premium fleece.'
  );

-- ── Variants for Classic Oversized Tee ─────────────────────────
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity)
SELECT
  p.id,
  'COT-' || s.size || '-' || c.code,
  s.size,
  c.color,
  c.hex,
  1299.00,
  25
FROM products p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size)
CROSS JOIN (VALUES ('BLK', 'Black', '#111111'), ('WHT', 'White', '#FFFFFF'), ('SNS', 'Sandstone', '#D4C4A8')) AS c(code, color, hex)
WHERE p.slug = 'classic-oversized-tee';

-- ── Variants for Graphic Print Tee ─────────────────────────────
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity)
SELECT
  p.id,
  'GPT-' || s.size || '-BLK',
  s.size,
  'Black',
  '#111111',
  1499.00,
  15
FROM products p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL')) AS s(size)
WHERE p.slug = 'graphic-print-tee-midnight';

-- ── Variants for Hoodie ────────────────────────────────────────
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity)
SELECT
  p.id,
  'EPH-' || s.size || '-' || c.code,
  s.size,
  c.color,
  c.hex,
  2499.00,
  10
FROM products p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size)
CROSS JOIN (VALUES ('CHR', 'Charcoal', '#333333'), ('OAT', 'Oatmeal', '#E8DCC8')) AS c(code, color, hex)
WHERE p.slug = 'essential-pullover-hoodie';

-- ── Settings ───────────────────────────────────────────────────
INSERT INTO settings (key, value_json) VALUES
  ('cod_enabled', '"true"'::jsonb),
  ('cod_deposit_percentage', '30'::jsonb),
  ('shipping_fee_default', '99'::jsonb),
  ('free_shipping_threshold', '999'::jsonb),
  ('max_upload_size_mb', '15'::jsonb),
  ('currency', '"INR"'::jsonb);

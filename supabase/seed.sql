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

-- ── Settings ───────────────────────────────────────────────────
INSERT INTO settings (key, value_json) VALUES
  ('shipping_fee_default', '99'::jsonb),
  ('free_shipping_threshold', '999'::jsonb),
  ('max_upload_size_mb', '15'::jsonb),
  ('currency', '"INR"'::jsonb);

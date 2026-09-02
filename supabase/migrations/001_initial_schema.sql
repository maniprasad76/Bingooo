-- ================================================================
-- Bingooo E-Commerce — Initial Database Schema
-- Migration 001: All core tables, indexes, and constraints
-- ================================================================

-- ── Custom enum types ──────────────────────────────────────────

CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE cart_status AS ENUM ('active', 'merged', 'converted', 'abandoned');
CREATE TYPE order_status AS ENUM (
  'pending_payment', 'paid', 'processing', 'packed',
  'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'
);
CREATE TYPE payment_status AS ENUM (
  'pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'
);
CREATE TYPE payment_method AS ENUM ('prepaid', 'cod', 'partial_cod');
CREATE TYPE customization_status AS ENUM (
  'uploaded', 'processing', 'needs_review', 'approved', 'rejected', 'ready_for_print'
);
CREATE TYPE inventory_movement_type AS ENUM (
  'restock', 'sale', 'reservation', 'release', 'adjustment', 'return'
);
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE shipment_status AS ENUM ('pending', 'shipped', 'in_transit', 'delivered', 'returned');
CREATE TYPE refund_status AS ENUM ('pending', 'processed', 'failed');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'push');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'failed');
CREATE TYPE asset_type AS ENUM ('upload', 'preview', 'print');

-- ── Extension for UUID generation ──────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ───────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  avatar_key  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Roles & Permissions ────────────────────────────────────────
CREATE TABLE roles (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE permissions (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ── Categories ─────────────────────────────────────────────────
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  parent_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_key  TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ── Collections ────────────────────────────────────────────────
CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_key  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections(slug);

-- ── Products ───────────────────────────────────────────────────
CREATE TABLE products (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id            UUID REFERENCES categories(id) ON DELETE SET NULL,
  title                  TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  description            TEXT,
  status                 product_status NOT NULL DEFAULT 'draft',
  base_price             NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
  compare_at_price       NUMERIC(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  customization_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title              TEXT,
  seo_description        TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);

-- ── Product ↔ Collection (many-to-many) ────────────────────────
CREATE TABLE product_collections (
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- ── Product Images ─────────────────────────────────────────────
CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  alt_text   TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ── Product Variants ───────────────────────────────────────────
CREATE TABLE product_variants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku               TEXT NOT NULL UNIQUE,
  size              TEXT,
  color             TEXT,
  color_hex         TEXT,
  price             NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock_quantity    INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_reserved_lte_stock CHECK (reserved_quantity <= stock_quantity)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- ── Inventory Movements ────────────────────────────────────────
CREATE TABLE inventory_movements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id     UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  type           inventory_movement_type NOT NULL,
  quantity       INT NOT NULL,
  reference_type TEXT,
  reference_id   UUID,
  created_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_variant ON inventory_movements(variant_id);

-- ── Addresses ──────────────────────────────────────────────────
CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  line1       TEXT NOT NULL,
  line2       TEXT,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'IN',
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ── Carts ──────────────────────────────────────────────────────
CREATE TABLE carts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  status     cart_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

-- ── Cart Items ─────────────────────────────────────────────────
CREATE TABLE cart_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id          UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id       UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity         INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  customization_id UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ── Wishlists ──────────────────────────────────────────────────
CREATE TABLE wishlists (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);

-- ── Customizations ─────────────────────────────────────────────
CREATE TABLE customizations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status         customization_status NOT NULL DEFAULT 'uploaded',
  design_json    JSONB,
  preview_key    TEXT,
  print_file_key TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customizations_user ON customizations(user_id);
CREATE INDEX idx_customizations_status ON customizations(status);

-- ── Customization Assets ───────────────────────────────────────
CREATE TABLE customization_assets (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customization_id UUID NOT NULL REFERENCES customizations(id) ON DELETE CASCADE,
  object_key       TEXT NOT NULL,
  asset_type       asset_type NOT NULL,
  metadata_json    JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cust_assets_customization ON customization_assets(customization_id);

-- ── Orders ─────────────────────────────────────────────────────
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number          TEXT NOT NULL UNIQUE,
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status                order_status NOT NULL DEFAULT 'pending_payment',
  payment_status        payment_status NOT NULL DEFAULT 'pending',
  payment_method        payment_method NOT NULL DEFAULT 'prepaid',
  subtotal              NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount              NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping_fee          NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  tax                   NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total                 NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  currency              TEXT NOT NULL DEFAULT 'INR',
  address_snapshot_json JSONB NOT NULL,
  cod_deposit           NUMERIC(12, 2),
  cod_remaining         NUMERIC(12, 2),
  coupon_code           TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- ── Order Items ────────────────────────────────────────────────
CREATE TABLE order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id          UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  customization_id    UUID REFERENCES customizations(id) ON DELETE SET NULL,
  sku                 TEXT NOT NULL,
  title_snapshot      TEXT NOT NULL,
  variant_snapshot_json JSONB NOT NULL,
  quantity            INT NOT NULL CHECK (quantity > 0),
  unit_price          NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  total               NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ── Payments ───────────────────────────────────────────────────
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider            TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id   TEXT,
  provider_payment_id TEXT,
  status              payment_status NOT NULL DEFAULT 'pending',
  amount              NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency            TEXT NOT NULL DEFAULT 'INR',
  raw_event_id        TEXT,
  idempotency_key     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_provider_order ON payments(provider_order_id);
CREATE INDEX idx_payments_idempotency ON payments(idempotency_key);

-- ── Refunds ────────────────────────────────────────────────────
CREATE TABLE refunds (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id         UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  provider_refund_id TEXT,
  amount             NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status             refund_status NOT NULL DEFAULT 'pending',
  reason             TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);

-- ── Coupons ────────────────────────────────────────────────────
CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  type            coupon_type NOT NULL,
  value           NUMERIC(12, 2) NOT NULL CHECK (value > 0),
  min_order_value NUMERIC(12, 2),
  max_discount    NUMERIC(12, 2),
  usage_limit     INT,
  usage_count     INT NOT NULL DEFAULT 0,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- ── Coupon Redemptions ─────────────────────────────────────────
CREATE TABLE coupon_redemptions (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id  UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX idx_redemptions_user ON coupon_redemptions(user_id);

-- ── Reviews ────────────────────────────────────────────────────
CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title      TEXT,
  body       TEXT,
  status     review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ── Shipments ──────────────────────────────────────────────────
CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier         TEXT,
  tracking_number TEXT,
  status          shipment_status NOT NULL DEFAULT 'pending',
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_order ON shipments(order_id);

-- ── Notifications ──────────────────────────────────────────────
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  channel      notification_channel NOT NULL DEFAULT 'email',
  status       notification_status NOT NULL DEFAULT 'queued',
  payload_json JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ── Audit Logs ─────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  metadata_json JSONB,
  ip            TEXT,
  request_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ── Settings (key-value store) ─────────────────────────────────
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Updated-at trigger function ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables that have it
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'categories', 'collections', 'products',
      'product_variants', 'addresses', 'carts', 'customizations',
      'orders', 'payments', 'refunds', 'coupons', 'reviews',
      'shipments', 'settings'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl
    );
  END LOOP;
END;
$$;

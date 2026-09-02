-- ================================================================
-- Bingooo E-Commerce — Row Level Security Policies
-- Migration 002: RLS for all customer-facing tables
-- ================================================================

-- ── Enable RLS on all customer-owned tables ────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ── Profiles ───────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Addresses ──────────────────────────────────────────────────

CREATE POLICY addresses_select_own ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY addresses_insert_own ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY addresses_update_own ON addresses
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY addresses_delete_own ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- ── Carts ──────────────────────────────────────────────────────

CREATE POLICY carts_select_own ON carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY carts_insert_own ON carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY carts_update_own ON carts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Cart Items ─────────────────────────────────────────────────

CREATE POLICY cart_items_select_own ON cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY cart_items_insert_own ON cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY cart_items_update_own ON cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY cart_items_delete_own ON cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    )
  );

-- ── Wishlists ──────────────────────────────────────────────────

CREATE POLICY wishlists_select_own ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY wishlists_insert_own ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY wishlists_delete_own ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- ── Customizations ─────────────────────────────────────────────

CREATE POLICY customizations_select_own ON customizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY customizations_insert_own ON customizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY customizations_update_own ON customizations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Customization Assets ───────────────────────────────────────

CREATE POLICY cust_assets_select_own ON customization_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customizations
      WHERE customizations.id = customization_assets.customization_id
        AND customizations.user_id = auth.uid()
    )
  );

CREATE POLICY cust_assets_insert_own ON customization_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customizations
      WHERE customizations.id = customization_assets.customization_id
        AND customizations.user_id = auth.uid()
    )
  );

-- ── Orders ─────────────────────────────────────────────────────

-- Customers can only read their own orders (cannot update)
CREATE POLICY orders_select_own ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- ── Order Items ────────────────────────────────────────────────

CREATE POLICY order_items_select_own ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- ── Payments ───────────────────────────────────────────────────

-- Customers can read their own payment records (cannot modify)
CREATE POLICY payments_select_own ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
  );

-- ── Reviews ────────────────────────────────────────────────────

-- Anyone can read approved reviews
CREATE POLICY reviews_select_approved ON reviews
  FOR SELECT USING (status = 'approved');

-- Users can read their own reviews regardless of status
CREATE POLICY reviews_select_own ON reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create reviews
CREATE POLICY reviews_insert_own ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending reviews
CREATE POLICY reviews_update_own ON reviews
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- ── Notifications ──────────────────────────────────────────────

CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- ── Public read-only tables (no RLS needed for these) ──────────
-- products, product_images, product_variants, categories,
-- collections, product_collections are publicly readable.
-- They do NOT have RLS enabled so any user (including anon) can read them.
-- Write access is controlled exclusively through the NestJS API
-- using the service-role key.

COMMENT ON POLICY profiles_select_own ON profiles IS 'Customers can only read their own profile';
COMMENT ON POLICY orders_select_own ON orders IS 'Customers can only read their own orders — no direct updates allowed';
COMMENT ON POLICY payments_select_own ON payments IS 'Customers can view but never modify payment records';

-- ================================================================
-- Bingooo E-Commerce — Row Level Security (RLS) Policies
-- Migration 002: Universal, Production-Grade RLS across all tables
-- ================================================================

-- ── 1. Helper Functions for RBAC ─────────────────────────────────
-- Cached, security-definer helper functions to check roles & permissions
-- without triggering RLS recursion or per-row evaluation overhead.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(perm_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    JOIN role_permissions rp ON rp.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND (r.code = 'SUPER_ADMIN' OR p.code = perm_code)
  );
$$;

-- Restrict function execution: authenticated users can execute; anon cannot
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_permission(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT) TO authenticated;


-- ── 2. Performance Indexes for RLS Filter Columns ────────────────
-- Ensure all columns used in RLS policies have dedicated b-tree indexes.

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_products_active_status ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_variants_active ON product_variants(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_reviews_pending ON reviews(status) WHERE status = 'pending';


-- ── 3. Enable RLS on ALL 29 Tables in Public Schema ───────────────
-- Guarantee database-level tenant isolation across every table.

-- Customer-owned tables
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

-- Catalog & Content tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Operations, Commerce & Auditing
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RBAC & Security Audit
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- ── 4. Grant Table-Level Access to Supabase Roles ─────────────────
-- PostgREST requires role grants before RLS policies are evaluated.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


-- ── 5. Profiles Policies ──────────────────────────────────────────
-- Customer can read/manage their own profile. Staff can view all profiles.

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT auth.uid()) = id OR (SELECT public.is_admin()));


-- ── 6. Addresses Policies ─────────────────────────────────────────
-- Customer manages their own delivery addresses. Staff can view for shipping.

DROP POLICY IF EXISTS addresses_select_own ON addresses;
CREATE POLICY addresses_select_own ON addresses
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS addresses_insert_own ON addresses;
CREATE POLICY addresses_insert_own ON addresses
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS addresses_update_own ON addresses;
CREATE POLICY addresses_update_own ON addresses
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS addresses_delete_own ON addresses;
CREATE POLICY addresses_delete_own ON addresses
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ── 7. Carts & Cart Items Policies ────────────────────────────────
-- Scoped strictly to the authenticated owner.

DROP POLICY IF EXISTS carts_select_own ON carts;
CREATE POLICY carts_select_own ON carts
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS carts_insert_own ON carts;
CREATE POLICY carts_insert_own ON carts
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS carts_update_own ON carts;
CREATE POLICY carts_update_own ON carts
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS carts_delete_own ON carts;
CREATE POLICY carts_delete_own ON carts
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS cart_items_select_own ON cart_items;
CREATE POLICY cart_items_select_own ON cart_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS cart_items_insert_own ON cart_items;
CREATE POLICY cart_items_insert_own ON cart_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS cart_items_update_own ON cart_items;
CREATE POLICY cart_items_update_own ON cart_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS cart_items_delete_own ON cart_items;
CREATE POLICY cart_items_delete_own ON cart_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = (SELECT auth.uid())
    )
  );


-- ── 8. Wishlists Policies ─────────────────────────────────────────

DROP POLICY IF EXISTS wishlists_select_own ON wishlists;
CREATE POLICY wishlists_select_own ON wishlists
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS wishlists_insert_own ON wishlists;
CREATE POLICY wishlists_insert_own ON wishlists
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS wishlists_delete_own ON wishlists;
CREATE POLICY wishlists_delete_own ON wishlists
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ── 9. Customizations & Studio Assets ─────────────────────────────
-- Customers manage their designs; staff can view and review print queue.

DROP POLICY IF EXISTS customizations_select_own ON customizations;
CREATE POLICY customizations_select_own ON customizations
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS customizations_insert_own ON customizations;
CREATE POLICY customizations_insert_own ON customizations
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS customizations_update_own ON customizations;
CREATE POLICY customizations_update_own ON customizations
  FOR UPDATE TO authenticated
  USING (
    ((SELECT auth.uid()) = user_id)
    OR (SELECT public.has_permission('customizations.review'))
  )
  WITH CHECK (
    ((SELECT auth.uid()) = user_id)
    OR (SELECT public.has_permission('customizations.review'))
  );

DROP POLICY IF EXISTS customizations_delete_own ON customizations;
CREATE POLICY customizations_delete_own ON customizations
  FOR DELETE TO authenticated
  USING (
    ((SELECT auth.uid()) = user_id AND status = 'uploaded')
    OR (SELECT public.is_admin())
  );

DROP POLICY IF EXISTS cust_assets_select_own ON customization_assets;
CREATE POLICY cust_assets_select_own ON customization_assets
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_staff())
    OR EXISTS (
      SELECT 1 FROM customizations
      WHERE customizations.id = customization_assets.customization_id
        AND customizations.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS cust_assets_insert_own ON customization_assets;
CREATE POLICY cust_assets_insert_own ON customization_assets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customizations
      WHERE customizations.id = customization_assets.customization_id
        AND customizations.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS cust_assets_delete_own ON customization_assets;
CREATE POLICY cust_assets_delete_own ON customization_assets
  FOR DELETE TO authenticated
  USING (
    (SELECT public.is_admin())
    OR EXISTS (
      SELECT 1 FROM customizations
      WHERE customizations.id = customization_assets.customization_id
        AND customizations.user_id = (SELECT auth.uid())
        AND customizations.status = 'uploaded'
    )
  );



-- ── 10. Orders & Order Items ──────────────────────────────────────
-- Customers view own orders. Staff can view and update order status.

DROP POLICY IF EXISTS orders_select_own ON orders;
CREATE POLICY orders_select_own ON orders
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS orders_update_staff ON orders;
CREATE POLICY orders_update_staff ON orders
  FOR UPDATE TO authenticated
  USING ((SELECT public.has_permission('orders.update')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('orders.update')) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS order_items_select_own ON order_items;
CREATE POLICY order_items_select_own ON order_items
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_staff())
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = (SELECT auth.uid())
    )
  );


-- ── 11. Payments, Refunds & Shipments ─────────────────────────────
-- Customers read own payment/shipment data. Staff manage operations.

DROP POLICY IF EXISTS payments_select_own ON payments;
CREATE POLICY payments_select_own ON payments
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_staff())
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
        AND orders.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS refunds_select_own ON refunds;
CREATE POLICY refunds_select_own ON refunds
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_staff())
    OR EXISTS (
      SELECT 1 FROM payments
      JOIN orders ON orders.id = payments.order_id
      WHERE payments.id = refunds.payment_id
        AND orders.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS refunds_insert_staff ON refunds;
CREATE POLICY refunds_insert_staff ON refunds
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT public.has_permission('payments.refund'))
    OR (SELECT public.is_admin())
  );

DROP POLICY IF EXISTS shipments_select_own ON shipments;
CREATE POLICY shipments_select_own ON shipments
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_staff())
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = shipments.order_id
        AND orders.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS shipments_manage_staff ON shipments;
CREATE POLICY shipments_manage_staff ON shipments
  FOR ALL TO authenticated
  USING ((SELECT public.is_staff()))
  WITH CHECK ((SELECT public.is_staff()));


-- ── 12. Reviews Policies ──────────────────────────────────────────
-- Public view approved reviews. Users manage own reviews. Staff moderate.

DROP POLICY IF EXISTS reviews_select_approved ON reviews;
CREATE POLICY reviews_select_approved ON reviews
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS reviews_select_own ON reviews;
CREATE POLICY reviews_select_own ON reviews
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS reviews_insert_own ON reviews;
CREATE POLICY reviews_insert_own ON reviews
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS reviews_update_own ON reviews;
CREATE POLICY reviews_update_own ON reviews
  FOR UPDATE TO authenticated
  USING (
    ((SELECT auth.uid()) = user_id AND status = 'pending')
    OR (SELECT public.is_staff())
  )
  WITH CHECK (
    ((SELECT auth.uid()) = user_id)
    OR (SELECT public.is_staff())
  );

DROP POLICY IF EXISTS reviews_delete_own ON reviews;
CREATE POLICY reviews_delete_own ON reviews
  FOR DELETE TO authenticated
  USING (
    ((SELECT auth.uid()) = user_id AND status = 'pending')
    OR (SELECT public.is_admin())
  );


-- ── 13. Notifications Policies ────────────────────────────────────

DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS notifications_delete_own ON notifications;
CREATE POLICY notifications_delete_own ON notifications
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ── 14. Catalog & Public Content ──────────────────────────────────
-- Public can view active catalog merchandise.
-- Staff can view inactive items and manage catalog with 'products.write'.

-- Categories
DROP POLICY IF EXISTS categories_select_public ON categories;
CREATE POLICY categories_select_public ON categories
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS categories_manage_staff ON categories;
CREATE POLICY categories_manage_staff ON categories
  FOR ALL TO authenticated
  USING ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()));

-- Collections
DROP POLICY IF EXISTS collections_select_public ON collections;
CREATE POLICY collections_select_public ON collections
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS collections_manage_staff ON collections;
CREATE POLICY collections_manage_staff ON collections
  FOR ALL TO authenticated
  USING ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()));

-- Products
DROP POLICY IF EXISTS products_select_public ON products;
CREATE POLICY products_select_public ON products
  FOR SELECT TO anon, authenticated
  USING (status = 'active' OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS products_manage_staff ON products;
CREATE POLICY products_manage_staff ON products
  FOR ALL TO authenticated
  USING ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()));

-- Product Collections Junction
DROP POLICY IF EXISTS product_collections_select_public ON product_collections;
CREATE POLICY product_collections_select_public ON product_collections
  FOR SELECT TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS product_collections_manage_staff ON product_collections;
CREATE POLICY product_collections_manage_staff ON product_collections
  FOR ALL TO authenticated
  USING ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()));

-- Product Images
DROP POLICY IF EXISTS product_images_select_public ON product_images;
CREATE POLICY product_images_select_public ON product_images
  FOR SELECT TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS product_images_manage_staff ON product_images;
CREATE POLICY product_images_manage_staff ON product_images
  FOR ALL TO authenticated
  USING ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()));

-- Product Variants
DROP POLICY IF EXISTS product_variants_select_public ON product_variants;
CREATE POLICY product_variants_select_public ON product_variants
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS product_variants_manage_staff ON product_variants;
CREATE POLICY product_variants_manage_staff ON product_variants
  FOR ALL TO authenticated
  USING ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('products.write')) OR (SELECT public.is_admin()));


-- ── 15. Coupons & Redemptions ─────────────────────────────────────
-- Customers can validate active coupons; staff/admin manage promotions.

DROP POLICY IF EXISTS coupons_select_active ON coupons;
CREATE POLICY coupons_select_active ON coupons
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR (SELECT public.is_staff()));

DROP POLICY IF EXISTS coupons_manage_admin ON coupons;
CREATE POLICY coupons_manage_admin ON coupons
  FOR ALL TO authenticated
  USING ((SELECT public.has_permission('settings.manage')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('settings.manage')) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS coupon_redemptions_select_own ON coupon_redemptions;
CREATE POLICY coupon_redemptions_select_own ON coupon_redemptions
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_staff()));


-- ── 16. Inventory Movements ───────────────────────────────────────
-- Strictly restricted to authorized staff and service-role.

DROP POLICY IF EXISTS inventory_movements_select_staff ON inventory_movements;
CREATE POLICY inventory_movements_select_staff ON inventory_movements
  FOR SELECT TO authenticated
  USING ((SELECT public.is_staff()));

DROP POLICY IF EXISTS inventory_movements_insert_staff ON inventory_movements;
CREATE POLICY inventory_movements_insert_staff ON inventory_movements
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_staff()));


-- ── 17. Settings ──────────────────────────────────────────────────
-- Public can read store branding and checkout configuration.
-- Only administrators can modify store settings.

DROP POLICY IF EXISTS settings_select_public ON settings;
CREATE POLICY settings_select_public ON settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS settings_manage_admin ON settings;
CREATE POLICY settings_manage_admin ON settings
  FOR ALL TO authenticated
  USING ((SELECT public.has_permission('settings.manage')) OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT public.has_permission('settings.manage')) OR (SELECT public.is_admin()));


-- ── 18. RBAC & Security Audit Tables ──────────────────────────────
-- Authenticated users can read roles & permissions.
-- Audit logs and role assignment are restricted to administrators.

DROP POLICY IF EXISTS roles_select_authenticated ON roles;
CREATE POLICY roles_select_authenticated ON roles
  FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS permissions_select_authenticated ON permissions;
CREATE POLICY permissions_select_authenticated ON permissions
  FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS role_permissions_select_authenticated ON role_permissions;
CREATE POLICY role_permissions_select_authenticated ON role_permissions
  FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS user_roles_select_own ON user_roles;
CREATE POLICY user_roles_select_own ON user_roles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS user_roles_manage_admin ON user_roles;
CREATE POLICY user_roles_manage_admin ON user_roles
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS audit_logs_select_admin ON audit_logs;
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS audit_logs_insert_authenticated ON audit_logs;
CREATE POLICY audit_logs_insert_authenticated ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = actor_user_id OR actor_user_id IS NULL);


-- ── 19. Policy Documentation Comments ─────────────────────────────

COMMENT ON FUNCTION public.is_admin() IS 'Security definer helper checking if caller has SUPER_ADMIN or ADMIN role';
COMMENT ON FUNCTION public.is_staff() IS 'Security definer helper checking if caller is in internal staff roles';
COMMENT ON FUNCTION public.has_permission(TEXT) IS 'Security definer helper checking if caller has specific permission';

COMMENT ON POLICY profiles_select_own ON profiles IS 'Customers read own profile; staff view all customer profiles';
COMMENT ON POLICY orders_select_own ON orders IS 'Customers read own orders; staff view all store orders';
COMMENT ON POLICY orders_update_staff ON orders IS 'Authorized staff with orders.update can update order lifecycle state';
COMMENT ON POLICY payments_select_own ON payments IS 'Customers view own order payments; staff view all';
COMMENT ON POLICY products_select_public ON products IS 'Public read access for active catalog; staff view draft/archived';
COMMENT ON POLICY products_manage_staff ON products IS 'Staff with products.write permission can manage catalog items';
COMMENT ON POLICY categories_select_public ON categories IS 'Public read access for active taxonomy categories';
COMMENT ON POLICY coupons_select_active ON coupons IS 'Public read access for active coupons to enable checkout validation';
COMMENT ON TABLE inventory_movements IS 'Protected under RLS; read/insert restricted to authorized staff';
COMMENT ON TABLE audit_logs IS 'Protected under RLS; reads restricted exclusively to administrators';

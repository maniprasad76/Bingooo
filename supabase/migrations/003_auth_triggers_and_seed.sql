-- ================================================================
-- Bingooo E-Commerce — Migration 003
-- Auth Triggers, RBAC Matrix, Catalog Seed, and Storage Policies
-- ================================================================

-- ── 1. Automatic User Profile & Role Provisioning Trigger ───────
-- When a user registers in auth.users, automatically initialize
-- their public.profiles row and assign them the CUSTOMER role.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_role_id UUID;
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (id, full_name, phone, avatar_key, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
      THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = CASE 
      WHEN public.profiles.phone IS NULL OR public.profiles.phone = '' 
      THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END,
    updated_at = NOW();

  -- Resolve default CUSTOMER role
  SELECT id INTO v_customer_role_id
  FROM public.roles
  WHERE code = 'CUSTOMER';

  -- Automatically assign default CUSTOMER role
  IF v_customer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, v_customer_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. Roles Seed ──────────────────────────────────────────────
INSERT INTO public.roles (code, name) VALUES
  ('SUPER_ADMIN', 'Super Administrator'),
  ('ADMIN', 'Administrator'),
  ('MANAGER', 'Store Manager'),
  ('STAFF', 'Store Staff'),
  ('CUSTOMER', 'Customer')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;


-- ── 3. Permissions Seed ────────────────────────────────────────
INSERT INTO public.permissions (code, name) VALUES
  ('products.read', 'Read Products Catalog'),
  ('products.write', 'Create and Update Products'),
  ('orders.read', 'Read Customer Orders'),
  ('orders.update', 'Update Order Status and Tracking'),
  ('orders.manage', 'Full Order Management and Operations'),
  ('customers.read', 'View Customer Accounts'),
  ('users.manage', 'Manage User Roles and Customers'),
  ('staff.manage', 'Manage Staff Members and Permissions'),
  ('customizations.review', 'Review and Approve Custom Print Designs'),
  ('payments.refund', 'Authorize and Issue Payment Refunds'),
  ('payments.manage', 'View and Manage Payments Ledger'),
  ('settings.manage', 'Modify Store and E-Commerce Settings')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;


-- ── 4. Role Permissions Mapping (RBAC Matrix) ──────────────────
-- SUPER_ADMIN & ADMIN receive all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code IN ('SUPER_ADMIN', 'ADMIN')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- MANAGER receives catalog, order, review, customer, and payments permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
  'products.read',
  'products.write',
  'orders.read',
  'orders.update',
  'orders.manage',
  'customers.read',
  'customizations.review',
  'payments.manage'
)
WHERE r.code = 'MANAGER'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- STAFF receives read and fulfillment permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.code IN (
  'products.read',
  'orders.read',
  'orders.update',
  'customizations.review'
)
WHERE r.code = 'STAFF'
ON CONFLICT (role_id, permission_id) DO NOTHING;


-- ── 5. Product Categories Seed ─────────────────────────────────
INSERT INTO public.categories (name, slug, is_active) VALUES
  ('T-Shirts', 't-shirts', true),
  ('Hoodies', 'hoodies', true),
  ('Sweatshirts', 'sweatshirts', true),
  ('Caps', 'caps', true),
  ('Accessories', 'accessories', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;


-- ── 6. Collections Seed ────────────────────────────────────────
INSERT INTO public.collections (name, slug, description, is_active) VALUES
  ('Summer 2025', 'summer-2025', 'Fresh summer collection with bold prints and light breathable fabrics.', true),
  ('Streetwear Essentials', 'streetwear-essentials', 'Core streetwear pieces for everyday urban style.', true),
  ('Custom Favourites', 'custom-favourites', 'Most popular customizable streetwear canvases.', true),
  ('Best Sellers', 'best-sellers', 'Top-selling premium apparel and headwear.', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;


-- ── 7. Products Seed ───────────────────────────────────────────
INSERT INTO public.products (
  category_id, title, slug, description, status,
  base_price, compare_at_price, customization_enabled,
  seo_title, seo_description
)
VALUES
  (
    (SELECT id FROM public.categories WHERE slug = 't-shirts' LIMIT 1),
    'Classic Oversized Tee',
    'classic-oversized-tee',
    'Premium 220 GSM combed cotton oversized tee with dropped shoulders. Perfect canvas for custom print designs.',
    'active',
    1299.00,
    1599.00,
    true,
    'Classic Oversized Tee — Bingooo',
    'Premium oversized tee in 220 GSM cotton. Customize with your own design or wear it plain.'
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 't-shirts' LIMIT 1),
    'Graphic Print Tee — Midnight',
    'graphic-print-tee-midnight',
    'Bold midnight-themed graphic print on ultra-soft breathable cotton.',
    'active',
    1499.00,
    NULL,
    false,
    'Graphic Print Tee Midnight — Bingooo',
    'Stand out with our midnight graphic print on premium cotton.'
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'hoodies' LIMIT 1),
    'Essential Pullover Hoodie',
    'essential-pullover-hoodie',
    'Cozy 350 GSM fleece-lined pullover hoodie. Features adjustable drawstring hood, kangaroo pocket, and ribbed cuffs.',
    'active',
    2499.00,
    2999.00,
    true,
    'Essential Pullover Hoodie — Bingooo',
    'Warm and customizable pullover hoodie in premium fleece fabric.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  base_price = EXCLUDED.base_price,
  customization_enabled = EXCLUDED.customization_enabled;


-- ── 8. Product Variants Seed ───────────────────────────────────
-- Variants for Classic Oversized Tee
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, price, stock_quantity, is_active)
SELECT
  p.id,
  'COT-' || s.size || '-' || c.code,
  s.size,
  c.color,
  c.hex,
  1299.00,
  25,
  true
FROM public.products p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size)
CROSS JOIN (VALUES ('BLK', 'Black', '#111111'), ('WHT', 'White', '#FFFFFF'), ('SNS', 'Sandstone', '#D4C4A8')) AS c(code, color, hex)
WHERE p.slug = 'classic-oversized-tee'
ON CONFLICT (sku) DO UPDATE SET
  stock_quantity = EXCLUDED.stock_quantity,
  is_active = EXCLUDED.is_active;

-- Variants for Graphic Print Tee
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, price, stock_quantity, is_active)
SELECT
  p.id,
  'GPT-' || s.size || '-BLK',
  s.size,
  'Black',
  '#111111',
  1499.00,
  15,
  true
FROM public.products p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL')) AS s(size)
WHERE p.slug = 'graphic-print-tee-midnight'
ON CONFLICT (sku) DO UPDATE SET
  stock_quantity = EXCLUDED.stock_quantity,
  is_active = EXCLUDED.is_active;

-- Variants for Essential Pullover Hoodie
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, price, stock_quantity, is_active)
SELECT
  p.id,
  'EPH-' || s.size || '-' || c.code,
  s.size,
  c.color,
  c.hex,
  2499.00,
  10,
  true
FROM public.products p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size)
CROSS JOIN (VALUES ('CHR', 'Charcoal', '#333333'), ('OAT', 'Oatmeal', '#E8DCC8')) AS c(code, color, hex)
WHERE p.slug = 'essential-pullover-hoodie'
ON CONFLICT (sku) DO UPDATE SET
  stock_quantity = EXCLUDED.stock_quantity,
  is_active = EXCLUDED.is_active;


-- ── 9. Store Settings Seed ─────────────────────────────────────
INSERT INTO public.settings (key, value_json) VALUES
  ('cod_enabled', '"true"'::jsonb),
  ('cod_deposit_percentage', '30'::jsonb),
  ('shipping_fee_default', '99'::jsonb),
  ('free_shipping_threshold', '999'::jsonb),
  ('max_upload_size_mb', '15'::jsonb),
  ('currency', '"INR"'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value_json = EXCLUDED.value_json;


-- ── 10. Supabase Storage Buckets & Policies ────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'product-images',
    'product-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'customizations',
    'customizations',
    false,
    20971520, -- 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Product images: public read access for all visitors
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');

-- Product images: staff/admin upload and update
DROP POLICY IF EXISTS "Staff can upload product images" ON storage.objects;
CREATE POLICY "Staff can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (SELECT public.is_staff()));

DROP POLICY IF EXISTS "Staff can delete product images" ON storage.objects;
CREATE POLICY "Staff can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (SELECT public.is_staff()));

-- Customizations: user can upload to their own folder (folder name is user_id)
DROP POLICY IF EXISTS "Users can upload own customization assets" ON storage.objects;
CREATE POLICY "Users can upload own customization assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'customizations'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Customizations: user can read own customization assets
DROP POLICY IF EXISTS "Users can view own customization assets" ON storage.objects;
CREATE POLICY "Users can view own customization assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'customizations'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR (SELECT public.is_staff())
    )
  );

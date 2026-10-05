-- Remove the three demo/placeholder products shipped by migration 003
-- (Classic Oversized Tee, Graphic Print Tee — Midnight, Essential Pullover
-- Hoodie) so a project that already applied that seed doesn't keep fake
-- catalog data live. Variants, images, and product_collections rows cascade
-- automatically (ON DELETE CASCADE in 001_initial_schema.sql). order_items
-- references products with ON DELETE RESTRICT, so this fails loudly instead
-- of silently deleting order history if a real order was ever placed
-- against one of these demo products — resolve that order first if it does.

DELETE FROM public.products
WHERE slug IN ('classic-oversized-tee', 'graphic-print-tee-midnight', 'essential-pullover-hoodie');

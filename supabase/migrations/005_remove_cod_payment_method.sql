-- Remove Cash on Delivery from the payment_method enum.
-- The storefront has operated as prepaid-only since the checkout DTO was
-- locked to `paymentMethod: 'prepaid'` (apps/backend/src/checkout/dto/checkout.dto.ts);
-- 'cod' and 'partial_cod' are dead values that no code path writes. This fails
-- loudly instead of silently if any row still holds one of them, since that
-- would mean a legacy COD order needs to be resolved by hand before narrowing
-- the type.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM orders WHERE payment_method IN ('cod', 'partial_cod')
  ) THEN
    RAISE EXCEPTION 'Found orders with payment_method cod/partial_cod — resolve them before running this migration.';
  END IF;
END $$;

ALTER TYPE payment_method RENAME TO payment_method_old;
CREATE TYPE payment_method AS ENUM ('prepaid');

ALTER TABLE orders
  ALTER COLUMN payment_method DROP DEFAULT,
  ALTER COLUMN payment_method TYPE payment_method USING payment_method::text::payment_method,
  ALTER COLUMN payment_method SET DEFAULT 'prepaid';

DROP TYPE payment_method_old;

-- Drop the partial-COD deposit/remaining columns from orders.
-- `cod_deposit` (amount paid upfront) and `cod_remaining` (amount due in
-- cash on delivery) implemented partial COD; the app has not written either
-- column since checkout was locked to payment_method = 'prepaid'
-- (apps/backend/src/checkout/dto/checkout.dto.ts), and no reader consumes
-- them (confirmed via repo-wide search). Both are nullable with no CHECK
-- constraints, so dropping them is a plain schema narrowing, not a data cast.

ALTER TABLE orders
  DROP COLUMN IF EXISTS cod_deposit,
  DROP COLUMN IF EXISTS cod_remaining;

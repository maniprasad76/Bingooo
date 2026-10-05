-- Drop the leftover Cash-on-Delivery / partial-COD settings rows.
-- `cod_deposit_percentage` was the partial-COD mechanism (% paid upfront,
-- remainder collected in cash on delivery) and `cod_enabled` gated it; the
-- app's live settings object (apps/backend/src/common/database/store.ts)
-- never carried either field, so these rows only ever existed in the
-- normalized `settings` table seeded by migration 003. Delete rather than
-- edit that historical migration, since it may already be applied.

DELETE FROM public.settings WHERE key IN ('cod_enabled', 'cod_deposit_percentage');

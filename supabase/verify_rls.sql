-- ================================================================
-- Bingooo E-Commerce — RLS Verification & Audit Script
-- Run in Supabase SQL Editor to verify RLS enforcement and test policies.
-- ================================================================

DO $$
DECLARE
  unprotected_count INT;
  unprotected_tables TEXT;
  total_tables INT;
  rls_tables INT;
BEGIN
  -- 1. Check for any table in public schema where RLS is disabled
  SELECT COUNT(*), string_agg(tablename, ', ')
  INTO unprotected_count, unprotected_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = false;

  SELECT COUNT(*) INTO total_tables FROM pg_tables WHERE schemaname = 'public';
  SELECT COUNT(*) INTO rls_tables FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;

  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'Bingooo RLS Audit: % of % tables have Row Level Security enabled.', rls_tables, total_tables;
  RAISE NOTICE '=======================================================';

  IF unprotected_count > 0 THEN
    RAISE EXCEPTION 'RLS AUDIT FAILED: The following public tables DO NOT have RLS enabled: %', unprotected_tables;
  ELSE
    RAISE NOTICE 'SUCCESS: 100%% of tables in public schema have Row Level Security enforced.';
  END IF;
END;
$$;

-- 2. Display summary table of all public tables and their active policies
SELECT 
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced,
  COUNT(p.polname) AS total_policies,
  COALESCE(string_agg(p.polname, ', ' ORDER BY p.polname), '(default deny)') AS active_policies
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
ORDER BY c.relname;

-- 3. Verify Helper Functions
SELECT 
  proname AS function_name,
  prosecdef AS is_security_definer,
  provolatile AS volatility
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND proname IN ('is_admin', 'is_staff', 'has_permission');

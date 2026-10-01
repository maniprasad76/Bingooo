-- ================================================================
-- Bingooo E-Commerce — Durable application record store
-- Migration 004: source of truth for the API's in-memory store
-- ================================================================
-- The API keeps its working set in memory and writes every changed
-- record here (one row per record, keyed by collection + id). On boot
-- it loads this table back, so restarts and redeploys lose nothing.
--
-- Run once in the Supabase SQL editor before deploying with
-- DATA_STORE=supabase. Safe to re-run.

CREATE TABLE IF NOT EXISTS public.app_records (
  collection TEXT        NOT NULL,
  id         TEXT        NOT NULL,
  data       JSONB       NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS app_records_collection_idx
  ON public.app_records (collection);

-- Contains password hashes, addresses and orders: only the backend's
-- service-role key may touch it. RLS on + no policies = anon and
-- authenticated clients are denied; service_role bypasses RLS.
ALTER TABLE public.app_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_records FROM anon, authenticated;

import { Logger } from '@nestjs/common';

/**
 * The storefront prerenders a crawlable HTML page per product and category at
 * build time (apps/frontend/scripts/prerender-seo.mjs), along with the sitemap,
 * llms.txt and the Google Merchant feed. When the catalog changes in the admin
 * panel, this asks Vercel to rebuild so new and edited products show up for
 * search engines and AI crawlers.
 *
 * Set VERCEL_DEPLOY_HOOK_URL to a Vercel Deploy Hook for the storefront project.
 * Edits are batched: the first change starts a short timer and everything
 * changed until it fires goes out in one rebuild.
 */
const REBUILD_DELAY_MS = 5 * 60 * 1000;
const logger = new Logger('StorefrontRebuild');
let pending: NodeJS.Timeout | null = null;

export function requestStorefrontRebuild(): void {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL?.trim();
  if (!hookUrl || process.env.NODE_ENV === 'test' || pending) return;

  pending = setTimeout(async () => {
    pending = null;
    try {
      const res = await fetch(hookUrl, { method: 'POST', signal: AbortSignal.timeout(15_000) });
      if (res.ok) logger.log('Catalog changed: storefront rebuild requested.');
      else logger.warn(`Storefront rebuild request failed (HTTP ${res.status}).`);
    } catch (err) {
      logger.warn(`Storefront rebuild request failed: ${(err as Error).message}`);
    }
  }, REBUILD_DELAY_MS);
  pending.unref?.();
}

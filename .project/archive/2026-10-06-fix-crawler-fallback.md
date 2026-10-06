# PLAN: Fix Unstyled Crawler Fallback & Stale Cache Flash Issue

> **Milestone / Issue:** Resolve persistent display of raw unstyled crawler fallback HTML and prevent FOUC / stale cache locks.
> **Date:** October 2026
> **Stack:** React 19 + Vite 8 (`apps/frontend`), Service Worker PWA (`public/sw.js`), Pre-render SEO (`scripts/prerender-seo.mjs`)

---

## 1. Root Cause Analysis
1. **Raw HTML in `#root`:** `apps/frontend/index.html` has ~120 lines of unstyled, raw crawler fallback HTML directly inside `<div id="root">` with inline styles (`font-family: sans-serif`, `border: 1px solid #ddd`).
2. **Flash of Unstyled Content (FOUC):** Whenever any user opens or refreshes the website, the browser parses and displays this raw HTML immediately before the ~476 KB JavaScript bundle finishes loading and mounting React.
3. **Stale Cache / Chunk Lock:** In `public/sw.js`, `index.html` was cached under `bingooo-cache-v2`. If an older `index.html` references an outdated JS hash that 404s, React never mounts, permanently trapping users on this raw fallback view.
4. **Pre-render Route Flashing:** `scripts/prerender-seo.mjs` injected unstyled route HTML directly into `<div id="root">` for static routes (`/shop`, `/category/*`), causing similar flashing on direct route navigation.

---

## 2. Target Files & Detailed Changes

### File 1: `apps/frontend/index.html`
- **Action:**
  1. Remove all unstyled wireframe HTML from `<div id="root">`.
  2. Inside `<div id="root">`, add an ultra-lightweight, luxury Bingooo splash loader styled with brand tokens:
     - Background: `#111111` (dark charcoal matching brand)
     - Typography: `BINGOOO.` with signal red dot `#E6321C`
     - CSS animation: subtle loading bar / pulse that runs instantly with 0ms delay.
  3. Wrap the SEO crawler text, category links, and FAQ schema text inside `<noscript>` tags.
     - Browsers with JS enabled: `<noscript>` is ignored by default (never painted).
     - Crawlers & non-JS clients: parse the full text, links, and content cleanly.

### File 2: `apps/frontend/scripts/prerender-seo.mjs`
- **Action:**
  1. Modify line 306-326 where `routeFallback` is injected.
  2. Instead of replacing the `#root` inner HTML with raw visible text, wrap `routeFallback` inside `<noscript>` or keep `#root` clean while appending `<noscript>${routeFallback}</noscript>` to the body.
  3. Maintain full SEO metadata, JSON-LD schemas, Title, and Meta description tags.

### File 3: `apps/frontend/public/sw.js`
- **Action:**
  1. Bump `CACHE_NAME` to `'bingooo-cache-v3'`.
  2. In the `activate` event listener, purge all outdated caches (`bingooo-cache-v1`, `bingooo-cache-v2`).
  3. Ensure navigation requests fetch the latest network copy and do not lock users into broken script hashes.

### File 4: `apps/frontend/src/lib/sw/registerServiceWorker.ts`
- **Action:**
  1. Enhance Service Worker controller change handling so that when a new worker activates, the page updates cleanly.
  2. Add an unhandled module script error fallback: if a dynamic script import fails due to a stale deploy hash, automatically bypass service worker cache and reload.

---

## 3. Verification & Acceptance Criteria
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run build:frontend` completes successfully, generating static routes.
- [ ] Playwright test confirms:
  - No raw unstyled text or 1990s wireframe appears on first paint.
  - `#root` renders cleanly and mounts the full React application seamlessly.
- [ ] Knowledge graph updated via `python -m graphify update .`.

---

## 4. Risks & Mitigations
- **Risk:** Search engines losing crawlable keywords.
  - **Mitigation:** Full keyword text, links, and FAQ are preserved in `<noscript>`, plus `<head>` JSON-LD `WebSite`, `Organization`, `FAQPage`, and OpenGraph tags remain 100% intact.
- **Risk:** Existing users having stale service worker cache in their browsers.
  - **Mitigation:** Bumping cache name to `bingooo-cache-v3` forces eviction of `bingooo-cache-v2` upon next visit.

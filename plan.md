# Plan: Configure Exact Google Maps Location & Coordinates Across Bingooo

> **Target Location URL:** `https://maps.app.goo.gl/nF4caczxyNgZME5c9`  
> **Resolved Coordinates:** `18.296284, 83.868952`  
> **Destination:** Bingooo Men's Wear Flagship Atelier, 7 Roads Junction, Main Road, Srikakulam, Andhra Pradesh 532001

---

## 1. Files to Modify

1. **`apps/frontend/src/lib/seo/catalog-seo.mjs`**
   - Update `GOOGLE_MAPS_STORE_URL` to `'https://maps.app.goo.gl/nF4caczxyNgZME5c9'`.
   - Update `GOOGLE_MAPS_DIRECTIONS_URL` to `'https://www.google.com/maps/dir/?api=1&destination=18.296284,83.868952'`.
   - Update `GOOGLE_MAPS_EMBED_URL` to `'https://maps.google.com/maps?q=18.296284,83.868952+(Bingooo%20Menswear%20Flagship%20Atelier)&t=&z=16&ie=UTF8&iwloc=B&output=embed'`.
   - Update `GOOGLE_REVIEW_URL` to `'https://maps.app.goo.gl/nF4caczxyNgZME5c9'`.
   - Update `localBusinessSchema()` geo coordinates: `latitude: '18.296284'`, `longitude: '83.868952'`.
   - Ensure `hasMap` and `sameAs` reflect `GOOGLE_MAPS_STORE_URL`.

2. **`apps/frontend/src/lib/seo/schema.ts`**
   - Update `generateOrganizationSchema()` geo coordinates: `latitude: '18.296284'`, `longitude: '83.868952'`.
   - Add `hasMap: GOOGLE_MAPS_STORE_URL` and append `GOOGLE_MAPS_STORE_URL` to `sameAs`.

3. **`apps/frontend/src/lib/social.ts`**
   - Export `BINGOOO_MAPS_URL = 'https://maps.app.goo.gl/nF4caczxyNgZME5c9'` and `BINGOOO_GEO = { latitude: 18.296284, longitude: 83.868952 }`.

4. **`apps/frontend/index.html`**
   - Update `<meta name="geo.position" content="18.296284;83.868952" />`.
   - Update `<meta name="ICBM" content="18.296284, 83.868952" />`.
   - In pre-rendered JSON-LD schema, update `geo.latitude` to `'18.296284'`, `geo.longitude` to `'83.868952'`.
   - In pre-rendered JSON-LD schema, update `hasMap` and `sameAs` to `'https://maps.app.goo.gl/nF4caczxyNgZME5c9'`.

5. **`apps/frontend/src/pages/ContactPage.tsx`**
   - Update GPS text badge from `18.2969° N, 83.8968° E` to `18.296284° N, 83.868952° E`.

6. **`BRAIN.md`**
   - Update documentation notes with exact coordinates and store map link.

---

## 2. Verification

- Run `npm run typecheck` to confirm zero TypeScript errors across all packages and workspaces.
- Check build of frontend (`npm run build` or targeted vite build).
- Re-index graph with `python -m graphify update .`.

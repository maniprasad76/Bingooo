# Plan: JavaScript Code Quality & Lint Cleanup

## 1. Objective
Eliminate code warnings, unused variables, unpreserved memoization, and cascading `useEffect` state calls flagged by Oxlint/ESLint across the monorepo:
1. Remove unused Lucide React icon imports from `DashboardPage.tsx`.
2. Remove dead constant `STATUS_BADGES` from `ReturnsPage.tsx`.
3. Guard asynchronous default address initialization in `CheckoutPage.tsx` using a ref guard to eliminate cascading render warnings.
4. Hoist static keyword mappings outside of `useMemo` in `ProductPage.tsx` to preserve React compiler memoization.
5. Verify clean build and linting with `npm run lint` and `npm run typecheck`.

---

## 2. File-by-File Changes

### 2.1 Admin Dashboard Unused Imports
- **File:** `apps/admin/src/pages/DashboardPage.tsx`
  - Remove unused imports: `AlertTriangle`, `Sparkles`, `Sliders`.

### 2.2 Admin Returns Page Dead Variable
- **File:** `apps/admin/src/pages/ReturnsPage.tsx`
  - Remove unused dictionary `STATUS_BADGES`.

### 2.3 Storefront Checkout Cascading State
- **File:** `apps/frontend/src/pages/CheckoutPage.tsx`
  - Add `hasAppliedDefaultAddress = useRef(false)` to prevent synchronous `setSelectedAddressId` and `setValue` calls on subsequent renders once default address is initialized.

### 2.4 Storefront Product Page Memoization
- **File:** `apps/frontend/src/pages/ProductPage.tsx`
  - Hoist `COLOR_KEYWORD_MAP` constant out of component render scope so `useMemo` remains pure and preserved.

---

## 3. Execution Sequence
1. **Step 1:** Clean unused imports in `apps/admin/src/pages/DashboardPage.tsx`.
2. **Step 2:** Clean dead `STATUS_BADGES` in `apps/admin/src/pages/ReturnsPage.tsx`.
3. **Step 3:** Optimize address initialization effect in `apps/frontend/src/pages/CheckoutPage.tsx`.
4. **Step 4:** Hoist `COLOR_KEYWORD_MAP` in `apps/frontend/src/pages/ProductPage.tsx`.
5. **Step 5:** Run `npm run lint` to verify reduced warnings and zero errors.
6. **Step 6:** Run `npm run typecheck` to verify type integrity.
7. **Step 7:** Run `python -m graphify update .` to sync knowledge graph.

---

## 4. Verification Checklist
- [ ] `apps/admin/src/pages/DashboardPage.tsx` has no unused imports.
- [ ] `apps/admin/src/pages/ReturnsPage.tsx` has no unused constants.
- [ ] `CheckoutPage.tsx` address initialization runs safely without cascading renders.
- [ ] `ProductPage.tsx` preserves memoization.
- [ ] `npm run lint` and `npm run typecheck` pass cleanly.

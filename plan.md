# Plan: Real Customer Reviews & Native Android Release Packaging

## 1. Objective
1. **Real Reviews Only**: Completely remove all hardcoded, fake, or mock reviews and static percentages (`* 42`, hardcoded 4.8 rating, static `REVIEWS_DATA`). Implement authentic verified buyer check (user must have placed an order for the product) and an interactive slide-out review submission drawer with 1-5 stars, fit feedback, and client-compressed photo uploads.
2. **Native Android Release Packaging**: Sync, audit, and package the Capacitor 8 Android shell, ensuring icons, splash screens, tactile haptics, and offline service worker assets are in place.

---

## 2. Changes Breakdown

### Phase A: Backend Real Reviews & Verified Buyer Enforcement (`apps/backend`)
- **`apps/backend/src/reviews/dto/review.dto.ts`**:
  - Add `fitFeedback?: 'runs_small' | 'true_to_size' | 'runs_large'` to `CreateReviewDto`.
- **`apps/backend/src/reviews/reviews.service.ts`**:
  - `checkEligibility(productId: string, userId?: string)`: Checks if the user has an existing order containing the product (matching `product_id` or variant).
  - `createReview()`: Validates purchase history. If the user has not ordered the product, reject with HTTP 403 `PURCHASE_REQUIRED` (with an admin bypass for testing/moderation). Stores `fit_feedback`, `image_url`, and sets `verified_buyer: true`.
  - `findByProduct()`: Calculates real average rating, real rating distribution, and real fit feedback breakdown from genuine database entries.
- **`apps/backend/src/reviews/reviews.controller.ts`**:
  - Add `@Get('eligibility')` endpoint: `checkEligibility(@Query('productId') productId, @Req() req)`.
- **`apps/backend/test/run-admin-e2e.ts`**:
  - Ensure test creates a test order or uses verified customer so review moderation tests continue to pass seamlessly.

### Phase B: Frontend Real Reviews Section & Interactive Drawer (`apps/frontend`)
- **`apps/frontend/src/pages/ProductPage.tsx`**:
  - Remove `REVIEWS_DATA` mock array and hardcoded metrics (`4.8`, `* 42 reviews`, static 78% bars).
  - Add query hook to load live reviews from `/api/v1/reviews/product/:id`.
  - Add honest Zero-State UI when 0 reviews exist ("No reviews yet for this garment. Be the first verified buyer to leave a review.").
  - Add verified buyer check and state for the review drawer.
  - Build the slide-out **Review Submission Drawer**:
    - Star Rating Selector (1 to 5 interactive stars with hover).
    - Fit Feedback Selector: 3 pills (`Runs Small` | `True to Size` | `Runs Large`).
    - Review Headline & detailed experience textarea.
    - Client-side Photo Compression: Image upload component that uses an off-screen HTML5 `<canvas>` to compress images to max 1000px WebP/JPEG under 200KB before submission.
    - Verified Buyer Badge indicator.
  - Review Card Component: Displays customer name/initials, "✓ Verified Buyer" badge in emerald green, star rating, fit tag, date, and attached photos with click-to-zoom modal.

### Phase C: Native Android Packaging (Capacitor 8)
- Audit `apps/frontend/capacitor.config.ts` and `apps/frontend/android`.
- Run `npm run android:sync` (`cap sync android`) to copy the latest production web assets (`dist/`) and plugins into `android/app/src/main/assets/public`.
- Verify Android app build configurations, status bar colors (`#171717`), splash screens, and offline caching.

---

## 3. Verification & Acceptance Criteria
- [ ] No hardcoded fake reviews exist anywhere in `ProductPage.tsx`.
- [ ] Verified buyers can submit real reviews with stars, fit, text, and photos.
- [ ] Unverified users are informed they must purchase before reviewing.
- [ ] `npm run typecheck` passes with zero errors across all workspaces.
- [ ] Backend test suites (`npm run test:checkout` and `npm run test:security`) pass.
- [ ] Android sync completes successfully.

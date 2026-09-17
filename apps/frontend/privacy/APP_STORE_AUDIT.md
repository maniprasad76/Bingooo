# Bingooo App Store & Play Store Compliance & Production Hardening Audit

**Date:** September 15, 2026  
**Applicable Guidelines:** Apple App Store Review Guidelines, Google Play Developer Program Policies, Digital Personal Data Protection Act (DPDPA 2023).

---

## 1. Crash Risks & Runtime Resilience
- **Root Error Boundary**: Implemented [`GlobalErrorBoundary.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/components/common/GlobalErrorBoundary.tsx) wrapping `<App />` at root level. Prevents white-screen application crashes by catching unexpected React render errors and presenting a luxury branded recovery interface with "Reload Studio" and "Reset to Home" actions.
- **Route-Level Boundaries**: All lazy-loaded routes are protected by [`RouteErrorBoundary.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/components/common/RouteErrorBoundary.tsx).
- **Native Bridge Resilience**: [`capacitorBridge.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/lib/native/capacitorBridge.ts) verifies platform availability via `Capacitor.isPluginAvailable()` and wraps all native hardware calls (Haptics, StatusBar, SplashScreen, App BackButton) in isolated `try/catch` blocks.
- **Network Security Configuration**: Updated [`capacitor.config.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/capacitor.config.ts) to enforce `cleartext: false` and `allowMixedContent: false`, eliminating insecure network traffic crashes on modern Android 13+ and iOS ATS environments.

---

## 2. In-App Account Deletion (Apple Guideline 5.1.1(v) & Google Play)
- **Store Requirement**: Any app supporting account registration must provide an intuitive, in-app mechanism for users to delete their account and associated personal data.
- **Backend Implementation**: Added `@Delete('profile')` endpoint in [`users.controller.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/users/users.controller.ts) calling `usersService.deleteAccount(userId)`.
  - Removes user account record and credentials.
  - Purges all saved shipping addresses, active carts, and wishlist records.
  - Anonymizes customer identifiers on past order records (retaining transaction amounts for statutory tax, GST, and accounting compliance).
- **Frontend Implementation**: Added a prominent **Danger Zone: Delete Account** card under Account Settings in [`AccountPage.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/AccountPage.tsx), featuring a modal confirmation dialog that performs the deletion, logs out, and cleans up local caches.
- **Legal Transparency**: Documented in [`PrivacyPolicyPage.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/PrivacyPolicyPage.tsx) Clause 05.

---

## 3. Private APIs & Disallowed Native Selectors
- **Audit Findings**: Zero private APIs, undocumented selectors, or non-standard runtime symbols (`objc_msgSend`, `_webkit`, dynamic symbol lookup) exist in the codebase.
- **Standards Compliance**: All client-server interactions use standard `fetch` via Axios/API client, standard Web APIs, and official Capacitor core plugins (`@capacitor/app`, `@capacitor/haptics`, `@capacitor/status-bar`, `@capacitor/splash-screen`).

---

## 4. App Purchase Audit & Physical Goods Classification
- **Store Requirement**: Apple Review Guideline 3.1.5(a) requires apps facilitating the sale of physical goods or services consumed outside the app to use external payment processors rather than Apple In-App Purchase (IAP).
- **Compliance Status**: Fully Compliant.
  - All items sold on Bingooo are **physical apparel** (heavyweight 240–420 GSM cotton t-shirts, hoodies, cargo pants) manufactured and shipped to the customer's physical delivery address across India.
  - Transactions use external payment gateway (Razorpay) supporting UPI, Debit/Credit Cards, Net Banking, and Cash on Delivery (COD).
  - Digital goods or digital unlockables are not sold within the app.

---

## 5. Apple Privacy Manifest (`PrivacyInfo.xcprivacy`)
- **Store Requirement**: Apple mandates a privacy manifest plist file declaring data types collected and required reason APIs used.
- **Implementation**: Created [`PrivacyInfo.xcprivacy`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/privacy/PrivacyInfo.xcprivacy) with:
  - `NSPrivacyTracking`: `false` (Bingooo never tracks users across third-party apps or websites).
  - `NSPrivacyTrackingDomains`: `[]`.
  - **Collected Data Types**:
    - `NSPrivacyCollectedDataTypeName`: App Functionality, Linked to User.
    - `NSPrivacyCollectedDataTypeEmailAddress`: App Functionality, Linked to User.
    - `NSPrivacyCollectedDataTypePhoneNumber`: Courier SMS & Order Status, Linked to User.
    - `NSPrivacyCollectedDataTypePhysicalAddress`: Physical Courier Delivery, Linked to User.
    - `NSPrivacyCollectedDataTypeUserID`: Session Authentication, Linked to User.
    - `NSPrivacyCollectedDataTypePurchaseHistory`: Order Invoicing & Tax Compliance, Linked to User.
  - **Required Reason APIs**:
    - `NSPrivacyAccessedAPICategoryUserDefaults`: Reason `CA92.1` (Accessing preferences and cached session data within the app).

---

## 6. Removal of Placeholder Content
- Cleaned up [`index.html`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/index.html), removing `REPLACE_WITH_YOUR_VERIFICATION_TOKEN`.
- Verified that all product titles, descriptions, sizing charts, and images represent authentic, high-resolution Bingooo apparel.
- Zero "Lorem Ipsum" or unformatted mock text exists in user-facing views.

---

## 7. Purchase & Order Restoration
- **Feature**: Added **"SYNC & RESTORE ORDERS"** button in [`AccountPage.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/AccountPage.tsx) under the Orders Archive tab.
- **Functionality**: Triggers real-time synchronization between the remote backend order repository and the local client state with haptic feedback and confirmation toast notifications.

---

## 8. Removal of Debug Features in Production
- **Vite Configuration**: Configured `esbuild: { drop: mode === 'production' ? ['console', 'debugger'] : [] }` in [`vite.config.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/vite.config.ts).
- **Result**: All `console.log`, `console.info`, `console.debug`, and `debugger` statements are stripped during production bundle compilation.

---

## 9. Data Collection & Safety Disclosure
- All data collection matches the disclosures in [`PrivacyPolicyPage.tsx`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/pages/PrivacyPolicyPage.tsx).
- No data is sold to third parties, advertising brokers, or data aggregators.
- End-to-end HTTPS/TLS encryption across all client-server communications.

---

## 10. User Entitlement & IDOR Validation
- **Broken Object Level Authorization (BOLA/IDOR) Protection**:
  - `orders.controller.ts`: Strict ownership verification ensures `order.user_id === req.user.id || isPrivileged`.
  - `users.controller.ts`: Profile and address operations are locked to `req.user.id`.
  - `returns.controller.ts`: Return creation and retrieval are bound to authenticated `req.user.id`.
  - `wishlist.controller.ts`: Wishlist operations are scoped to caller's verified token subject.
  - `cart.controller.ts`: Validates token subject or guest session ID; ignores untrusted client parameters.

---

## 11. Minimal Permissions & Permissions Rationale
- **Android Manifest**: [`AndroidManifest.xml`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/android/app/src/main/AndroidManifest.xml) requests only minimal, normal-level permissions:
  - `android.permission.INTERNET`: Required for accessing the product catalog and API.
  - `android.permission.VIBRATE`: Required for tactile haptic feedback on garment buttons.
- No sensitive or dangerous permissions (`CAMERA`, `READ_CONTACTS`, `ACCESS_FINE_LOCATION`, `READ_MEDIA_IMAGES`) are requested or retained in manifest. File uploads use standard system document picker.

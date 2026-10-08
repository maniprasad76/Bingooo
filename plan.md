# PLAN: BlanqFactory-Inspired Bespoke Customizer Page

> **Goal:** Transform `apps/frontend/src/pages/CustomizerPage.tsx` into a high-converting, manufacturer-grade customizer inspired by [Blanq Factory](https://www.blanqfactory.com/products/180gsm-honeycomb-matty-polo-t-shirt-manufacturer-india) while adhering strictly to Bingooo's design tokens and retaining the interactive canvas drag, size increase/decrease controls, and thumbnail previews.

---

## 1. Analysis of Blanq Factory Page & User Requirements

### Core Elements on Blanq Factory:
1. **Garment Mockup (Left Side)**:
   - Clean garment canvas with Front/Back views.
   - Thumbnail colorway gallery directly beneath the main preview.
   - Interactive canvas drag for artwork placement.
2. **Product Header & Trust Signals (Right Side)**:
   - Product title with GSM callout (e.g., `240 GSM Drop-Shoulder Oversized Cotton T-Shirt | Atelier Blanks`).
   - Price range banner & stock status pill (`In Stock - Ready to Dispatch`).
   - 4 trust badges: `100% Cotton`, `Fast Dispatch`, `Secure Order`, `Bulk Expert`.
   - Pincode delivery estimator with interactive check input.
3. **Colour / Size Matrix Grid**:
   - A multi-quantity matrix table allowing customers to order 1 custom piece or specify quantity breakdowns across sizes (`S`, `M`, `L`, `XL`, `2XL`) and colors.
   - Dynamic total piece counter and live subtotal calculator.
4. **Print Technique & Branding Options**:
   - Technique selector dropdown: `HD DTF Print (Free)`, `Puff Screen Print (3D Raised)`, `Screen Print`.
   - Dedicated slots for:
     - 👕 Front Design (.PNG)
     - 🔙 Back Design (.PNG)
     - 📍 Chest Logo (.PNG)
     - 🏷️ Neck Label (.PNG)
     - 🧼 Wash Care Tag (.PNG)
   - **User requirement**: Instead of static links, each slot displays a visual thumbnail preview, live size slider (`–` / `+` micro-buttons), scale presets (`Compact`, `Standard`, `Oversized`), and real-time garment canvas drag.
5. **Packaging Selector**:
   - `Standard Clear Polybag (Free)` vs `Bingooo Frosted Matte Zip-Lock Bag (Free)`.
6. **Order Pricing Summary & Dual Actions**:
   - Transparent price breakdown: Total Pieces, Subtotal, Delivery (Free), 5% GST, Grand Total.
   - Dual action buttons: `🛍️ Add to Bag / Checkout` and `💬 Order on WhatsApp` (with automatic formatted message containing all artwork placements, sizes, and colors).
7. **Key Specifications Table**:
   - Comprehensive technical garment attributes table: Sizes, Colors, MOQ, Fabric, GSM, Fit Type, Print Tech, Country of Origin.

---

## 2. Invariants & Scope Rules
- **Rule 1**: Only touch `apps/frontend/src/pages/CustomizerPage.tsx`. Do NOT touch any other file.
- **Rule 2**: Strict adherence to Bingooo design tokens (`#F7EEDB` warm cream, `#171717` charcoal, `#E6321C` signal red, Manrope font, Lucide icons).
- **Rule 3**: Zero TypeScript errors (`npm run typecheck`).
- **Rule 4**: Keep existing features intact: 3D WebGL viewer toggle, custom text mode, and wishlist saving.

---

## 3. Implementation Steps in `CustomizerPage.tsx`

1. **State Enhancements**:
   - `sizeMatrix`: Quantities per color and size (`Record<string, Record<string, number>>`).
   - `selectedPrintTechnique`: `'dtf' | 'puff' | 'screen'`.
   - `selectedPackaging`: `'polybag' | 'ziplock'`.
   - `pincodeInput` & `pincodeDeliveryStatus`: Estimated delivery days.
   - Artwork slots: Support `front`, `back`, `chest`, `neckLabel`, `washCare`.
   - Sliders & motion values for each artwork placement.
2. **Left Column (Preview & Thumbnails)**:
   - Sticky desktop viewport container with 2D Canvas / 3D Viewer toggle.
   - Interactive draggable artwork with selection badges.
   - Swatch / thumbnail selector row below the garment canvas for switching colors and views.
3. **Right Column (BlanqFactory Structure)**:
   - Title, GSM badge, price banner, trust badges.
   - Pincode delivery checker.
   - Color / Size matrix table with stepper buttons and direct number inputs.
   - Print technique dropdown selector.
   - Custom branding section with interactive thumbnail cards, size sliders, and canvas drag indicators.
   - Packaging selector.
   - Live order total calculation card.
   - Dual action buttons: `Add to Bag` + `Order on WhatsApp`.
4. **Key Specifications Table**:
   - Clean, high-contrast specs table at the bottom of the page detailing 240 GSM loopknit cotton, DTF printing, oversized boxy fit, and Indian manufacturing heritage.
5. **Verification**:
   - Run `npm run typecheck`.
   - Browser subagent verification of matrix table, artwork upload, size sliders, canvas drag, and responsive layout.

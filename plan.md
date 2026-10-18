# Plan: Dual-Sided (Front & Back) Artwork Upload Experience

## 1. Overview
In the Bingooo Studio customizer (`apps/frontend/src/pages/CustomizerPage.tsx`), users currently interact with artwork placement through a 3-tab selector (`CENTER`, `LEFT CHEST`, `BACK`), which presents only one single file input dropzone at any given time. Users frequently upload only one side (usually Front Center) and miss the fact that back-side printing is supported, with no prompt asking them if they need a back design.

This feature re-engineers Step 03 of the Customizer into an intuitive dual-sided experience:
- Dedicated, clearly distinct **Front Side** and **Back Side** artwork upload cards.
- Smooth automatic camera/mockup flipping between **FRONT** and **BACK** when interacting with each side.
- Proactive **"Add Back Design?"** Bauhaus prompt modal when the user requests a quote with only one side configured, giving them an effortless opportunity to upload back artwork or proceed with front-only.
- Comprehensive quotation payload reflecting both sides accurately.

---

## 2. Target Files & Key Modifications

### Primary File: `apps/frontend/src/pages/CustomizerPage.tsx`
1. **State Management**:
   - Keep `artworks` record (`center`, `left_chest`, `back`).
   - Add `frontPlacement` selector state (`'center' | 'left_chest'`, default `'center'`).
   - Add `activeUploadSide` state (`'front' | 'back'`) for drag-and-drop and file input targets.
   - Separate file inputs / triggers for Front and Back artwork: `frontFileInputRef` and `backFileInputRef`.
   - Add `showBackPromptModal` state to prompt the user if they request a quote with only Front (or only Back) artwork.

2. **File Handling**:
   - Support uploading directly to `front` (to whichever of `center` or `left_chest` is chosen) and `back`.
   - Transparent PNG validation, 20MB limit check, scale sliders (60% to 140%), and artwork removal per side.
   - Auto-switching `currentView`:
     - Clicking/uploading Front switches view to `'FRONT'`.
     - Clicking/uploading Back switches view to `'BACK'`.

3. **Step 03 Bauhaus UI Redesign**:
   - Header with dual status indicators: `FRONT: [✓ Center | ✓ Chest | Empty]` and `BACK: [✓ Uploaded | Empty]`.
   - **Front Side Card**:
     - Placement toggle: `CENTER` vs `LEFT CHEST`.
     - Upload Dropzone / Active Artwork preview with scale slider, file metadata, and remove button.
   - **Back Side Card**:
     - Status: `BACK PRINT (OPTIONAL)`.
     - Upload Dropzone / Active Artwork preview with scale slider, file metadata, and remove button.
     - Welcoming empty state asking: *"Want to add a design on the back too? Click or drag transparent PNG here"*.

4. **Quote Pre-Flight Check & Confirmation Modal**:
   - When the user clicks **"GET WHATSAPP QUOTE"**:
     - If both Front and Back have artwork, or if user explicitly skipped: proceed directly to WhatsApp.
     - If ONLY Front is uploaded (or ONLY Back): open a Bauhaus confirmation modal:
       - *"Would you like to add back printing as well?"*
       - Button 1: **"+ Yes, Add Back Design"** -> scrolls to Back upload card, flips preview to BACK, focuses back dropzone.
       - Button 2: **"Continue with Front Only"** -> proceeds directly to WhatsApp.
     - If neither side has artwork: friendly toast reminding them to add a design, or continue with blank garment.

5. **WhatsApp Message Generation**:
   - Accurately details Front Artwork (Center or Left Chest), Back Artwork, garment fit, color, and size.

---

## 3. Invariants & Design Token Consistency
- **Colors**: Strictly `#F7EEDB` (Warm Cream), `#171717` (Charcoal), `#E6321C` (Signal Red), and `#FFFFFF`.
- **Icons**: Lucide React only (`Upload`, `Check`, `X`, `Layers`, `MessageCircle`, `RotateCw`, etc.). No emojis.
- **Typography**: Manrope font styling with uppercase tracking.
- **Haptics**: Use `triggerHaptic('selection')` or `triggerHaptic('success')` on upload/switch.

---

## 4. Verification & Testing
- Typecheck passes across all workspaces: `npm run typecheck`.
- Manual/Visual flow validation:
  1. Upload Front image (Center) -> front mockup reflects artwork.
  2. Toggle to Left Chest -> artwork re-positions to Left Chest.
  3. Upload Back image -> garment view flips to Back, back artwork reflects on mockup.
  4. Scale adjustments work independently on Front and Back.
  5. Delete front artwork -> back remains intact, front resets.
  6. Click "GET WHATSAPP QUOTE" with front only -> modal appears asking if they want back artwork.
  7. Clicking "+ Yes, Add Back Design" switches to Back. Clicking "Continue with Front Only" opens WhatsApp.

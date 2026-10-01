---
phase: 3
plan: 1
wave: 1
gap_closure: false
---

# Plan 3.1: Real-Time 3D Garment Mockup Studio (Three.js)

## Objective
Implement an interactive, photorealistic 3D Garment Mockup Studio component (`Garment3DViewer.tsx`) alongside the existing 2D customizer canvas in `apps/frontend`. Users can toggle seamlessly between `2D Studio` and `3D Studio`, orbit 360° around their customized streetwear piece, view authentic fabric folds and studio lighting, and see their typography and artwork mapped onto the 3D garment mesh in real time.

## Context
- `.gsd/SPEC.md` (Luxury heavyweight streetwear vision, 2D/3D customizer goals)
- `.gsd/ROADMAP.md` (Phase 3: Production Hardening & Enhancement — Plan 3.1)
- `apps/frontend/src/pages/CustomizerPage.tsx` (Current 2D customizer canvas & state machine)
- `AGENTS.md` (Brand design tokens: `#F7EEDB`, `#171717`, `#E6321C`, Manrope font, Lucide icons)

## Tasks

<task type="auto">
  <name>Task 1: Create Three.js 3D Garment Mockup Component</name>
  <files>
    apps/frontend/src/components/studio/Garment3DViewer.tsx
    apps/frontend/src/components/studio/garmentMeshBuilder.ts
  </files>
  <action>
    Create a modular, high-performance Three.js 3D garment viewer:
    
    1. Create `apps/frontend/src/components/studio/garmentMeshBuilder.ts`:
       - Construct procedural 3D garment geometries with realistic streetwear silhouettes:
         - Boxy Oversized Tee (drop shoulders, wide chest, 240 GSM drape folds)
         - Classic Heavyweight Tee (tailored crewneck cut)
         - Double-Layered Hoodie (structural hood curve, kangaroo pouch pocket, ribbed hem)
       - Provide UV mapping coordinate generators specifically tailored for chest (front) and upper-back placement zones.
       - Include subtle cloth normal/bump procedural texture generator for combed cotton fabric weave.

    2. Create `apps/frontend/src/components/studio/Garment3DViewer.tsx`:
       - Initialize Three.js scene, `PerspectiveCamera`, `WebGLRenderer` with antialiasing and sRGB encoding.
       - Studio lighting setup:
         - Warm ambient fill (`#fbf8f2`, intensity 0.75)
         - Directional key light with soft shadow mapping (`#ffffff`, intensity 1.2)
         - Subtle rim/back light (`#E6321C` / `#ffffff` tint) highlighting shoulder contours and garment drape.
       - Dynamic Texture Projection:
         - Render an off-screen HTML5 canvas compositing the user's typography (font, weight, spacing, text color) or uploaded raster/vector artwork.
         - Convert canvas to `THREE.CanvasTexture` and apply as decal/map onto the garment's front or back printable area.
       - Silky mouse-drag / touch-drag 360° orbital rotation, zoom via wheel/pinch, and auto-rotation toggle ("Orbit Showcase").
       - Camera view snapping presets (Front View, Back View, 45° Hero Angle, Collar Close-Up).
       - Proper lifecycle cleanup: dispose geometries, materials, textures, and cancel animation loops on unmount.
    
    AVOID: Uncontrolled WebGL context recreation or memory leaks without dispose calls.
    USE: RequestAnimationFrame with smooth damping and ResizeObserver for responsive canvas scaling.
  </action>
  <verify>
    npm run typecheck --workspace=@bingooo/frontend
  </verify>
  <done>
    Garment3DViewer compiles with zero TypeScript errors and encapsulates full Three.js scene lifecycle.
  </done>
</task>

<task type="auto">
  <name>Task 2: Integrate 3D Studio Toggle & Controls into CustomizerPage</name>
  <files>
    apps/frontend/src/pages/CustomizerPage.tsx
  </files>
  <action>
    Integrate the 3D viewer seamlessly into `apps/frontend/src/pages/CustomizerPage.tsx`:
    
    1. Add `studioViewMode: '2D' | '3D'` state (defaulting to `'2D'`).
    2. Add a prominent, luxury streetwear toggle pill in the canvas header:
       - `[2D Studio | 3D Studio]` styled with brand tokens (`#171717`, `#F7EEDB`, `#E6321C`).
       - Tactile haptic feedback via `triggerHaptic('selection')` on switch.
    3. When `studioViewMode === '3D'`:
       - Render `<Garment3DViewer />` in the main canvas container with full responsive bounds.
       - Pass current reactive customizer state:
         - `garmentId`: selected garment silhouette (`'oversized' | 'tshirt' | 'hoodie'`)
         - `color`: `selectedColor.hex`
         - `customText`: text input
         - `fontFamily`: active font family
         - `textColor`: print color hex
         - `letterSpacing`, `isBold`, `isItalic`, `isUppercase`
         - `uploadedImage`: uploaded graphic URL/data
         - `viewSide`: front/back orientation
       - Display floating 3D control overlay:
         - "Auto Orbit" toggle with rotating icon
         - "Snap Front" and "Snap Back" buttons
         - 3D lighting atmosphere switcher (Atelier Studio, Cyber Street, Minimal White)
    4. Ensure immediate 2D fallback: Switching back to 2D retains exact position, coordinates, and customization state without re-render flicker.
  </action>
  <verify>
    npm run typecheck && npm run build:frontend
  </verify>
  <done>
    Both 2D canvas and 3D WebGL viewer render and switch seamlessly with live texture updates.
  </done>
</task>

<task type="auto">
  <name>Task 3: Verification & Invariant Audit</name>
  <files>
    apps/frontend/src/pages/CustomizerPage.tsx
    apps/frontend/src/components/studio/Garment3DViewer.tsx
  </files>
  <action>
    Audit implementation against architectural invariants:
    1. Verify zero off-palette colors (strict adherence to `#F7EEDB`, `#171717`, `#E6321C`).
    2. Verify Lucide React icons only (no unicode emojis in UI).
    3. Verify mobile touch haptics use `triggerHaptic()` from `capacitorBridge.ts`.
    4. Verify full typecheck passes across all workspaces (`npm run typecheck`).
    5. Update `.gsd/STATE.md`, `.gsd/ROADMAP.md`, and `.gsd/JOURNAL.md`.
  </action>
  <verify>
    npm run typecheck
  </verify>
  <done>
    All workspaces typecheck cleanly; 3D studio delivers responsive luxury streetwear showcase.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] 2D Studio and 3D Studio toggleable via sleek pill control on `CustomizerPage`
- [ ] 3D garment mesh adapts in real-time to selected garment silhouette (Oversized, T-Shirt, Hoodie) and colorway
- [ ] Custom typography and uploaded artwork are projected as dynamic canvas textures onto the 3D garment surface
- [ ] Interactive 360° orbit rotation, zoom, auto-spin showcase, and front/back snapping
- [ ] Clean WebGL memory management (zero leaks on unmount or toggle)
- [ ] Zero TypeScript errors across root and monorepo packages

## Success Criteria
- [ ] `npm run typecheck` exits with code 0 across all workspaces
- [ ] Production frontend build compiles cleanly (`npm run build:frontend`)
- [ ] Architectural invariants (tokens, icons, haptics) strictly preserved

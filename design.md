# BINGOOO — Design System Audit & AI Image Generation Guide

> **Source of truth audit** of `apps/frontend` (storefront) + `apps/admin`, extracted from:
> `apps/frontend/tailwind.config.js`, `apps/frontend/src/styles/index.css`, `apps/frontend/src/styles/theme.ts`,
> `apps/admin/tailwind.config.js`, `apps/admin/src/styles/index.css`, `apps/frontend/index.html`,
> and live components (`HomePage`, `Navbar`, `Footer`, `ProductCard`, `Button`, `Logo`, etc.)
>
> **Part A** = complete design audit. **Part B** = ready-to-paste prompts for AI image tools (Midjourney, DALL·E, Firefly, SDXL) to generate imagery that matches this exact design language.

---

# PART A — DESIGN SYSTEM AUDIT

## 1. Brand Overview

| Property | Value |
|---|---|
| Brand | **BINGOOO.** (wordmark ends with a red period) |
| Tagline | "WEAR WHAT DEFINES YOU." |
| Secondary motto | "CLOTHING · CUSTOM · CULTURE" |
| Category | Premium heavyweight menswear / Indian streetwear (240–420 GSM cotton) |
| Market | India (prices in ₹, Pan-India delivery, UPI-first) |
| Personality | Bold, confident, editorial-brutalist, warm-premium, streetwear-luxe |
| Design feel | **Warm cream paper + charcoal ink + one loud signal red.** Swiss-brutalist typography meets premium catalogue design. Flat, crisp, high-contrast. No soft pastel gradients, no neon, no glassy tech-startup look. |
| Stack | React 19 + Vite + Tailwind CSS 3.4, framer-motion (springs), GSAP, lucide-react icons, Capacitor Android app |

---

## 2. Color Palette (audited)

### 2.1 Core Brand Colors — use these in every generated image

| Token | Hex | Role / where it appears |
|---|---|---|
| **Brand Red** | `#E6321C` | THE signal color. Primary CTAs, logo dot, focus rings, links hover, selection highlight, active swatch rings, scarcity dots, red glow shadows. Roughly 5–10% of any screen. |
| **Deep Red** | `#B91F12` | Hover/pressed red, "Few Left" urgency text, footer hover accents |
| **Red Light** | `#FDF0EE` | Red-tinted badge/surface backgrounds |
| **Red Glow** | `rgba(230,50,28,0.25–0.45)` | Ambient glow shadows under red buttons |
| **Charcoal Ink** | `#171717` | Primary text, headings, black buttons, top-bar, footer, table headers. The "black" of the brand (never pure `#000` for surfaces — pure black only on `.btn-black:hover`) |
| **Paper Cream** | `#F7EEDB` | Page background everywhere. The dominant canvas (~60–70% of a screen) |
| **Beige** | `#EDE0CC` | Secondary surface: image placeholder wells, hover rows, rating tracks, product-card backdrop |
| **Bisque** | `#F5ECE1` | Tertiary warm surface |
| **Ivory** | `#FDF9F4` | Brightest warm surface |
| **Header Off-White** | `#FAF8F5` | Sticky navbar background (98% opacity + blur when scrolled) |
| **Stock Paper** | `#FAF6EE` | Stock/inset boxes on product page |
| **Muted** | `#6F6A63` | Body/secondary text, captions, table headers, meta labels |
| **Border** | `#DDD3C5` | 1px hairline borders, dividers, inputs, secondary-button outline |
| **White** | `#FFFFFF` | Cards, surfaces, text on dark |

### 2.2 Garment Swatch Palette (product colors)

| Swatch | Hex | Notes |
|---|---|---|
| Black | `#171717` | Signature tee color |
| White | `#FFFFFF` | Rendered with `#CCCCCC` edge border |
| Sand/Beige | `#D9CBB8` | Warm neutral garment |
| Stone Grey | `#77736D` | Hoodie body (hood: `#55524D`) |
| Red | `#E6321C` | Statement pieces |

### 2.3 Status Colors (semantic)

| Status | Base | Light bg |
|---|---|---|
| Success | `#238636` | `#F0FDF4` |
| Warning | `#B7791F` | `#FEFCE8` |
| Danger | `#C62828` | `#FEF2F2` |
| Info | `#2563A6` | `#EFF6FF` |

### 2.4 Dark-UI & FX Extras (used sparingly)

- Scrollbar: track `#121318`, thumb `#2E313D`, hover red
- Carbon `#1F1D1B`, Steel `#2B2825`, dark border `#2B2D38` (dark overlays/glass)
- Glass dark: `rgba(18,19,24,0.75)` + 16px blur; Glass light: `rgba(255,255,255,0.85)`
- Legacy/hot accent gradients: red `#FE260A → #FF6B4A`, gold `#FAD961 → #F76B1C`, lime glow `#D8FF00` (glow-border effect)

### 2.5 Ratio Rule (for AI image composition)

> `#F7EEDB` cream dominates → `#171717` charcoal for type/blocks → `#E6321C` red only as a deliberate accent (button, dot, underline, wordmark period) → `#EDE0CC`/`#DDD3C5` as warm mid-tones and hairlines.

---

## 4. Spacing, Layout & Grid (audited)

### 4.1 Base Unit & Scale

- Root font-size **16px**; Tailwind 4px base scale + custom extensions: `13 = 52px`, `15 = 60px`, `17 = 68px`, `18 = 72px`, `88 = 352px`, `128 = 512px`.
- Spacing rhythm in components: **4 / 6 / 8 / 12 / 16 / 20 / 24 / 32px** (Tailwind 1–8). Cards use tight internal gaps (4–8px); sections use large air (64–112px).

### 4.2 Containers (page width)

| Utility | Max width | Gutters |
|---|---|---|
| `.container-bingooo` (primary) | `min(100% − 48px, 1440px)` | 24px each side; **32px total on ≤800px** |
| `.container-page` | 1440px | `clamp(1rem, 4vw, 4rem)` |
| `.container-wide` | 1536px | `clamp(1rem, 4vw, 4rem)` |
| `.container-narrow` | 800px | `clamp(1rem, 3.5vw, 2.5rem)` |
| Tailwind `max-w-page` | 1280px | — |

### 4.3 Vertical Rhythm

- Section padding-block: **`clamp(2.5rem, 6vw, 7rem)`** (40→112px); small sections `clamp(1.75rem, 4vw, 4rem)`.
- Hero: `min-height: min(650px, 100vh − 104px)`, two-column split **43% copy / 57% visual**, copy padding 65–70px block.
- Hero headline margin-bottom 32px; eyebrow margin-bottom 28px.
- Navbar: 28px black utility top bar + main bar (total ≈ 104px), sticky, gains blur+shadow on scroll (threshold 20px).
- Button heights: **sm 32px · md 40px · lg 44px · xl 48–52px**; classic `.btn` min-height 48px, padding 0 24px.
- Product card: image well **aspect 4/5** (padded p-2/p-4), body p-3–4, price row separated by 1px border-top.
- Category tiles: `aspect 4/3` mobile, 90×110 / 120×120 desktop, on `#252525` wells.

### 4.4 Breakpoints

`xs 480px · sm 640px · md 768px · lg 1024px · xl 1280px · 2xl 1536px` (mobile-first; Android app via Capacitor, safe-area insets supported).

---

## 5. Shape, Radius & Borders (audited)

| Token | Value | Used on |
|---|---|---|
| `--radius-sm` | 6px | Small buttons, inputs (md) |
| `--radius-md` | 10px | lg buttons, inputs, logo tiles |
| `--radius-lg` | 16px | Modals, large cards |
| `rounded-card` | 8px (0.5rem) | Standard cards |
| `rounded-2xl` | 16px | **Product cards, hero panels** (most common card radius — 150+ usages) |
| `rounded-[8px/10px]` | 8–10px | Buttons md/lg/xl |
| `rounded-[2px]` | 2px | Squared icon chips (38×38 beige feature squares) — intentional brutalist accent |
| `rounded-full` | pill | Badges, swatches, dots, scrollbar |

**Border language:** hairline **1px solid `#DDD3C5`** (often `/60–80%` alpha) on white cards; 2px `#171717` for outline buttons; selected states use 2px black or red ring (`ring-1 ring-brand-red`); color swatch selection = 2px black ring with 3px cream inset.

---

## 6. Elevation & Shadows (audited)

Shadow philosophy: **very soft, low-opacity, neutral-black** — plus one signature **red glow** reserved for primary CTAs.

| Token | Value | Used on |
|---|---|---|
| `2xs` | `0 1px 1px rgba(0,0,0,0.03)` | Chips, secondary buttons |
| `xs` | `0 1px 2px rgba(0,0,0,0.05)` | Cards at rest, logo tiles |
| `soft` | `0 1px 3px rgba(0,0,0,0.04)` | Inputs |
| `card` | `0 2px 8px rgba(0,0,0,0.06)` | Product cards at rest |
| `card-hover` | `0 4px 16px rgba(0,0,0,0.1)` | Cards on hover |
| `elevated` | `0 8px 24px rgba(0,0,0,0.08)` | Modals, popovers |
| `drawer` | `0 -4px 24px rgba(0,0,0,0.1)` | Bottom sheets/drawers (upward shadow) |
| **Red glow (rest)** | `0 4px 14px rgba(230,50,28,0.28)` | Primary red buttons |
| **Red glow (hover)** | `0 6px 20–28px rgba(230,50,28,0.38–0.45)` | Primary red buttons hover |
| Black button | `0 4px 12px rgba(23,23,23,0.15)` → hover `0 6px 18px rgba(0,0,0,0.25)` | `.btn-black` |

Interaction elevation: cards lift via shadow + border darkens (`border-ink/25`) + image scales 1.05 (500–700ms ease-out) + optional 8° 3D tilt (`InteractiveTilt`).

---

## 3. Typography (audited)

### 3.1 Typefaces

| Role | Font | Weights | Usage |
|---|---|---|---|
| **Everything (UI + display)** | **Manrope** (Google Fonts) | 400, 500, 600, 700, 800 | Headings, body, buttons, prices, nav. Single-family system. |
| **Mono / spec text** | **IBM Plex Mono** | 400, 500 | GSM specs ("220 GSM"), swatch counters ("+2"), technical labels |
| Studio fonts (Customizer only) | Anton, Bebas Neue, Bungee, Caveat, Cinzel, Cormorant Garamond, Major Mono Display, Permanent Marker, Playfair Display, Prata, Righteous, Russo One, Space Grotesk, Syne | — | User-selectable fonts for custom garment designs — **not part of core UI** |

> **Manrope is the identity.** Geometric-humanist grotesque: clean, slightly rounded terminals, excellent heavy weights. AI "typography feel" = heavy Manrope-style uppercase grotesque.

### 3.2 Type Scale (actual values)

| Token / element | Size | Weight | Line-height | Tracking | Case |
|---|---|---|---|---|---|
| Hero H1 | `clamp(52px, 6.8vw, 96px)` | 800 | **0.84** | **−0.07em** | UPPERCASE |
| Section H2 (large) | `clamp(38–42px, 4.5–5vw, 64–72px)` | 800 | 0.88–0.9 | −0.06 to −0.065em | UPPERCASE |
| Section H2 (mid) | `clamp(30px, 4vw, 52px)` | 800 | — | −0.06em | UPPERCASE |
| Base `h1` | `clamp(2.5rem, 6vw, 5.5rem)` | 800 | 0.92 | −0.02em | UPPERCASE |
| Base `h2` | `clamp(1.75rem, 4vw, 2.5rem)` | 700 | 1.08 | +0.02em | UPPERCASE |
| Base `h3` | `clamp(1.25rem, 2.5vw, 1.75rem)` | 700 | 1.15 | +0.02em | UPPERCASE |
| Base `h4` | `clamp(0.95rem, 1.8vw, 1.25rem)` | 700 | 1.2 | +0.04em | UPPERCASE |
| Display XL | 3.25rem / 52px | 800 | 1.1 | — | — |
| Display LG | 2.25rem / 36px | 800 | 1.15 | — | — |
| Hero (tw) | 3.5rem / 56px | 800 | 1.1 | — | — |
| Page title | 2rem / 32px | 700 | 1.2 | — | — |
| Section | 1.5rem / 24px | 700 | 1.3 | — | — |
| Body | 1rem / 16px | 400 | 1.6 | 0 | Sentence case, `#6F6A63` |
| Body SM | 0.875rem / 14px | 400 | 1.5 | 0 | — |
| Caption | 0.8125rem / 13px | 500 | 1.5 | 0 | — |
| Button | 0.875rem / 14px (11–13px in practice) | 600–800 | 1 | +0.02–0.06em | UPPERCASE / tracking-wide |
| Price | 1.125rem / 18px | 700 | 1.3 | 0 | `#171717` |
| Price LG | 1.5rem / 24px | 700 | 1.2 | 0 | — |
| **Eyebrow** | 11px | 600 | 1.8 | **+0.22em** | UPPERCASE — brand signature above H1s |
| Top bar | 9px | 600 | — | +0.08em | UPPERCASE on `#171717` |
| Card meta | 9–10px | 600 | — | — | "220 GSM", "Essential • Few Left" |
| Footer wordmark | 31px+ | 800 | 1 | −0.07em | UPPERCASE white |
| Footer column head | 10px | 800 | — | +0.24em | UPPERCASE `#E6321C` |

### 3.3 Typography Rules

1. **All headings UPPERCASE, extrabold (800), very tight leading (0.84–1.1) and tight tracking (−0.05 to −0.07em)** — the "compressed poster headline" is the strongest brand signal.
2. Multi-line headlines are hard-broken into short stacked lines: `WEAR WHAT / DEFINES / YOU.` — final period in brand red.
3. Body text is quiet: 16px Manrope Regular in `#6F6A63` on cream.
4. Contrast pattern: huge black display type ↔ tiny tracked-out uppercase micro-labels (9–11px).
5. Prices always bold charcoal; compare-at price small, muted, strikethrough.

---

# PART B — AI IMAGE GENERATION GUIDE & READY PROMPTS

Use these prompt templates with **Midjourney (v6)**, **DALL·E 3**, **SDXL**, or **Adobe Firefly** to generate on-brand campaign and e-commerce imagery that blends seamlessly into the Bingooo storefront and design system.

---

## 7. Photography Art Direction & Mood

### 7.1 Key Visual Pillars
- **Palette Control**: The overall frame must be anchored in warm cream (`#F7EEDB`), soft architectural concrete, deep charcoal (`#171717`), and muted earthy stone tones. Any red (`#E6321C`) must be intentional and isolated (e.g. a red woven tag, an embroidery detail, or an architectural prop).
- **Subject & Fit**: South Asian and international male models, relaxed editorial postures, confident and unforced expressions. Garments must have visible weight: heavy 240–280 GSM cotton boxy tees that don't cling, 380–420 GSM structured fleece hoodies with deep hoods, and crisp utility trousers.
- **Lighting**: Soft diffused north-facing daylight or editorial studio softbox with gentle falloff. Natural warm shadows, zero harsh camera flashes, zero saturated neon colored rim-lights.
- **Camera Spec Style**: 50mm or 85mm prime lens, f/2.8 to f/4.0 aperture, medium depth of field with sharp textile weave in focus.

---

## 8. Ready-to-Paste AI Image Prompts

### 8.1 Hero Campaign / Lookbook Banner (16:9 or 21:9)
```text
Cinematic editorial streetwear campaign photo of a stylish South Asian male model wearing an oversized heavyweight boxy black 260 GSM combed cotton t-shirt with drop shoulders and charcoal utility cargo pants, standing in a minimalist warm cream architectural concrete atelier studio, soft natural directional daylight casting gentle warm shadows, neutral warm palette of cream, beige, and matte black with a subtle touch of crimson red detail, high-fashion magazine aesthetic, shot on 35mm Hasselblad, f/3.2, ultra-realistic cotton fabric texture, crisp details --ar 16:9 --style raw --v 6.0
```

### 8.2 Product Catalog / Ghost Mannequin / Padded Well (4:5)
```text
High-end commercial studio product photography of a premium 400 GSM heavyweight fleece hoodie in stone grey, laid out or on invisible mannequin, perfectly styled relaxed drop-shoulder silhouette, thick ribbed cuffs, deep double-lined hood, premium cotton grain and dense fleece weave visible under soft diffuse studio lighting, placed against a seamless warm cream paper background (#F7EEDB), clean minimal luxury menswear catalogue shot, 8k resolution, razor sharp focus --ar 4:5 --style raw --v 6.0
```

### 8.3 Custom Studio Atelier Backdrop (16:9 or 4:3)
```text
Interior photograph of a modern bespoke garment customization atelier and screen-printing workshop, clean Scandinavian and Japanese minimalist aesthetic, industrial warm oak cutting tables, textile rolls of natural heavyweight unbleached cotton and heavyweight denim, clean digital design monitors displaying garment vector wireframes, ambient warm daylight, tasteful muted color palette of warm cream, beige, raw canvas, and charcoal with a singular red architectural accent stool, clean and uncluttered --ar 16:9 --v 6.0
```

### 8.4 Fabric & Craftsmanship Close-Up / Macro (1:1 or 4:5)
```text
Extreme macro detail shot of 280 GSM premium organic heavyweight combed cotton fabric in off-white cream, showing dense tactile yarn loop weave, clean double-needle reinforced collar ribbing, matte texture with zero synthetic sheen, accompanied by a small crimson red woven label with clean typography, soft tactile side lighting, editorial menswear craftsmanship showcase, hyper-realistic macro photography, 8k --ar 4:5 --style raw --v 6.0
```

### 8.5 Street Culture Lifestyle / Indian Urban Context (4:5 or 3:4)
```text
Candid editorial streetwear photo of a young man wearing a boxy beige oversized t-shirt and charcoal trousers walking in a modern architectural urban setting in Mumbai or New Delhi, brutalist stone backdrop, warm late afternoon golden hour lighting, muted warm colors, authentic street culture lifestyle, shot on 50mm Leica, crisp garment silhouette, premium streetwear brand campaign --ar 4:5 --style raw --v 6.0
```

---

## 9. Negative Prompts & Anti-Slop Constraints

When using Stable Diffusion, SDXL, or tools supporting negative prompts, ALWAYS append:

```text
--no neon glow, cyberpunk, futuristic, glossy plastic, overly smooth skin, airbrushed, oversaturated colors, purple tint, generic stock photo smiles, fake digital render, cartoon, 3d render, distorted hands, blurry fabric, low resolution, crowded background, clutter
```

---

## 10. Post-Processing & Integration Checklist

Before embedding any AI-generated image into `apps/frontend/public/` or product mockups:
1. **Color Calibration**: Verify background matches or blends with `#F7EEDB` (Paper Cream) or `#EDE0CC` (Beige).
2. **Format & Sizing**:
   - Convert to modern `.webp` format using `sharp` or Squoosh.
   - Hero images: max `1920px` width, target `< 180 KB`.
   - Product cards: `800x1000px` (4:5 aspect ratio), target `< 80 KB`.
   - Category tiles: `600x450px` (4:3 aspect ratio), target `< 60 KB`.
3. **Alt Text**: Include descriptive accessibility text (e.g. `Heavyweight 280 GSM Boxy Tee in Charcoal Black - Bingooo`).


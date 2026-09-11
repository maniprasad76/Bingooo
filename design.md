# BINGOOO — Complete Design System & UI/UX Specification

> **Product:** BINGOOO Men's Wear (bingooo.in)  
> **Brand Slogan:** **Wear What Defines You.**  
> **Mission Statement:** **Clothing. Custom. Culture. You.**  
> **Version:** 2.0 (Latest — Unified with Home Page Minimalist Architecture)

---

## 1. Design North Star & Brand Aesthetic

Bingooo is an elevated Indian menswear and custom apparel label built on **warm minimalism, editorial fashion photography, and streetwear confidence**. It rejects generic, cluttered ecommerce templates in favor of a timeless, high-fashion editorial presence.

### Core Aesthetic Pillars
- **Warm Minimalism:** Organic, warm cream canvas (`#F7EEDB`) and soft beige (`#EDE0CC`) rather than sterile hospital-white or generic grey.
- **Strategic Red Accent:** Signature Bingooo Red (`#E6321C`) is used strictly with surgical precision — on the logo period dot, the focal headline phrase (`A YOU.`), active tabs, primary CTAs, and prices. Red is **never** used as a noisy full-screen background wash.
- **Editorial Photography:** High-contrast grayscale or desaturated campaign imagery with gentle gradient blends into the cream background.
- **Strong Brutalist-Inspired Typography:** Extra-bold uppercase headlines in **Manrope** with tight tracking (`-0.06em` to `-0.075em`) and condensed line heights (`0.72` to `0.90`).
- **No AI-Slop:** Clean lines, authentic product shots, minimal rounded corners (`2px` to `6px`), tactile borders, and zero gaudy neon gradients or generic dropshadows.

---

## 2. Brand Identity & Logo Specification

### Primary Wordmark
The Bingooo brand identity is defined by the bold geometric wordmark featuring the signature **Red Dot**:

$$\mathbf{BINGOOO\color{#E6321C}.}$$

```tsx
/* Exact JSX Implementation */
<Link
  to="/"
  className="text-[clamp(25px,2.4vw,34px)] leading-none font-extrabold tracking-[-0.07em] whitespace-nowrap text-[#171717]"
  aria-label="BINGOOO."
>
  BINGOOO<span className="text-[#E6321C]">.</span>
</Link>
```

### Logo Rules
1. **The Red Period:** The dot following "BINGOOO" is **always** `#E6321C` (Brand Red).
2. **Wordmark Color:** The letters `BINGOOO` are `#171717` on light backgrounds (`#F7EEDB`, `#EDE0CC`, `#FFFFFF`) and `#FFFFFF` on dark backgrounds (`#171717`).
3. **Typography:** Set in **Manrope**, weight **800 (ExtraBold)**, uppercase, with tracking set to **`-0.07em`** (tight).
4. **Never Alter:** Never recolor the letters to red, never remove the red dot, never stretch, skew, outline, or add drop shadows to the wordmark.
5. **Secondary Icon Mark:** Stylized solid **B** monogram used strictly for app icons, favicons (`/favicon.png`), and compact brand tags.

---

## 3. Minimalist Color Palette

The Bingooo color palette is simple, restrained, and authentic:

| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| **Warm Cream** | `#F7EEDB` | **Primary Canvas / Background** for storefront pages, hero sections, and editorial backgrounds. |
| **Soft Beige** | `#EDE0CC` | **Secondary Surfaces:** Campaign promo cards, product card image backdrops, drawer panels, and secondary badges. |
| **Charcoal Black** | `#171717` | **Primary Text & Dark Sections:** Primary headings, body copy, header navigation, primary buttons (`.btn-black`), and the dark Category Strip & Footer. |
| **Brand Red** | `#E6321C` | **Accent & Focal Action:** Logo period dot, `A YOU.` punchline, active category filters, primary red CTAs, sale tags, and wishlist heart. |
| **Deep Red** | `#B91F12` | **Hover & Active State:** Hover color for red buttons, links, and focused elements. |
| **Pure White** | `#FFFFFF` | **Card & Form Surfaces:** Search inputs, newsletter inputs, wishlist buttons, and modal dialogs. |
| **Muted Grey** | `#6F6A63` | **Secondary Copy:** Subtitles, product descriptions, breadcrumbs, timestamp tags, and helper copy. |
| **Warm Border** | `#DDD3C5` | **Dividers & Structural Rules:** Clean 1px border rules between grid items, table rows, and trust bars. |

### Semantic Colors
- **Success:** `#238636` (Order placed, verified stock, green status)
- **Warning:** `#B7791F` (Low stock alert, pending verification)
- **Error:** `#C62828` (Form validation failure, payment declined)

---

## 4. Typography Hierarchy

**Primary Font Family:** `Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`  
**Secondary Monospace (for codes, SKUs & counters):** `IBM Plex Mono, monospace`

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
```

### Typographic Scale

| Role | Font Weight | Size Scale | Tracking | Line Height | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Giant Display** | 800 (ExtraBold) | `clamp(55px, 13vw, 105px)` | `-0.075em` | `0.85` | Homepage Hero: `NOT JUST CLOTHES. A YOU.` |
| **Section H1 / H2** | 800 (ExtraBold) | `clamp(36px, 5vw, 64px)` | `-0.06em` | `0.90` | `FEATURED COLLECTION`, `YOUR IDEA. OUR CANVAS.` |
| **Card / Subhead** | 700 (Bold) | `18px – 24px` | `-0.03em` | `1.1` | Category Strip titles (`MEN`, `WOMEN`), FAQ questions |
| **Eyebrow / Kicker**| 800 (ExtraBold) | `9px – 11px` | `+0.18em` to `+0.34em` | `1.7` | `CLOTHING CUSTOM CULTURE YOU`, `NEW DROP`, `EST. 2026` |
| **Body Primary** | 500 / 600 | `13px – 14px` | `normal` | `1.6` | Product descriptions, campaign body copy |
| **Body Secondary**| 400 / 500 | `11px – 12px` | `normal` | `1.5` | Footnotes, support details, accordion answers |
| **Caption / Meta** | 700 / 800 | `9px – 10px` | `+0.1em` | `1.4` | Badges, size swatches, trust bar subtitles |

---

## 5. Home Page Architecture & Section Blueprint

The Home Page (`HomePage.tsx`) serves as the design master blueprint for the entire Bingooo storefront:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TOP ANNOUNCEMENT BAR                                     │
│    FREE DELIVERY ON ORDERS ABOVE ₹999  | TRACK | APP | HELP │
├─────────────────────────────────────────────────────────────┤
│ 2. GLOBAL NAVBAR                                            │
│    [MEN WOMEN CUSTOM COLLECTIONS ABOUT]  BINGOOO. [SEARCH]  │
├─────────────────────────────────────────────────────────────┤
│ 3. HERO SECTION (Split Grid)                                │
│    Left: Eyebrow + NOT JUST CLOTHES. A YOU. + Shop CTA      │
│    Right: Grayscale Editorial Campaign Blend + EST. 2026    │
├─────────────────────────────────────────────────────────────┤
│ 4. CATEGORY STRIP (Solid #171717)                           │
│    [ MEN ] ───────────────────────── [ WOMEN ] (thumbnails) │
├─────────────────────────────────────────────────────────────┤
│ 5. FEATURED COLLECTION (4-Col Grid)                         │
│    Clean 4:5 Cards + Wishlist Pill + Swatches + Price       │
├─────────────────────────────────────────────────────────────┤
│ 6. CUSTOM STUDIO CAMPAIGN (Split Beige #EDE0CC)             │
│    Artisan Photo | YOUR IDEA. OUR CANVAS. | START CREATING  │
├─────────────────────────────────────────────────────────────┤
│ 7. TRUST & VALUE BAR (4-Col Divider Grid)                   │
│    Free Delivery | Easy Returns | Premium Quality | Payment │
├─────────────────────────────────────────────────────────────┤
│ 8. SOCIAL PROOF & COMMUNITY (@BINGOOO)                      │
│    REAL PEOPLE. REAL FITS. + 6 UGC Instagram Fit Photos     │
├─────────────────────────────────────────────────────────────┤
│ 9. NEWSLETTER SUBSCRIPTION (Minimalist)                     │
│    GET THE NEXT DROP. + Clean Input + SUBSCRIBE →           │
├─────────────────────────────────────────────────────────────┤
│ 10. GLOBAL FOOTER (Solid #171717)                           │
│     BINGOOO. | Links | Atelier Coordinates | Copyright      │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Section Specs

#### 1. Hero Section
- **Background:** `#F7EEDB`
- **Left Copy Box:**
  - 4-line stacked uppercase eyebrow: `CLOTHING / CUSTOM / CULTURE / YOU` with `text-[#171717]` and tracking `0.18em`.
  - Massive 3-line headline:
    - Line 1: `NOT JUST`
    - Line 2: `CLOTHES.`
    - Line 3: `<span className="text-[#E6321C]">A YOU.</span>`
  - Subtitle: `WEAR WHAT DEFINES YOU.` (`11px`, `tracking-[0.34em]`, `font-semibold`).
  - Action buttons: `.btn-black` (`SHOP NOW →`) paired with clean `.text-link` (`CREATE YOUR OWN`).
- **Right Image Overlay:**
  - High-fashion campaign model photo in pure grayscale.
  - Smooth editorial gradient overlay (`from-[#F7EEDB] via-[#F7EEDB]/20 to-transparent`) creating a seamless fade into the cream canvas.
  - Editorial coordinates tag in top right: `EST. 2026 / INDIA` with a `28px` fine divider line.

#### 2. Dark Category Strip
- **Background:** `#171717` (Deep Charcoal Black), text `#FFFFFF`.
- **Layout:** 2-column responsive grid (`grid-cols-1 md:grid-cols-2`) with `1px` border (`border-white/15`).
- **Cards:** Includes a `120x120px` grayscale thumbnail, uppercase heading (`MEN`, `WOMEN`), subline (`Everyday fits for every you` / `Style that moves with you`), and an underlined white link that hovers to `#E6321C`.

#### 3. Featured Products Grid
- **Aspect Ratio:** `4/5` clean portrait aspect ratio for product photography.
- **Card Background:** Soft beige `#EDE0CC`.
- **Floating Wishlist Button:** Circular white button (`31x31px`), border `#DDD3C5`, toggles solid `#E6321C` heart (`♥`).
- **Details:** Product name (`12px`, font-semibold), price (`14px`, font-bold, `#171717`), and miniature circular color swatches (`13x13px`, border `#DDD3C5`).

#### 4. Custom Studio Campaign
- **Background:** Soft beige `#EDE0CC`.
- **Layout:** 50/50 split banner.
- **Content:** Tailoring / printmaking workshop photo + Headline: `YOUR IDEA. OUR CANVAS.` + Primary Red Button: `START CREATING →` (`.btn-red`).

#### 5. Minimalist Trust Bar
- **Background:** `#F9F5ED` with `1px` border top and bottom (`#DDD3C5`).
- **Items:** 4 columns with subtle monochrome glyphs/SVGs:
  1. *Free Delivery* — On orders above ₹999
  2. *Easy Returns* — Within 15 days
  3. *Premium Quality* — Made to last
  4. *Secure Payment* — 100% safe & secure

#### 6. Social Community (@BINGOOO)
- **Headline:** `REAL PEOPLE. REAL FITS.`
- **Grid:** 6 square tiles showing real customers in Bingooo apparel, grayscale by default, zooming smoothly on hover (`hover:scale-105`).

#### 7. Newsletter Section
- **Background:** Warm cream `#F7EEDB`.
- **Form:** Ultra-minimalist inline form (`48px` height) with white input, 1px border `#DDD3C5`, and solid black `.btn-black` (`SUBSCRIBE →`).

---

## 6. UI Components & Reusable Styles

All pages must reuse these canonical button and element tokens defined in `index.css`:

### Buttons

```css
/* 1. Primary Solid Black Button */
.btn-black {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  background-color: #171717;
  color: #FFFFFF;
  font-family: 'Manrope', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border-radius: 2px;
  border: 1px solid #171717;
  transition: all 0.2s ease;
}
.btn-black:hover {
  background-color: #E6321C;
  border-color: #E6321C;
  color: #FFFFFF;
}

/* 2. Brand Red Action Button */
.btn-red {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  background-color: #E6321C;
  color: #FFFFFF;
  font-family: 'Manrope', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border-radius: 2px;
  border: 1px solid #E6321C;
  transition: all 0.2s ease;
}
.btn-red:hover {
  background-color: #B91F12;
  border-color: #B91F12;
}

/* 3. Minimalist Text Link */
.text-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Manrope', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #171717;
  border-bottom: 1px solid #171717;
  padding-bottom: 2px;
  transition: all 0.2s ease;
}
.text-link:hover {
  color: #E6321C;
  border-color: #E6321C;
}
```

### Form Inputs & Search Fields
- **Background:** `#FFFFFF` or `rgba(255, 255, 255, 0.35)` on cream surfaces.
- **Border:** `1px solid #DDD3C5`.
- **Focus State:** `border-color: #171717` or `outline: 2px solid #E6321C`.
- **Corner Radius:** `2px` (sharp, architectural).
- **Placeholder:** `#8C867E`.

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout Adjustments |
| :--- | :--- | :--- |
| **Desktop** | `> 1024px` | Full split grids, 4-column product grids, sidebars intact. |
| **Tablet** | `768px – 1023px` | 2-column product grids, category sidebar tightens to 220px, 2-column service strip. |
| **Mobile** | `< 767px` | 1-column layouts, category filters become horizontal scrollable strips (`overflow-x: auto`), hero scales down with clamp, fixed mobile bottom navigation bar (`68px`). |

---

## 8. Anti-Slop Rules & Quality Checklist

Before shipping any page, verify:
- [x] Background is warm cream `#F7EEDB` or soft beige `#EDE0CC` (no generic cold white `#F8FAFC`).
- [x] Logo uses `BINGOOO<span className="text-[#E6321C]">.</span>` with font-extrabold and tight letter spacing.
- [x] Headings use **Manrope**, tight tracking (`-0.06em`), and uppercase styling.
- [x] Red is an accent and never the whole background.
- [x] Campaign images use grayscale or warm desaturated tone for editorial elegance.
- [x] Buttons follow `.btn-black` (hover red) or `.btn-red` (hover deep red).
- [x] Zero build warnings or unused variables (`tsc -b`).

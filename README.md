# Bingooo Men's Wear 👕✨

> **"Wear what feels like you."** — *Create. Customize. Wear.*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?style=flat&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/developer-platform/r2/)
[![Razorpay](https://img.shields.io/badge/Razorpay-0C2340?style=flat&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Graphify](https://img.shields.io/badge/Memory-Graphify-blueviolet?style=flat)](https://github.com/graphifyy/graphify)

Bingooo is an end-to-end, streetwear-inspired men's fashion e-commerce ecosystem and interactive custom garment customization studio. Built as a high-performance monorepo, it pairs a customer-facing storefront with a dedicated 27-route operational control center, a modular NestJS API, and a persistent topological codebase memory layer powered by **Graphify**.

---

## 🏛️ Monorepo Architecture

```
bingooo/
├── apps/
│   ├── frontend/         # Customer Storefront & Live Custom Garment Studio
│   │   ├── src/components/   # Catalog, Cart Drawer, Garment Customizer, Layout
│   │   └── src/pages/        # Shop, Product Detail, Studio, Account, Cart, Checkout
│   │
│   ├── admin/            # 27-Route Back-Office Operations & Management Center
│   │   ├── src/components/   # AdminSidebar (7 sections), AdminHeader, StatCard, Modals
│   │   └── src/pages/        # Analytics, Garment Editor, Orders, Custom Requests, Settings...
│   │
│   └── backend/          # High-Performance NestJS REST API Server
│       └── src/              # Products, Orders, Customizations, Inventory, Payments, R2 Media
│
├── .agents/              # AI Pair Programming Customizations & Memory
│   ├── rules/            # Architectural constraints (graphify.md, etc.)
│   ├── workflows/        # Executable workflows (/graphify, etc.)
│   └── skills/           # Specialized runbooks:
│       ├── bingooo-ui-ux/            # Canonical design tokens & section specs
│       ├── never-get-hacked/         # Application security & defensive engineering
│       ├── context7/                 # Upstash live docs & backend error resolver
│       └── nestjs-best-practices/    # Layered architecture & module hygiene
│
├── graphify-out/         # Persistent Codebase Knowledge Graph
│   ├── graph.json        # 1,355 nodes, 2,498 edges, 82 topological communities
│   └── graph.html        # Interactive browser-based architecture visualization
│
└── design.md             # Canonical Design System & UI/UX Specification
```

---

## 🎨 Design System & Visual Identity

Bingooo adheres to a warm, editorial streetwear aesthetic designed to wow customers and provide back-office teams with a clean, high-density operations UI.

### Palette Tokens
| Token | Hex | Role |
|:---|:---|:---|
| **Brand Red** | `#E6321C` | Primary CTA, price highlights, active badges, accents |
| **Deep Red** | `#B91F12` | Pressed / hover button states, high-priority surfaces |
| **Warm Cream** | `#F7EEDB` | Primary page background, neutral canvas |
| **Soft Beige** | `#EDE0CC` | Secondary cards, pill filters, borders, empty states |
| **Charcoal / Ink**| `#171717` | High-contrast typography, dark footers, contrast buttons |
| **White** | `#FFFFFF` | Card containers, input fields, modal dialogs |
| **Muted Text** | `#6F6A63` | Subtitles, timestamps, metadata labels |
| **Border** | `#DDD3C5` | Subtle dividers and component outlines |

### Typography
- **Primary Font Family:** `Manrope` (Google Fonts) — modern geometric sans-serif delivering editorial confidence across headlines and tabular data.
- **Accents:** `Impact` / `Bebas Neue` for select display hero headlines.

---

## ✨ Key Capabilities

### 🛍️ Customer Storefront (`apps/frontend`)
- **Curated Streetwear Catalog:** Heavyweight combed cotton t-shirts (240–280 GSM boxy cut), double-layered fleece hoodies, drop-shoulder crewnecks, and tactical cargo trousers.
- **Garment Detail & Fit Guide:** Interactive size matrix (S, M, L, XL, XXL) with fabric specs, GSM weight, washing care, and live stock radar.
- **Live Custom Design Studio:**
  - Real-time 2D garment canvas with front/back toggle.
  - Multi-font typographic customizer and vector artwork upload.
  - Print method selector (Direct-to-Garment / DTG vs. High-Density Embroidery).
  - Dynamic price calculator based on artwork area and placement complexity.
- **Persistent Cart & Wishlist:** Seamless flyout cart drawer with free shipping progress bar, instant coupon application, and saved designs vault.

### 🎛️ Operations Control Center (`apps/admin`)
A unified back-office suite organized into 7 functional operational divisions:
1. **Overview:** Executive KPI telemetry, sales velocity charts, AOV metrics, and stock radar.
2. **Catalog & Stock:**
   - [ProductEditorPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/ProductEditorPage.tsx): Comprehensive garment publishing tool with fabric GSM, fit silhouette, and multi-variant SKU matrix generator.
   - [ProductsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/ProductsPage.tsx) & [CategoriesPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/CategoriesPage.tsx): Taxonomy management with editorial lookbook cards and ordering.
   - [InventoryPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/InventoryPage.tsx): Physical warehouse stock tracking with low-stock warnings.
3. **Orders & Studio:**
   - [OrdersPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/OrdersPage.tsx) & [OrderDetailPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/OrderDetailPage.tsx): 6-stage fulfillment pipeline (`Placed → Confirmed → Processing → Shipped → Out for Delivery → Delivered`), carrier AWB tracking, and print-ready packing slips.
   - [CustomPrintQueuePage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/CustomPrintQueuePage.tsx): Artwork review queue with high-res vector downloads.
   - [CustomRequirementsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/CustomRequirementsPage.tsx): Bespoke and bulk order quote generation.
4. **Marketing & Sales:**
   - [BannersPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/BannersPage.tsx): Hero sliders with 16:9 desktop and 4:5 mobile preview cards.
   - [CouponsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/CouponsPage.tsx) & [DiscountsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/DiscountsPage.tsx): Automated catalog deals and promotional coupons.
5. **Finance & Media:**
   - [PaymentsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/PaymentsPage.tsx): Razorpay financial ledger with UPI/Card/Partial COD breakdowns and refund modals.
   - [ReturnsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/ReturnsPage.tsx): Reverse logistics checkpoints and courier pickups.
   - [UploadsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/UploadsPage.tsx): Cloudflare R2 media library with instant CDN URL copying.
6. **Customers & Team:**
   - [CustomersPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/CustomersPage.tsx) & [CustomerDetailPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/CustomerDetailPage.tsx): Customer dossiers with lifetime spend (VIP tiering) and order history.
   - [StaffUsersPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/StaffUsersPage.tsx) & [RolesPermissionsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/RolesPermissionsPage.tsx): Granular RBAC permissions checklist.
   - [ReviewsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/ReviewsPage.tsx): Review moderation board with star ratings and photo attachments.
7. **Operations & System:**
   - [SettingsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/SettingsPage.tsx): Full 8-tab configuration (Store Profile, Commerce & GST, Shipping Rules, COD & Partial COD, Razorpay Gateway, Notifications, Cloudflare R2, and SEO).
   - [AnalyticsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/AnalyticsPage.tsx): BI analytics with custom design conversion funnels.
   - [AuditLogsPage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/AuditLogsPage.tsx) & [ProfilePage](file:///c:/Users/manip/Desktop/bingooo/apps/admin/src/pages/ProfilePage.tsx): Security event trails and admin profiles.

### 🛡️ Security & Defensive Engineering
Guided by the **Never Get Hacked** skill ([.agents/skills/never-get-hacked/SKILL.md](file:///c:/Users/manip/Desktop/bingooo/.agents/skills/never-get-hacked/SKILL.md)):
- **Zero Frontend Secrets:** No private keys or database passwords bundled into client code.
- **Authoritative Server Pricing:** Cart line-item prices, GST, and discounts are strictly recalculated on the backend.
- **Payment Verification:** HMAC SHA-256 webhook signature verification on Razorpay events with raw payload buffering.
- **Short-Lived Media Presigning:** Cloudflare R2 presigned URLs with MIME verification and UUID asset key isolation.
- **Input Sanitization & RBAC:** NestJS `ValidationPipe` with `whitelist: true` and default-deny permission guards.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`
- **Python**: `>= 3.11` (for Graphify codebase memory)

### 1. Installation
Clone the repository and install dependencies across all workspaces:
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in the root and relevant apps:
```bash
cp .env.example .env
```
Ensure your configuration includes:
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`

### 3. Running Locally
Launch individual applications or the full suite:

```bash
# Start Customer Storefront (Vite on http://localhost:5173)
npm run dev:web

# Start Admin Operations Portal (Vite on http://localhost:5174)
npm run dev:admin

# Start NestJS Backend API (HTTP on http://localhost:3000)
npm run dev:api
```

### 4. Build & Typecheck
Verify type correctness and build production bundles:
```bash
# Typecheck all monorepo workspaces
npm run typecheck

# Build all monorepo applications
npm run build
```

---

## 🧠 Codebase Memory & Graphify Integration

This repository uses **Graphify** to construct a persistent, queryable knowledge graph of all code modules, endpoints, components, and relationships.

### Querying the Codebase Memory
Query architecture and symbol relationships directly from the terminal:
```bash
# Ask questions about the codebase architecture
python -m graphify query "How does order fulfillment relate to payments?"

# Find the shortest dependency path between components
python -m graphify path "OrdersController" "OrderDetailPage"

# Deep-dive into a specific class or symbol
python -m graphify explain "ProductEditorPage"
```

### Refreshing the Knowledge Graph
After making structural code modifications, keep the graph synchronized:
```bash
python -m graphify extract . --code-only
python -m graphify export html
```
To visually explore the complete codebase graph, open `graphify-out/graph.html` in any web browser.

---

## 📜 Scripts Reference

| Command | Workspace | Description |
|:---|:---|:---|
| `npm run dev:web` | `apps/frontend` | Starts the customer-facing storefront in dev mode |
| `npm run dev:admin` | `apps/admin` | Starts the admin control center dev server |
| `npm run dev:api` | `apps/backend` | Starts the NestJS backend API with hot reload |
| `npm run build:web` | `apps/frontend` | Compiles the production bundle for the storefront |
| `npm run build:admin` | `apps/admin` | Compiles the production bundle for the admin portal |
| `npm run build:api` | `apps/backend` | Compiles the production NestJS backend application |
| `npm run typecheck` | Root | Runs TypeScript compilation verification across all workspaces |
| `npm run lint` | Root | Lints all packages and apps |

---

## 🤝 Contributing & Guidelines
1. Always adhere to the **Bingooo Design System** detailed in [design.md](file:///c:/Users/manip/Desktop/bingooo/design.md) and the [bingooo-ui-ux](file:///c:/Users/manip/Desktop/bingooo/.agents/skills/bingooo-ui-ux/SKILL.md) skill.
2. Ensure any new backend endpoint adheres to the defensive security checklist in [never-get-hacked](file:///c:/Users/manip/Desktop/bingooo/.agents/skills/never-get-hacked/SKILL.md).
3. Use the [context7](file:///c:/Users/manip/Desktop/bingooo/.agents/skills/context7/SKILL.md) skill when troubleshooting backend exceptions or library integration patterns.
4. Run `npm run typecheck` and `npm run build` prior to committing any code.

---

<p align="center">
  <b>Bingooo Men's Wear</b> • Built with precision, performance, and style.
</p>

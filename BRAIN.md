# 🧠 Bingooo Knowledge Brain (`BRAIN.md`)
> **Persistent Architecture, Agent Memory & Engineering Runbook**  
> *Last Updated: September 2026*

---

## 1. Project Overview & Mission

**Bingooo** is an atelier-grade streetwear e-commerce platform and custom apparel studio based in India.
- **Core Value Proposition**: Premium streetwear (240 GSM combed cotton tees, 380 GSM heavyweight fleece hoodies) paired with a real-time bespoke garment design customizer ("Wear What Defines You").
- **Target Channels**: Progressive Web App (PWA), Native Mobile (via Capacitor iOS/Android), and Web Storefront.

---

## 2. Monorepo Architecture

The repository is structured as a TypeScript monorepo:

```
bingooo/
├── apps/
│   ├── frontend/        # React 19 + Vite 8 + Tailwind CSS customer storefront & customizer
│   │   ├── src/pages/   # HomePage, ShopPage, ProductPage, CustomizerPage, CheckoutPage, etc.
│   │   ├── src/components/ # UI kit, Catalog, CartDrawer, Layout, SEO
│   │   ├── src/lib/     # API client, Native Capacitor bridge, SEO schemas, Preloaders
│   │   └── android/     # Capacitor 8 native Android shell
│   ├── backend/         # NestJS 10 REST API server
│   │   ├── src/common/  # Database store, In-memory O(1) hash indexes, Guards, Interceptors
│   │   ├── src/auth/    # Authentication, JWT, Password hashing
│   │   ├── src/products/# Product catalog & inventory
│   │   ├── src/cart/    # User & guest cart management
│   │   ├── src/checkout/# Multi-step checkout pipeline
│   │   ├── src/orders/  # Order processing & state machine
│   │   └── src/payments/# Razorpay, UPI & manual payment flows
│   └── admin/           # Vite 8 + React 19 back-office management dashboard (27 routes)
│       └── src/pages/   # OrdersPage, ProductEditorPage, DashboardPage, SettingsPage, etc.
├── packages/
│   ├── types/           # Shared TypeScript domain models, DTOs & interfaces
│   └── config/          # Shared tsconfig, tooling & lint standards
├── graphify-out/        # Graphify Knowledge Graph persistent memory
└── BRAIN.md             # This file: Single Source of Truth agent memory
```

---

## 3. Graphify Knowledge Graph Memory Layer

The project is indexed with **Graphify** (`graphifyy`), giving all AI assistants and developers structured, deterministic memory of the entire codebase.

### Graph Memory Stats:
- **Total Nodes**: 7,333+ symbols & concepts
- **Total Edges**: 9,922+ relational connections (calls, imports, inherits, references)
- **Communities**: 646 architectural clusters

### Core Memory Artifacts:
- [`graphify-out/graph.json`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/graph.json): Raw graph data used for instant contextual querying.
- [`graphify-out/graph.html`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/graph.html): Interactive visual dependency map (open directly in browser).
- [`graphify-out/GRAPH_REPORT.md`](file:///c:/Users/manip/Desktop/bingooo/graphify-out/GRAPH_REPORT.md): Audit report including God Nodes, hub communities, and integrity checks.

### Querying Graph Memory:
```bash
# Broad question exploration (BFS traversal)
python -m graphify query "<question>"

# Deep execution trace (DFS traversal)
python -m graphify query "Trace order creation from checkout to database" --dfs

# Find exact connection path between two modules
python -m graphify path "<NodeA>" "<NodeB>"

# Detailed symbol explanation
python -m graphify explain "<SymbolName>"

# Keep graph updated after making code changes (AST-only, zero API cost)
python -m graphify update .
```

---

## 4. Key Architectural Patterns & Invariants

### 1. Database & Indexing Layer (`apps/backend/src/common/database/`)
- **Store** ([`store.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/common/database/store.ts)): File-backed in-memory database serialized to disk (`data/store.json`).
- **O(1) Hash Indexes** ([`db-index.service.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/backend/src/common/database/db-index.service.ts)): Fast lookup maps for products by id/slug, categories, collections, users, and orders.
- **Strict Decoupling Rule**: `store.ts` must **never** directly import or require `db-index.service.ts`. Instead, an observer pattern is used via `registerSaveHook(rebuildIndexes)` to eliminate circular dependencies.

### 2. Security & RBAC Guard Pipeline
- **Authentication**: Bearer JWT tokens validated via `AuthGuard`.
- **Role Permissions**: Controlled with `@Permissions(...)` decorator and enforced by `RolesGuard`.
- **Authoritative Server Pricing**: Cart line-item prices, GST, discounts, and shipping rules are calculated exclusively on the backend.
- **Razorpay Verification**: HMAC SHA-256 webhook signatures verified with raw request payloads.

### 3. Frontend Aesthetics & Performance
- **Design Tokens**: Strict adherence to [design.md](file:///c:/Users/manip/Desktop/bingooo/design.md) (Warm cream `#F7EEDB`, charcoal `#171717`, signal red `#E6321C`, Manrope font).
- **Iconography**: Crisp Lucide React SVG icons throughout all user interfaces (no raw unicode emojis).
- **Haptic Feedback**: Mobile touch gestures trigger native vibration via `triggerHaptic()` from [`capacitorBridge.ts`](file:///c:/Users/manip/Desktop/bingooo/apps/frontend/src/lib/native/capacitorBridge.ts).
- **SEO & PWA**: Dynamic JSON-LD structured schemas (`Organization`, `Product`, `WebSite`, `LocalBusiness`), service worker offline caching, and PWA install prompts.

---

## 5. Development Runbook & Common Commands

| Task | Command | Directory / Scope |
|---|---|---|
| **Storefront Dev Server** | `npm run dev:web` | Root / `apps/frontend` (Port 5173) |
| **Admin Dev Server** | `npm run dev:admin` | Root / `apps/admin` (Port 5174) |
| **Backend API Server** | `npm run dev:api` | Root / `apps/backend` (Port 3000) |
| **Run Full Dev Suite** | `npm run dev:all` | Root (API + Storefront + Admin) |
| **Typecheck All Workspaces** | `npm run typecheck` | Root |
| **Build All Bundles** | `npm run build` | Root |
| **Android Sync / Open** | `npm run android:sync` / `npm run android:open` | Root |
| **Backend Security Suite** | `npm run test:security` | `apps/backend` |
| **Backend Checkout E2E** | `npm run test:checkout` | `apps/backend` |
| **Re-index Graph Memory** | `python -m graphify update .` | Project Root |

---

## 6. Changelog & Recent Decisions

- **2026-09-17: Comprehensive UI/UX Iconography Refactor**
  - Standardized all UI components, badges, social blocks, and navigation elements on Lucide React vector icons.
- **2026-09-17: Atelier Command Console Admin Login & Redesigns**
  - Redesigned Admin Login, 404 Error page, and Size & Fit Guide with editorial brutalist architecture and interactive calculators.
- **2026-09-17: Mobile Navigation & Footer Accordions**
  - Upgraded mobile footers with collapsible touch dropdowns and bottom sticky action bars for conversion flow.
- **2026-09-17: Circular Dependency Elimination & Graphify Integration**
  - Decoupled `apps/backend/src/common/database/store.ts` from `db-index.service.ts` using the `registerSaveHook` subscription pattern.
  - Indexed 7,300+ symbols into persistent Graphify knowledge graph.

# ⚖️ BINGOOO — Engineering Rules, Invariants & Guidelines (`rules.md`)

> **Document Version:** 1.0.0  
> **Status:** Mandatory Enforcement  
> **Last Updated:** September 2026  
> **Applies to:** All developers, contributors, and AI pair programmers working on `bingooo`

---

## 1. Core Principles & Philosophy

1. **Precision & Craftsmanship:** Every pixel, edge case, and backend transaction must be treated with atelier-grade attention to detail.
2. **Defensive Engineering:** Assume all inputs from clients, query strings, and third-party webhooks are potentially hostile until validated.
3. **Editorial Aesthetics:** Follow the canonical Bingooo design system. No generic templates, no pastel candy colors, no raw emojis in interactive elements.
4. **Zero Circular Dependencies:** Strict modular decoupling across NestJS services and React components.

---

## 2. Monorepo & TypeScript Guidelines

### 2.1 Monorepo Boundaries
- **Rule 1 (Cross-Workspace Isolation):** `apps/frontend` and `apps/admin` must **never** import source code directly from `apps/backend`, and vice versa.
- **Rule 2 (Shared Domain Models):** All shared interfaces, DTOs, enums, and API response contracts must reside in `packages/types` (`@bingooo/types`).
- **Rule 3 (No Ad-Hoc Types):** Do not define ad-hoc duplicate product or order interfaces inside components. Always import from `@bingooo/types`.

### 2.2 TypeScript Standards
- **Rule 4 (Strict Type Checking):** Avoid `any` at all costs. Use `unknown` with type guards if the runtime shape is uncertain.
- **Rule 5 (Explicit Return Types):** All public controller methods, service methods, and custom React hooks must have explicit return types.
- **Rule 6 (Immutable State Updates):** Never mutate Zustand state directly. Always use standard immutable spread or shallow clone updates.

---

## 3. UI/UX & Design System Invariants

### 3.1 Color Palette Tokens (Audited from `design.md`)

| Token | Hex Value | Permitted Role |
|:---|:---|:---|
| **Brand Red** | `#E6321C` | Primary CTAs, active badges, logo dot, price highlights. 5–10% of any viewport. |
| **Deep Red** | `#B91F12` | Hover & pressed states for red buttons, urgency badges ("Few Left"). |
| **Charcoal Ink** | `#171717` | Primary text, headings, dark buttons, footers. The brand "black". |
| **Paper Cream** | `#F7EEDB` | Dominant canvas background (60–70% of screen area). |
| **Beige** | `#EDE0CC` | Secondary surface: cards, swatches, table headers, hover rows. |
| **Muted Text** | `#6F6A63` | Subtitles, timestamps, metadata labels, helper text. |
| **Hairline Border** | `#DDD3C5` | 1px dividers, card outlines, form input borders. |
| **Pure White** | `#FFFFFF` | Form input backgrounds, modal surfaces, product cards. |

> **Proportional Rule:** `#F7EEDB` Cream (~65%) dominates → `#171717` Charcoal (~25%) provides structure → `#E6321C` Red (~5–10%) is the deliberate focal accent.

### 3.2 Typography Standards
- **Rule 7 (Primary Typography):** All headings, navigation links, and body text must use **`Manrope`** (Google Fonts). Browser default fonts (`Arial`, `Times New Roman`, `system-ui`) are prohibited.
- **Rule 8 (Technical & Spec Typography):** All fabric weight indicators (GSM specs), SKUs, prices, table headers, and stock counters must use **`IBM Plex Mono`** or monospace styling.
- **Rule 9 (Customizer Display Fonts):** The live studio customizer supports only the 14 curated display fonts (Anton, Bebas Neue, Bungee, Caveat, Cinzel, Cormorant Garamond, Major Mono Display, Permanent Marker, Playfair Display, Prata, Righteous, Russo One, Space Grotesk, Syne). Do not inject unapproved random web fonts.

### 3.3 Iconography & Visual Assets
- **Rule 10 (Strict Lucide React Vector Icons):** Use exclusively **`lucide-react`** SVG icons.
- **Rule 11 (No Raw Unicode Emojis in UI):** Never embed raw emoji characters (e.g., 🛒, 👕, ⚡, 🔥) in button text, badges, navigation menus, or headings. Use corresponding Lucide icons (`<ShoppingBag />`, `<Shirt />`, `<Zap />`, `<Flame />`).

### 3.4 Responsive Containers & Spacing
- **Rule 12 (Layout Containers):** Use predefined container classes:
  - Primary: `.container-bingooo` (`min(100% - 48px, 1440px)`).
  - Editorial / Reading: `.container-narrow` (`800px`).
- **Rule 13 (Mobile Action Bar):** Mobile product detail pages must include a sticky bottom action bar (`pb-20` on body) to maximize conversion velocity.

---

## 4. Backend & NestJS Engineering Invariants

### 4.1 Layered Architecture
- **Rule 14 (Controller Responsibilities):** Controllers must only handle HTTP routing, query/body parameter extraction, and status code delegation. Zero business logic in controllers.
- **Rule 15 (Service Responsibilities):** Business logic, tax calculations, state transitions, and third-party integrations belong exclusively in Services.
- **Rule 16 (Store Decoupling):** `apps/backend/src/common/database/store.ts` must **NEVER** directly import `DbIndexService`. Always use `registerSaveHook(rebuildIndexes)` to prevent circular dependencies.

### 4.2 DTO Validation & Input Sanitization
- **Rule 17 (Global ValidationPipe):** All endpoints must validate input payloads using DTO classes decorated with `class-validator` and `class-transformer`.
- **Rule 18 (Whitelist Enforcement):** `ValidationPipe` must have `whitelist: true` and `forbidNonWhitelisted: true`. Unknown fields must be rejected immediately with HTTP 400.

### 4.3 Error Handling & Response Contracts
- **Rule 19 (Standard Exception Classes):** Use standard NestJS HTTP exceptions:
  - `NotFoundException` (404) for missing entities.
  - `BadRequestException` (400) for invalid client payloads.
  - `UnauthorizedException` (401) for missing or invalid tokens.
  - `ForbiddenException` (403) for insufficient RBAC permissions.
  - `ConflictException` (409) for duplicate resources or stock race conditions.
- **Rule 20 (Response Envelope):** All successful API responses must adhere to the standard envelope format:
  ```json
  {
    "success": true,
    "data": { ... },
    "timestamp": "2026-09-21T07:00:00.000Z",
    "requestId": "req_abc123"
  }
  ```

---

## 5. Security & Defensive Engineering Checklist

### 5.1 Financial & Payment Invariants
- **Rule 21 (Authoritative Server Pricing):** Never trust line-item prices, GST percentages, or shipping fees sent by the client. The backend must strictly query the stored product price and recalculate totals.
- **Rule 22 (Webhook HMAC Verification):** All Razorpay webhook events must verify `x-razorpay-signature` using `req.rawBody` (the raw buffer) before parsing event JSON.
- **Rule 23 (Payment Amount Matching):** When capturing payments, verify that `razorpay_payment.amount` matches `order.totalAmount * 100` (paise) exactly.

### 5.2 Storage & File Upload Invariants
- **Rule 24 (Presigned Upload URLs Only):** Never upload raw image binaries directly to the NestJS API server. Always generate short-lived (< 15 mins) Cloudflare R2 presigned PUT URLs with UUID keys.
- **Rule 25 (MIME Whitelist):** Enforce strict MIME checking for uploads (`image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`). Disallow executable files or scripts.

### 5.3 Network & Request Invariants
- **Rule 26 (CORS Origin Whitelist):** Restrict CORS to authorized storefront domains and local development ports (`5173`, `5174`). Never use wildcard `origin: '*'` with credentials.
- **Rule 27 (Rate Limiting):** Protect all endpoints via `@nestjs/throttler` (Burst: 25 req/10s; Default: 100 req/60s).

---

## 6. Verification & Quality Gates

Before committing code or submitting pull requests, developers must execute the following gates:

```bash
# 1. Typecheck: Verify zero TypeScript compiler errors across all workspaces
npm run typecheck

# 2. Build: Verify production bundle compilation
npm run build

# 3. Security Suite: Verify authentication, authorization, and price tampering defenses
npm run test:security -w apps/backend

# 4. Checkout Suite: Verify end-to-end checkout and tax calculation pipeline
npm run test:checkout -w apps/backend

# 5. Graphify Sync: Keep the knowledge graph synchronized after code modifications
python -m graphify update .
```

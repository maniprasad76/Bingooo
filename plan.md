# BINGOOO — Plan: Complete COD Reference Cleanup

> **Status:** In Progress
> **Goal:** Remove all Cash on Delivery (COD) dead code from the codebase. COD is already rejected at the backend (PaymentMethod = 'prepaid' only). This plan cleans up legacy references in notifications, FAQ copy, and prerender script.

---

## Scope

### IN
- `apps/backend/src/notifications/whatsapp.service.ts` — Remove `cod` variable, COD message branches, `WHATSAPP_COD_TEMPLATE` fallback
- `apps/frontend/src/pages/FaqPage.tsx` — Reword FAQ entry away from "Is COD available?" framing (keep "No, prepaid only" answer)
- `apps/frontend/scripts/prerender-seo.mjs` — Same FAQ entry in static prerender

### OUT (do NOT touch)
- `apps/backend/src/tests/run-security-suite.ts` — Keeps the COD-rejection security test; it's a guard not a feature
- `apps/backend/src/shipping/shiprocket.service.ts` — `cod: '0'` is a Shiprocket API field; stays as-is
- `packages/types/src/order.ts` — Already clean (`PaymentMethod = 'prepaid'`)

---

## File Changes

### 1. `apps/backend/src/notifications/whatsapp.service.ts`

**`formatOrderConfirmationMessage()`** (lines ~89–109):
- Remove `const cod = order.payment_method === 'cod';`
- Replace COD ternary in message text with prepaid-only text:
  - Line 100: `...We've received your payment and your order *${orderNumber}* is confirmed.`
  - Line 103: `*Paid:* ₹${this.amountPaid(order)}`

**`sendOrderConfirmation()`** (lines ~132–153):
- Remove `const cod = stored.payment_method === 'cod';`
- Remove `&& !cod` from the guard condition (line 133 becomes: `if (stored.payment_status !== 'captured') return ...`)
- Remove comment about COD template (line 143)
- Change `templateEnv: cod ? 'WHATSAPP_COD_TEMPLATE' : 'WHATSAPP_ORDER_TEMPLATE'` → `templateEnv: 'WHATSAPP_ORDER_TEMPLATE'`

### 2. `apps/frontend/src/pages/FaqPage.tsx`

**FAQ entry `payments-1`** (lines ~120–126):
- Change `question` from `'Is Cash on Delivery (COD) available?'` → `'Do you offer Cash on Delivery?'`
- Keep the answer exactly as-is (already says No, prepaid only)
- Update `searchKeywords` to remove redundant "cod" keyword (already covered by answer)

### 3. `apps/frontend/scripts/prerender-seo.mjs`

**FAQS array** (line ~354):
- Change `['Is Cash on Delivery (COD) available?', '...']` → `['Do you offer Cash on Delivery?', '...']`
- Keep answer text as-is

---

## Verification

- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run test:security` — 49/49 pass (COD rejection test still passes since backend still rejects 'cod')
- [ ] `npm run build --workspace=@bingooo/frontend` — builds clean
- [ ] No remaining `WHATSAPP_COD_TEMPLATE` or `cod =` references in source (excluding test file and shiprocket)

---

## Commit Message
`chore: remove COD dead code from whatsapp service and clean FAQ copy`

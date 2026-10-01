---
phase: 3
plan: 2
wave: 1
gap_closure: false
---

# Plan 3.2: Automated WhatsApp Order Confirmation & Tracking Webhook

## Objective
Implement an automated WhatsApp Order Confirmation service (`WhatsAppService`) in `apps/backend/src/notifications/` that sends a rich, formatted order confirmation message to the customer's WhatsApp upon placing an order or completing payment, accompanied by a 1-click WhatsApp receipt action on the frontend `OrderSuccessPage.tsx`.

## Context
- `.gsd/SPEC.md` (Requirements REQ-08: Order Notification Webhooks)
- `.gsd/ROADMAP.md` (Phase 3: Plan 3.2)
- `apps/backend/src/orders/orders.service.ts` (Order creation and fulfillment state machine)
- `apps/backend/src/payments/payments.service.ts` (Razorpay webhook and payment verification)
- `apps/frontend/src/pages/OrderSuccessPage.tsx` (Customer post-checkout confirmation view)
- `AGENTS.md` (Architectural invariants: server pricing, security, brand design tokens)

## Tasks

<task type="auto">
  <name>Task 1: Create WhatsApp Notification Service in Backend</name>
  <files>
    apps/backend/src/notifications/whatsapp.service.ts
    apps/backend/src/notifications/notifications.module.ts
  </files>
  <action>
    1. Create `apps/backend/src/notifications/whatsapp.service.ts`:
       - Injectable service `WhatsAppService`.
       - Formats luxury streetwear order confirmation text with:
         - Brand header (`BINGOOO.` atelier)
         - Order number (#BNG-XXXXXX)
         - Customer name & delivery city
         - List of items with variant sizing and color
         - Total amount settled & payment method
         - Live tracking link (`https://bingooo-frontend.vercel.app/track-order/:orderNumber`)
       - Async method `sendOrderConfirmation(order: any, customerPhone?: string)`:
         - Cleans and normalizes phone number (strips spaces, handles country code `+91` / international format).
         - Dispatches HTTP POST to WhatsApp Cloud API or configured webhook endpoint if `WHATSAPP_API_TOKEN` & `WHATSAPP_PHONE_NUMBER_ID` or `WHATSAPP_WEBHOOK_URL` are set.
         - Graceful fallback: If no API token is configured, logs the formatted message to logger, records an audit notification in `db.notifications`, and returns `{ success: true, mode: 'simulated_fallback' }`.
         - Non-blocking: wrapped in try-catch so network or provider errors never crash or block order placement.
    2. Export `WhatsAppService` from `NotificationsModule` in `apps/backend/src/notifications/notifications.module.ts`.
  </action>
  <verify>
    npm run typecheck --workspace=@bingooo/api
  </verify>
  <done>
    WhatsAppService compiles cleanly with zero TypeScript errors.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire WhatsApp Service into OrdersService and PaymentsService</name>
  <files>
    apps/backend/src/orders/orders.module.ts
    apps/backend/src/orders/orders.service.ts
    apps/backend/src/payments/payments.module.ts
    apps/backend/src/payments/payments.service.ts
  </files>
  <action>
    1. Update `apps/backend/src/orders/orders.module.ts` to import `NotificationsModule`.
    2. In `apps/backend/src/orders/orders.service.ts`:
       - Inject `WhatsAppService`.
       - In `createOrder()`, trigger `this.whatsAppService.sendOrderConfirmation(order, dto.address.phone)` asynchronously.
    3. Update `apps/backend/src/payments/payments.module.ts` to import `NotificationsModule`.
    4. In `apps/backend/src/payments/payments.service.ts`:
       - Inject `WhatsAppService`.
       - In `verifyPayment()` / webhook payment capture, trigger order confirmation notification upon payment status transition to `'paid'`.
  </action>
  <verify>
    npm run typecheck --workspace=@bingooo/api
  </verify>
  <done>
    Both order creation and payment confirmation reliably invoke WhatsApp dispatch.
  </done>
</task>

<task type="auto">
  <name>Task 3: Enhance Frontend OrderSuccessPage with 1-Click WhatsApp Receipt</name>
  <files>
    apps/frontend/src/pages/OrderSuccessPage.tsx
  </files>
  <action>
    1. In `apps/frontend/src/pages/OrderSuccessPage.tsx`:
       - Add a dedicated WhatsApp confirmation receipt card in the primary action block.
       - Construct pre-filled WhatsApp message containing order number, item summary, total, and direct tracking link.
       - Add button "Receive Order Updates on WhatsApp" with WhatsApp green brand styling and Lucide vector icon.
       - Provide telephone copy/click action allowing user to send receipt directly to their own WhatsApp or Bingooo Concierge (+91 90804 74163).
       - Include haptic feedback on click via `triggerHaptic('light')`.
  </action>
  <verify>
    npm run build:frontend
  </verify>
  <done>
    OrderSuccessPage provides intuitive 1-click WhatsApp confirmation flow.
  </done>
</task>

<task type="auto">
  <name>Task 4: Verification, Typecheck & Ship</name>
  <files>
    .gsd/TODO.md
    .gsd/ROADMAP.md
    .gsd/STATE.md
    task.md
    BRAIN.md
  </files>
  <action>
    1. Run `npm run typecheck` across root and all workspaces.
    2. Verify security and checkout tests: `npm run test:checkout -w apps/backend`.
    3. Update GSD tracking files (`TODO.md`, `ROADMAP.md`, `STATE.md`, `task.md`, `BRAIN.md`).
    4. Commit changes: `feat(notifications): add automated WhatsApp order confirmation and tracking service`.
    5. Update Graphify knowledge graph: `python -m graphify update .`.
  </action>
  <verify>
    npm run typecheck
  </verify>
  <done>
    Zero TypeScript errors, verified test suite, committed and documented.
  </done>
</task>

## Must-Haves
- [ ] Automated backend `WhatsAppService` with templated luxury order confirmation payload
- [ ] Non-blocking execution so external API latencies never slow order placement
- [ ] Safe fallback when third-party credentials are not configured in `.env`
- [ ] Direct WhatsApp confirmation action on `OrderSuccessPage.tsx`
- [ ] 100% clean typecheck across all workspaces

## Success Criteria
- [ ] `npm run typecheck` exits with code 0 across all workspaces
- [ ] Production build succeeds without errors

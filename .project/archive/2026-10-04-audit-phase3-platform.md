# Milestone: Audit Phase 3 — Platform Hygiene

## Context
Follow-up to the 2026-10-01 audit (phases 1–2 shipped). Nothing gates a commit before it
deploys, the frontend/admin `typecheck` scripts check zero files, production deps carry
4 high / 6 moderate advisories, RBAC permission codes on routes don't match the seeded
roles (ADMIN only works through a blanket bypass; Order/Product Manager and Support reach
almost nothing), Swagger is public in production, there are no security headers on the
Vercel apps, and `@capacitor/cli` 7 mismatches `@capacitor/core` 8.

## Scope
IN
1. RBAC vocabulary: route `@Permissions` codes are canonical. Catalog + built-in roles use
   them; a boot-time upgrade (`RolesService.onModuleInit`, versioned) rewrites stored
   built-in roles (prod roles live in `app_records`). Remove the `ADMIN` bypass in
   `RolesGuard` (ADMIN keeps the same effective access, now explicit). Returns:
   `returns.manage` for the queue; moving a return to "refunded" (real money) needs
   `refunds.manage` via a dedicated `POST /returns/:id/refund` route; admin UI calls it.
2. CI: `.github/workflows/ci.yml` — npm ci, typecheck, build, backend suites
   (security, checkout, admin, backup, durability) with dummy secrets.
3. Typecheck scripts: frontend/admin check `tsconfig.app.json` + `tsconfig.node.json`.
4. Dependencies: clear the production advisories (NestJS upgrade within the lowest major
   that is patched) without behaviour change; all suites green.
5. Swagger only when `ENABLE_SWAGGER=true` (off in production by default).
6. Vercel security headers (frontend + admin): nosniff, referrer policy, frame denial,
   permissions policy, and CSP in **Report-Only** mode first so nothing breaks.
7. `@capacitor/cli` aligned to 8.

OUT: enforcing CSP, design-system cleanup (Phase 4), Supabase key rotation.

## Verification
`npm run typecheck` (now real), `npm run build`, all backend suites, local boot of API,
Vercel preview of frontend/admin, CI run green on the branch.

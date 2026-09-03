---
name: never-get-hacked
description: Hardcore cybersecurity and defensive engineering skill to protect code, APIs, databases, authentication, payments, and infrastructure from vulnerabilities, breaches, exploits, and attacks. Use when writing backend endpoints, auth flows, database queries, file uploads, payment integrations, or reviewing code for security vulnerabilities.
---

# Never Get Hacked — Defensive Engineering & Application Security Skill

> **Core Philosophy:** Security is not an afterthought; it is a foundational architectural constraint. Treat every input as malicious, every client as compromised, every secret as sensitive, and every network boundary as untrusted.

---

## 1. Non-Negotiable Security Rules

### 1.1 Secret & Credential Sanitization
- **NEVER hardcode secrets, API keys, private keys, or tokens in source code.**
- Always read secrets from environment variables (`process.env.XYZ` or `ConfigService`).
- Keep `.env`, `.env.local`, and private keys strictly in `.gitignore`.
- In client-side code (Vite / React / Next.js), only expose explicitly prefixed public variables (e.g. `VITE_PUBLIC_` or `NEXT_PUBLIC_`). Never expose Razorpay Key Secrets, database connection strings, or service role keys in frontend bundles.

### 1.2 Authentication & Session Protection
- Hash all passwords using modern, adaptive key derivation algorithms (**Argon2id** or **bcrypt** with a minimum work factor of 12).
- Use HTTP-only, `Secure`, `SameSite=Strict` or `Lax` cookies for web session tokens; avoid storing raw sensitive JWTs in `localStorage` where they are vulnerable to XSS.
- Enforce Multi-Factor Authentication (MFA / 2FA) on all administrative and privileged endpoints.
- Invalidate sessions immediately on password reset, logout, or privilege changes.

### 1.3 Authorization & Granular RBAC (Role-Based Access Control)
- Default to **Deny All**: Every administrative endpoint must require explicit authentication and role/permission guards.
- Never trust client-supplied user IDs or role claims from the request body. Always extract the authenticated subject from the verified server-side JWT or session context.
- Implement object-level authorization (BOLA/IDOR prevention): Ensure the authenticated user actually owns the resource they are trying to read, update, or delete.

### 1.4 Injection & Data Layer Defenses
- **SQL / NoSQL Injection:** Always use parameterized queries, typed ORMs (Prisma, TypeORM, Drizzle), or prepared statements. Never concatenate user strings into SQL queries.
- **Cross-Site Scripting (XSS):** Sanitize all user-rendered content. Use framework-level escaping (React JSX escapes by default). Never use `dangerouslySetInnerHTML` on unescaped or un-sanitized user input.
- **Cross-Site Request Forgery (CSRF):** Enforce SameSite cookie policies and use anti-CSRF tokens on state-modifying POST/PUT/PATCH/DELETE endpoints when using cookie-based auth.

### 1.5 Input Validation & Strict Typing
- Every backend endpoint must validate request payloads using schema validation (**Zod**, **class-validator**, or **Joi**).
- Enable `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true` in NestJS `ValidationPipe` to strip unexpected or malicious properties.
- Impose strict length, format, and boundary checks (e.g., maximum string lengths, regex for alphanumeric slugs, min/max for quantities and prices).

---

## 2. Payment & E-Commerce Security (Razorpay / Stripe)

- **Webhook Signature Verification:** Always verify webhook cryptographic signatures (`x-razorpay-signature` or `stripe-signature`) against the raw request body using HMAC SHA-256 and your webhook secret before processing fulfillment or refunds.
- **Server-Side Price Calculation:** Never allow the frontend to specify the price or total charge amount in a checkout order. Always recalculate the line item prices, discounts, and taxes on the backend from authoritative database records.
- **Idempotency:** Prevent duplicate charges or multiple refund executions by tagging transactions with unique idempotency keys.
- **Audit Trails:** Record immutable audit logs for every sensitive payment state change, refund authorization, or discount modification with actor ID, IP address, and timestamp.

---

## 3. File Upload & Storage Security (Cloudflare R2 / S3)

- Never allow arbitrary file uploads directly to server filesystems.
- Use **Presigned URLs** with short expiration times (e.g. 5–15 minutes) for direct client-to-bucket uploads.
- Validate MIME types both by client extension and magic byte inspection. Allow only safe formats (e.g. `image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
- Never allow executable extensions (`.exe`, `.sh`, `.php`, `.js`, `.html`, `.svg` with embedded scripts).
- Generate random unique UUIDs for stored file keys. Never preserve raw, un-sanitized client filenames.

---

## 4. API & Network Hardening

- **Rate Limiting:** Implement rate limiters (e.g., `@nestjs/throttler` or Cloudflare WAF) on sensitive endpoints: login, OTP requests, password resets, checkout creations, and search.
- **Security Headers (Helmet):** Enforce `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
- **CORS Configuration:** Explicitly whitelist permitted origins. Never use `origin: '*'` on authenticated credentialed endpoints (`credentials: true`).
- **Error Information Disclosure:** Never leak stack traces, database schema details, or internal server errors to clients in production. Return structured error codes with user-friendly messages.

---

## 5. Security Audit Checklist Before Shipping

- [ ] Are all `.env` files and secrets excluded from version control?
- [ ] Are all admin routes guarded by `AuthGuard` and `RolesGuard`?
- [ ] Are all inputs validated with DTOs and validation pipes?
- [ ] Is webhook signature verification enabled on all payment callbacks?
- [ ] Are database operations parameterized against SQL injection?
- [ ] Are presigned upload URLs scoped with MIME restrictions and short timeouts?
- [ ] Are CORS, rate limiting, and Helmet headers active on the backend?
- [ ] Is audit logging recording all financial and access control operations?

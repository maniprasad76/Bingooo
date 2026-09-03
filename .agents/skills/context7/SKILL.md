---
name: context7
description: Context7 Upstash live documentation and backend error resolution expert. Use when diagnosing, troubleshooting, or debugging backend errors, API crashes, database failures, NestJS exceptions, Prisma/Supabase issues, or when needing authoritative library documentation to fix runtime or compile-time bugs.
---

# Context7 — Backend Error Resolution & Live Documentation Skill

> **Purpose:** Rapidly diagnose, isolate, and resolve backend runtime exceptions, compilation errors, and API integration failures by applying Context7 live documentation patterns and deterministic debugging workflows.

---

## 1. Context7 Debugging Protocol

When encountering any backend error, follow this 4-step diagnostic protocol:

```
[Inspect Trace & Error Code] ➔ [Isolate Layer / Component] ➔ [Consult Context7 Specs] ➔ [Apply Minimal Verified Fix]
```

1. **Inspect Full Error Signature:** Read the exact error code, message, stack trace, and HTTP status code. Never guess based on symptoms alone.
2. **Isolate the Faulty Layer:** Determine whether the root cause is:
   - **Network / Transport:** CORS, port collision, timeout, connection refused (`ECONNREFUSED`).
   - **Framework / Dependency Injection:** NestJS module resolution, missing `@Injectable()`, circular dependency.
   - **Validation & Serialization:** DTO validation failure, type mismatch, JSON parsing.
   - **Data Layer:** Database connection pool, Postgres constraint violation, Prisma client mismatch.
   - **External Integration:** Razorpay signature mismatch, Cloudflare R2 S3 signature error.
3. **Reference Authoritative Documentation:** Verify library methods, parameter signatures, and version constraints against Context7 docs instead of outdated model assumptions.
4. **Apply Minimal Verified Fix:** Modify only the necessary code, preserve existing logic, and verify with `npm run typecheck` or test execution.

---

## 2. Common Backend Error Catalog & Solutions

### 2.1 NestJS Framework Errors

#### `Nest can't resolve dependencies of the XService`
- **Root Cause:** A required provider, service, or repository is not exported from its module or imported in the consuming module.
- **Fix:** Ensure the provider's module exports the service, and the consuming module lists that module in its `imports: [...]` array. Check for circular dependencies and use `forwardRef(() => OtherModule)` if unavoidable.

#### `Cannot read properties of undefined (reading 'xyz') in Guard / Interceptor`
- **Root Cause:** Accessing request properties before middleware or guards have attached them, or missing decorator injection.
- **Fix:** Ensure guards are ordered correctly. Extract JWT claims safely with optional chaining: `request.user?.id`.

#### Validation Pipe 400 Bad Request
- **Root Cause:** Incoming payload does not match DTO types or contains extraneous properties when `forbidNonWhitelisted: true` is enabled.
- **Fix:** Update DTO with `@IsString()`, `@IsNumber()`, `@IsOptional()`, or `@Type(() => Number)` from `class-transformer`.

---

### 2.2 Database & Prisma / Postgres Errors

#### Prisma `P2002: Unique constraint failed on the fields: (...)`
- **Root Cause:** Attempting to insert a duplicate record for a field with a unique index (e.g. email, SKU, slug).
- **Fix:** Implement upsert (`upsert`) or check for existing record before creation, and return a clean HTTP 409 Conflict.

#### Prisma `P2025: An operation failed because it depends on one or more records that were not found`
- **Root Cause:** Deleting or updating a record by an ID that does not exist in the database.
- **Fix:** Wrap in `try/catch` or use `findUnique` first; throw NestJS `NotFoundException` if missing.

#### Supabase `new row violates row-level security policy for table "xyz"`
- **Root Cause:** The database query is executed with the client/anon key and the RLS policy denies access to the current authenticated role.
- **Fix:** For administrative backend tasks, use the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS, or ensure the RLS policy explicitly permits `auth.uid() = user_id`.

---

### 2.3 Payments & Razorpay Gateway Errors

#### `BAD_REQUEST_ERROR: Amount must be an integer (in paise)`
- **Root Cause:** Sending decimal rupee amounts (e.g. `999.50`) instead of integer paise (`99950`).
- **Fix:** Always multiply by 100 and round: `Math.round(amount * 100)`.

#### `Signature verification failed` on Webhook
- **Root Cause:** Verifying against parsed JSON instead of the raw request payload buffer, or using the wrong secret.
- **Fix:** Capture the raw request body buffer in NestJS using `rawBody: true` in `NestFactory.create(AppModule, { rawBody: true })` and verify HMAC SHA256 against `req.rawBody`.

---

### 2.4 Cloudflare R2 / AWS S3 Storage Errors

#### `SignatureDoesNotMatch` on Presigned Upload
- **Root Cause:** The HTTP headers sent by the client (such as `Content-Type`) do not exactly match the headers specified during presigning.
- **Fix:** Ensure client `fetch(presignedUrl, { headers: { 'Content-Type': file.type } })` matches the exact MIME type passed to `PutObjectCommand`.

#### `AccessDenied` on R2 Bucket
- **Root Cause:** R2 token lacks `Object Read & Write` permissions, or bucket name is misspelled.
- **Fix:** Check `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` permissions in Cloudflare dashboard; ensure endpoint is `https://<account_id>.r2.cloudflarestorage.com`.

---

## 3. Context7 MCP Tool Usage

When Context7 MCP server is connected:
- **`resolve-library-id`**: Resolve package names to canonical Context7 identifiers (e.g. `@nestjs/core`, `@prisma/client`, `@supabase/supabase-js`).
- **`get-library-docs`**: Fetch exact version documentation, API references, and code examples.

### Example MCP Server Configuration (`mcp_config.json`):
```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

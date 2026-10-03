import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { RequestIdInterceptor } from '../src/common/interceptors/request-id.interceptor';
import { db } from '../src/common/database/store';
import { backupService } from '../src/common/services/backup.service';
import { generateToken, hashPassword } from '../src/common/utils/crypto.util';
import { getDataDir } from '../src/common/utils/paths.util';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, passed: true });
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    results.push({ suite, name, passed: false, details });
    console.error(`  ❌ [FAIL] ${name} — ${details || 'Assertion failed'}`);
  }
}

async function runSecuritySuite() {
  console.log('\n======================================================');
  console.log('🔒 BINGOOO SECURITY & ISOLATION VERIFICATION SUITE');
  console.log('======================================================\n');

  const app = await NestFactory.create(AppModule, { logger: false });
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1', {
    exclude: ['api/create-order', 'api/verify-payment'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor(), new ResponseInterceptor());

  const TEST_PORT = 3991;
  await app.listen(TEST_PORT);
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    // ═════════════════════════════════════════════════════════════════════
    // SUITE 1: SECURE AUTH SESSIONS & CRYPTO
    // ═════════════════════════════════════════════════════════════════════
    console.log('📦 SUITE 1: Secure Auth Sessions & Lifecycle');

    // 1.1 Password policy validation (Minimum 8 chars)
    const weakPassRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'weakpass@test.com',
        password: 'short',
        fullName: 'Weak Password Tester',
      }),
    });
    assert(
      weakPassRes.status === 400,
      'Auth Sessions',
      'Rejects weak passwords under 8 characters with HTTP 400',
      `Got status ${weakPassRes.status}`,
    );

    // 1.2 User A registration
    const userAEmail = `user_a_${Date.now()}@example.com`;
    const signupARes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: 'StrongPassword123!',
        fullName: 'Alice Walker',
        phone: '+919999900001',
      }),
    });
    const signupAData = await signupARes.json();
    assert(
      signupARes.status === 201 && signupAData?.data?.token,
      'Auth Sessions',
      'User A registers and receives signed JWT session',
    );
    const tokenA = signupAData?.data?.token;
    const userAId = signupAData?.data?.user?.id;

    // Check HTTP-only cookie in response header
    const setCookieHeader = signupARes.headers.get('set-cookie');
    assert(
      !!setCookieHeader && setCookieHeader.includes('access_token='),
      'Auth Sessions',
      'Auth sets secure HTTP-Only session cookie',
    );

    // 1.3 User B registration
    const userBEmail = `user_b_${Date.now()}@example.com`;
    const signupBRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        password: 'StrongPassword456!',
        fullName: 'Bob Smith',
        phone: '+919999900002',
      }),
    });
    const signupBData = await signupBRes.json();
    const tokenB = signupBData?.data?.token;
    const userBId = signupBData?.data?.user?.id;
    assert(
      signupBRes.status === 201 && !!tokenB,
      'Auth Sessions',
      'User B registers with independent credentials',
    );

    // 1.4 Tampered JWT detection
    const tamperedToken = tokenA.slice(0, -6) + 'XXXXXX';
    const tamperedRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    });
    assert(
      tamperedRes.status === 401,
      'Auth Sessions',
      'Cryptographically detects tampered/forged JWT signature (HTTP 401)',
      `Got status ${tamperedRes.status}`,
    );

    // 1.5 Session Logout & Revocation
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(
      logoutRes.status === 200,
      'Auth Sessions',
      'User A logs out and session is terminated',
    );

    // Attempt to reuse revoked token
    const revokedUseRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(
      revokedUseRes.status === 401,
      'Auth Sessions',
      'Reusing revoked/logged out session token is strictly rejected (HTTP 401)',
      `Got status ${revokedUseRes.status}`,
    );

    // Re-login User A to obtain fresh session for isolation tests
    const loginARes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: 'StrongPassword123!',
      }),
    });
    const loginAData = await loginARes.json();
    const activeTokenA = loginAData?.data?.token;

    // ═════════════════════════════════════════════════════════════════════
    // SUITE 2: TEST USER ISOLATION (BOLA / IDOR)
    // ═════════════════════════════════════════════════════════════════════
    console.log('\n📦 SUITE 2: User Isolation & Object-Level Authorization (BOLA/IDOR)');

    // 2.1 Unauthenticated requests to user resources are rejected
    const unauthOrdersRes = await fetch(`${BASE_URL}/orders`);
    assert(
      unauthOrdersRes.status === 401,
      'User Isolation',
      'Anonymous caller cannot access orders (HTTP 401)',
    );

    const unauthAddressesRes = await fetch(`${BASE_URL}/users/addresses`);
    assert(
      unauthAddressesRes.status === 401,
      'User Isolation',
      'Anonymous caller cannot access addresses (HTTP 401)',
    );

    // 2.2 Address isolation: User A adds address
    const addAddrARes = await fetch(`${BASE_URL}/users/addresses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeTokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Alice Home',
        phone: '+919999900001',
        line1: '123 Fashion Blvd',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      }),
    });
    const addrAData = await addAddrARes.json();
    const addrAId = addrAData?.data?.id;
    assert(
      addAddrARes.status === 201 && !!addrAId,
      'User Isolation',
      "User A adds saved delivery address",
    );

    // User B fetches addresses -> must NOT see User A's address
    const getAddrBRes = await fetch(`${BASE_URL}/users/addresses`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const addrBData = await getAddrBRes.json();
    assert(
      addrBData?.data?.length === 0,
      'User Isolation',
      "User B cannot see User A's saved addresses (Strict Isolation)",
    );

    // User B attempts to delete User A's address -> must NOT delete it
    await fetch(`${BASE_URL}/users/addresses/${addrAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const checkAddrARes = await fetch(`${BASE_URL}/users/addresses`, {
      headers: { Authorization: `Bearer ${activeTokenA}` },
    });
    const checkAddrAData = await checkAddrARes.json();
    assert(
      checkAddrAData?.data?.some((a: any) => a.id === addrAId),
      'User Isolation',
      "User B cannot delete User A's address (IDOR Prevention)",
    );

    // 2.3 Orders Isolation: User A adds item to cart and places an order
    const realVariantId = db.product_variants[0].id;
    const addCartRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeTokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variantId: realVariantId,
        quantity: 1,
      }),
    });
    const cartData = await addCartRes.json();
    const cartId = cartData?.data?.id;

    const placeOrderARes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeTokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartId,
        paymentMethod: 'prepaid',
        shippingAddress: {
          name: 'Alice Walker',
          phone: '+919999900001',
          line1: '123 Fashion Blvd',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'IN',
        },
      }),
    });
    const orderAData = await placeOrderARes.json();
    const orderANumber = orderAData?.data?.order_number;
    const orderAId = orderAData?.data?.id;
    assert(
      placeOrderARes.status === 201 && !!orderANumber,
      'User Isolation',
      `User A creates order successfully (${orderANumber})`,
      `Got status ${placeOrderARes.status}: ${JSON.stringify(orderAData)}`,
    );

    // User B lists their orders -> must NOT contain User A's order
    const listOrdersBRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const listOrdersBData = await listOrdersBRes.json();
    assert(
      !listOrdersBData?.data?.some((o: any) => o.id === orderAId),
      'User Isolation',
      "User B cannot list User A's orders in customer order history",
    );

    // User B tries to view User A's order by ID / orderNumber (BOLA attack)
    const directAccessRes = await fetch(`${BASE_URL}/orders/${orderANumber}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(
      directAccessRes.status === 403,
      'User Isolation',
      "User B querying User A's order number is blocked with HTTP 403 Forbidden (BOLA Blocked)",
      `Got status ${directAccessRes.status}`,
    );

    // User A can access their own order
    const ownOrderRes = await fetch(`${BASE_URL}/orders/${orderANumber}`, {
      headers: { Authorization: `Bearer ${activeTokenA}` },
    });
    assert(
      ownOrderRes.status === 200,
      'User Isolation',
      'User A successfully accesses their own order details (HTTP 200)',
    );

    // 2.4 Customer cannot access admin operations
    const adminOrdersRes = await fetch(`${BASE_URL}/orders/admin/all`, {
      headers: { Authorization: `Bearer ${activeTokenA}` },
    });
    assert(
      adminOrdersRes.status === 403,
      'User Isolation',
      'Standard customer cannot access admin order operations (HTTP 403 Forbidden)',
    );

    // 2.5 Wishlist Isolation
    await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeTokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'prod-designer-suit' }),
    });

    const wishlistBRes = await fetch(`${BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const wishlistBData = await wishlistBRes.json();
    assert(
      wishlistBData?.data?.length === 0,
      'User Isolation',
      "User B's wishlist remains empty and isolated from User A's wishlist",
    );

    // ═════════════════════════════════════════════════════════════════════
    // SUITE 4: AUDIT REGRESSIONS (RBAC, PAYMENTS, BACKUPS, IDENTITY)
    // ═════════════════════════════════════════════════════════════════════
    console.log('\n📦 SUITE 4: Audit Regressions');
    // Let the 10s burst window from suites 1-2 drain so these checks never see 429s
    await new Promise((r) => setTimeout(r, 10500));

    const bearer = (token: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    // A third account created directly in the store (signup is rate limited)
    const userCId = `sec-user-c-${Date.now()}`;
    const userCEmail = `user_c_${Date.now()}@example.com`;
    db.users.push({
      id: userCId,
      email: userCEmail,
      password_hash: hashPassword('IntruderPassword789!'),
      full_name: 'Carol Intruder',
      phone: '',
      role: 'CUSTOMER',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 4.1 RBAC default-deny: a plain customer cannot reach admin/backup/audit routes
    const custSettingsRes = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: bearer(tokenB),
      body: JSON.stringify({ prepaid_discount_percentage: 100 }),
    });
    assert(
      custSettingsRes.status === 403 && db.settings.prepaid_discount_percentage !== 100,
      'Audit Regressions',
      'Customer is blocked (403) from changing store settings',
      `Got status ${custSettingsRes.status}`,
    );

    const custDashRes = await fetch(`${BASE_URL}/admin/dashboard`, { headers: bearer(tokenB) });
    assert(
      custDashRes.status === 403,
      'Audit Regressions',
      'Customer is blocked (403) from the admin dashboard',
      `Got status ${custDashRes.status}`,
    );

    const custBackupRes = await fetch(`${BASE_URL}/admin/backups`, {
      method: 'POST',
      headers: bearer(tokenB),
      body: JSON.stringify({ label: '/../../escape' }),
    });
    assert(
      custBackupRes.status === 403,
      'Audit Regressions',
      'Customer is blocked (403) from creating/restoring backups',
      `Got status ${custBackupRes.status}`,
    );

    const anonAuditRes = await fetch(`${BASE_URL}/audit`);
    assert(
      anonAuditRes.status === 401,
      'Audit Regressions',
      'Audit trail requires authentication (401 when anonymous)',
      `Got status ${anonAuditRes.status}`,
    );

    // 4.2 Backup label cannot traverse out of the backups directory
    const traversalBackup = backupService.createBackup('/../../escape');
    const traversalPath = path.join(getDataDir(), 'backups', traversalBackup.filename);
    assert(
      !/[\\/]/.test(traversalBackup.filename) && fs.existsSync(traversalPath),
      'Audit Regressions',
      `Backup label is sanitised to a filename inside backups/ (${traversalBackup.filename})`,
    );
    if (fs.existsSync(traversalPath)) fs.unlinkSync(traversalPath);

    // 4.3 Reviews are bound to the authenticated caller
    const anonReviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'any', rating: 5, userId: userAId }),
    });
    const anonMyReviewsRes = await fetch(`${BASE_URL}/reviews/my?userId=${userAId}`);
    assert(
      anonReviewRes.status === 401 && anonMyReviewsRes.status === 401,
      'Audit Regressions',
      "Anonymous callers cannot post reviews or read another user's reviews (401)",
      `Got ${anonReviewRes.status} / ${anonMyReviewsRes.status}`,
    );

    // 4.4 Payment capture: a valid signature for one Razorpay order cannot settle another order
    const anonRzpRes = await fetch(`${BASE_URL}/payments/razorpay/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100 }),
    });
    const amountOnlyRes = await fetch(`${BASE_URL}/payments/razorpay/order`, {
      method: 'POST',
      headers: bearer(tokenB),
      body: JSON.stringify({ amount: 100 }),
    });
    assert(
      anonRzpRes.status === 401 && amountOnlyRes.status === 400,
      'Audit Regressions',
      'Razorpay orders require login and a real orderId (no free-floating ₹1 orders)',
      `Got ${anonRzpRes.status} / ${amountOnlyRes.status}`,
    );

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.warn('  ⚠️  RAZORPAY_KEY_SECRET not set — skipping signature-binding checks');
    } else {
      const stamp = Date.now();
      const victimOrderId = `sec-order-${stamp}`;
      db.orders.push({
        id: victimOrderId,
        order_number: `SEC-${stamp}`,
        user_id: userBId,
        status: 'pending_payment',
        payment_status: 'pending',
        payment_method: 'prepaid',
        total: 5000,
      });
      const victimPayment = {
        id: `sec-pay-${stamp}`,
        order_id: victimOrderId,
        provider: 'razorpay',
        provider_order_id: `order_sec_victim_${stamp}`,
        status: 'pending',
        amount: 5000,
      };
      db.payments.push(victimPayment);

      const sign = (orderId: string, paymentId: string) =>
        crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');

      // Signature is genuinely valid, but for a cheap Razorpay order unrelated to the victim order
      const cheapRzpOrder = `order_sec_cheap_${stamp}`;
      const crossOrderRes = await fetch(`${BASE_URL}/payments/razorpay/verify`, {
        method: 'POST',
        headers: bearer(tokenB),
        body: JSON.stringify({
          orderId: victimOrderId,
          razorpay_order_id: cheapRzpOrder,
          razorpay_payment_id: 'pay_sec_cheap',
          razorpay_signature: sign(cheapRzpOrder, 'pay_sec_cheap'),
        }),
      });
      const victim = db.orders.find((o) => o.id === victimOrderId);
      assert(
        crossOrderRes.status === 400 && victim?.payment_status === 'pending',
        'Audit Regressions',
        'A ₹1 payment signature cannot capture a different order',
        `Got ${crossOrderRes.status}, victim payment_status=${victim?.payment_status}`,
      );

      // A forged signature must not mutate the payment record
      await fetch(`${BASE_URL}/payments/razorpay/verify`, {
        method: 'POST',
        headers: bearer(tokenB),
        body: JSON.stringify({
          razorpay_order_id: victimPayment.provider_order_id,
          razorpay_payment_id: 'pay_forged',
          razorpay_signature: 'f'.repeat(64),
        }),
      });
      assert(
        victimPayment.status === 'pending',
        'Audit Regressions',
        'A forged signature cannot mark another payment as failed',
        `payment.status=${victimPayment.status}`,
      );

      // Another signed-in user cannot settle User B's order even with a valid signature
      const intruderToken = generateToken({ userId: userCId, email: userCEmail, role: 'CUSTOMER' }).token;
      const intruderRes = await fetch(`${BASE_URL}/payments/razorpay/verify`, {
        method: 'POST',
        headers: bearer(intruderToken),
        body: JSON.stringify({
          razorpay_order_id: victimPayment.provider_order_id,
          razorpay_payment_id: 'pay_sec_intruder',
          razorpay_signature: sign(victimPayment.provider_order_id, 'pay_sec_intruder'),
        }),
      });
      assert(
        intruderRes.status === 400 && victimPayment.status === 'pending',
        'Audit Regressions',
        "Payments can only be verified by the order's owner",
        `Got ${intruderRes.status}, payment.status=${victimPayment.status}`,
      );

      db.payments = db.payments.filter((p) => p.order_id !== victimOrderId);
      db.orders = db.orders.filter((o) => o.id !== victimOrderId);
    }

    // 4.5 Supabase identity: super-admin requires a confirmed email listed in ADMIN_EMAILS
    const realFetch = globalThis.fetch;
    const savedEnv: Record<string, string | undefined> = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    };
    const fakeSupabaseHost = 'https://supabase.security-suite.test';
    const fakeAdminEmail = 'owner@security-suite.test';
    process.env.SUPABASE_URL = fakeSupabaseHost;
    process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'security-suite-anon-key';
    process.env.ADMIN_EMAILS = fakeAdminEmail;
    const fakeSupabaseUsers: Record<string, any> = {
      'sb-unconfirmed-admin': { id: `sb-u-${Date.now()}`, email: fakeAdminEmail, email_confirmed_at: null },
      'sb-confirmed-admin': { id: `sb-c-${Date.now()}`, email: fakeAdminEmail, email_confirmed_at: new Date().toISOString() },
      'sb-unconfirmed-takeover': { id: `sb-t-${Date.now()}`, email: userBEmail, email_confirmed_at: null },
    };
    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input?.url;
      if (typeof url === 'string' && url.startsWith(`${fakeSupabaseHost}/auth/v1/user`)) {
        const auth = new Headers(init?.headers).get('Authorization') || '';
        const user = fakeSupabaseUsers[auth.replace('Bearer ', '')];
        return new Response(JSON.stringify(user || {}), { status: user ? 200 : 401 });
      }
      return realFetch(input, init);
    }) as typeof fetch;
    try {
      const unconfirmedAdminRes = await fetch(`${BASE_URL}/admin/settings`, {
        headers: bearer('sb-unconfirmed-admin'),
      });
      assert(
        unconfirmedAdminRes.status === 403,
        'Audit Regressions',
        'An unconfirmed Supabase email on the admin list does NOT get super-admin',
        `Got status ${unconfirmedAdminRes.status}`,
      );
      // Drop the customer record that request created so the confirmed check starts clean
      db.users = db.users.filter((u) => u.email !== fakeAdminEmail);

      const confirmedAdminRes = await fetch(`${BASE_URL}/admin/settings`, {
        headers: bearer('sb-confirmed-admin'),
      });
      assert(
        confirmedAdminRes.status === 200,
        'Audit Regressions',
        'A confirmed Supabase email listed in ADMIN_EMAILS gets admin access',
        `Got status ${confirmedAdminRes.status}`,
      );

      const takeoverRes = await fetch(`${BASE_URL}/auth/me`, { headers: bearer('sb-unconfirmed-takeover') });
      assert(
        takeoverRes.status === 401,
        'Audit Regressions',
        'An unconfirmed Supabase signup cannot take over an existing account by email',
        `Got status ${takeoverRes.status}`,
      );
    } finally {
      globalThis.fetch = realFetch;
      for (const [key, value] of Object.entries(savedEnv)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      db.users = db.users.filter((u) => u.email !== fakeAdminEmail);
    }

    // 4.6 Suspended accounts and password changes invalidate existing sessions
    const userC = db.users.find((u) => u.id === userCId)!;
    const userCToken = generateToken({ userId: userCId, email: userCEmail, role: 'CUSTOMER' }).token;
    userC.status = 'suspended';
    const suspendedRes = await fetch(`${BASE_URL}/auth/me`, { headers: bearer(userCToken) });
    userC.status = 'active';
    assert(
      suspendedRes.status === 401,
      'Audit Regressions',
      'Suspended accounts are rejected even with an unexpired token',
      `Got status ${suspendedRes.status}`,
    );

    // Tokens are second-granular: make sure the password change lands in a later second
    await new Promise((r) => setTimeout(r, 1100));
    const changePwRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: bearer(userCToken),
      body: JSON.stringify({ currentPassword: 'IntruderPassword789!', newPassword: 'IntruderPassword790!' }),
    });
    const afterChangeRes = await fetch(`${BASE_URL}/auth/me`, { headers: bearer(userCToken) });
    assert(
      (changePwRes.status === 200 || changePwRes.status === 201) && afterChangeRes.status === 401,
      'Audit Regressions',
      'Changing the password revokes previously issued tokens',
      `Got change=${changePwRes.status}, reuse=${afterChangeRes.status}`,
    );
    db.users = db.users.filter((u) => u.id !== userCId);

    // ═════════════════════════════════════════════════════════════════════
    // SUITE 3: RATE LIMITING & BRUTE FORCE DEFENSE
    // ═════════════════════════════════════════════════════════════════════
    console.log('\n📦 SUITE 3: Rate Limiting & DoS Defense');

    // Throttler is configured with 5 requests/minute on /auth/login
    // We send rapid concurrent bursts to test rate limiting
    console.log('  Testing rapid request burst against throttled endpoint (/auth/login)...');
    const burstRequests = [];
    for (let i = 0; i < 7; i++) {
      burstRequests.push(
        fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userAEmail,
            password: 'StrongPassword123!',
          }),
        }),
      );
    }

    const burstResponses = await Promise.all(burstRequests);
    const statuses = burstResponses.map((r) => r.status);
    const rateLimitedCount = statuses.filter((s) => s === 429).length;

    assert(
      rateLimitedCount > 0,
      'Rate Limiting',
      `Rate limiter triggers HTTP 429 Too Many Requests on burst traffic (${rateLimitedCount} requests throttled)`,
      `Observed response statuses: ${statuses.join(', ')}`,
    );

    // Test coupon code brute-force defense (/coupons/validate)
    console.log('  Testing coupon code brute-force defense (/coupons/validate)...');
    const couponRequests = [];
    for (let i = 0; i < 14; i++) {
      couponRequests.push(
        fetch(`${BASE_URL}/coupons/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: `DISCOUNT_${i}`, orderSubtotal: 1000 }),
        }),
      );
    }
    const couponResponses = await Promise.all(couponRequests);
    const couponStatuses = couponResponses.map((r) => r.status);
    const couponThrottled = couponStatuses.filter((s) => s === 429).length;

    assert(
      couponThrottled > 0,
      'Rate Limiting',
      `Anti-coupon brute-force throttles rapid enumeration with HTTP 429 (${couponThrottled} requests blocked)`,
      `Observed response statuses: ${couponStatuses.join(', ')}`,
    );

    console.log('\n======================================================');
    const totalPassed = results.filter((r) => r.passed).length;
    const totalFailed = results.filter((r) => !r.passed).length;
    console.log(`SUMMARY: ${totalPassed} passed, ${totalFailed} failed out of ${results.length} tests`);
    console.log('======================================================\n');

    if (totalFailed > 0) {
      process.exit(1);
    }
  } finally {
    await app.close();
  }
}

runSecuritySuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

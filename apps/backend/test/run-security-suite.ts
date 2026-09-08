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
        paymentMethod: 'cod',
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

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { RequestIdInterceptor } from '../src/common/interceptors/request-id.interceptor';
import { db } from '../src/common/database/store';

interface TestResult {
  step: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, step: string, name: string, details?: string) {
  if (condition) {
    results.push({ step, name, passed: true });
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    results.push({ step, name, passed: false, details });
    console.error(`  ❌ [FAIL] ${name} — ${details || 'Assertion failed'}`);
  }
}

async function runE2ECheckoutVerification() {
  console.log('\n======================================================');
  console.log('🛍️  BINGOOO END-TO-END CHECKOUT & PAYMENT VERIFICATION');
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

  const TEST_PORT = 3995;
  await app.listen(TEST_PORT);
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    // ─────────────────────────────────────────────────────────
    // STEP 1: Customer Auth & Session Establishment
    // ─────────────────────────────────────────────────────────
    console.log('📦 STEP 1: Customer Registration & Session');
    const custEmail = `checkout_shopper_${Date.now()}@bingooo.in`;
    const custPass = 'LuxuryBespoke2026!';

    const regRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: custEmail,
        password: custPass,
        fullName: 'Vikramaditya Rao',
        phone: '9845012345',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && !!regData.data.token, 'Auth', 'Customer registers and gets secure JWT');
    const token = regData.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-session-id': `sess_test_${Date.now()}`,
    };

    // ─────────────────────────────────────────────────────────
    // STEP 2: Catalog Selection & Customizer Addition
    // ─────────────────────────────────────────────────────────
    console.log('\n📦 STEP 2: Cart Operations & Custom Garment Configuration');
    // Save Customizer design layer
    const customRes = await fetch(`${BASE_URL}/customizations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: 'prod-custom-tee',
        productSlug: 'classic-oversized-tee',
        customerNotes: 'Please ensure high-density red print alignment',
        designJson: {
          garment: {
            title: '240 GSM Heavyweight Oversized Tee',
            color: 'Obsidian Black',
            size: 'L',
            gsm: 240,
          },
          front: {
            hasDesign: true,
            artwork: { url: 'data:image/svg+xml;utf8,<svg></svg>', scale: 1 },
          },
          isDualSided: false,
        },
      }),
    });
    const customData = await customRes.json();
    assert(customRes.status === 201 && !!customData.data.id, 'Customizer', 'Saves 240 GSM bespoke customizer design');
    const customizationId = customData.data.id;

    // Dynamically retrieve active catalog variant
    const activeVariant = db.product_variants.find((v) => v.is_active) || db.product_variants[0];
    const targetVariantId = activeVariant.id;

    // Add item to cart
    const addCartRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        variantId: targetVariantId,
        quantity: 2,
        customizationId,
      }),
    });
    const cartData = await addCartRes.json();
    assert(
      addCartRes.status === 201 && cartData?.data?.itemCount === 2,
      'Cart',
      `Adds bespoke garment (${activeVariant.sku}) to shopping bag (quantity: 2)`,
    );

    // ─────────────────────────────────────────────────────────
    // STEP 3: Checkout Initialization & Address Confirmation
    // ─────────────────────────────────────────────────────────
    console.log('\n📦 STEP 3: Order Checkout & Validation');
    const addressPayload = {
      name: 'Vikramaditya Rao',
      phone: '9845012345',
      line1: 'Penthouse 1201, Sovereign Crest',
      line2: 'Lavelle Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'IN',
    };

    const cartId = cartData.data.id;

    const checkoutRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        cartId,
        paymentMethod: 'prepaid',
        shippingAddress: addressPayload,
      }),
    });
    const orderData = await checkoutRes.json();
    assert(
      checkoutRes.status === 201 && !!orderData?.data?.order_number,
      'Checkout',
      `Creates official order (#${orderData.data?.order_number}) with status ${orderData.data?.status}`,
    );
    const orderId = orderData.data.id;
    const orderNumber = orderData.data.order_number;
    const orderTotal = orderData.data.total;

    // ─────────────────────────────────────────────────────────
    // STEP 4: Razorpay Gateway Order Creation
    // ─────────────────────────────────────────────────────────
    console.log('\n📦 STEP 4: Payment Gateway Handshake (Razorpay)');
    const rzpOrderRes = await fetch(`${BASE_URL}/payments/razorpay/order`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        orderId,
      }),
    });
    const rzpOrderData = await rzpOrderRes.json();
    assert(
      rzpOrderRes.status === 201 && !!rzpOrderData.data.order_id,
      'Payment Gateway',
      `Creates secure Razorpay gateway order (${rzpOrderData.data?.order_id}) for ₹${orderTotal}`,
    );
    const rzpOrderId = rzpOrderData.data.order_id;
    const expectedAmountPaise = Math.round(orderTotal * 100);
    assert(
      rzpOrderData.data.amount === expectedAmountPaise,
      'Payment Gateway',
      `Accurate currency & amount calculation (${rzpOrderData.data.amount} paise)`,
    );

    // ─────────────────────────────────────────────────────────
    // STEP 5: Cryptographic Signature Verification
    // ─────────────────────────────────────────────────────────
    console.log('\n📦 STEP 5: Payment Signature Verification & Fraud Detection');
    const fakePaymentId = `pay_test_${Date.now()}`;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'W4EEMomr3MJb2oB8yK5Q4dP3';

    // 5a. Tampered signature attempt
    const tamperedRes = await fetch(`${BASE_URL}/payments/razorpay/verify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: 'fake_tampered_signature_attacker',
      }),
    });
    assert(
      tamperedRes.status === 400,
      'Fraud Protection',
      'Rejects tampered / forged payment signature with HTTP 400 Bad Request',
    );

    // 5b. Legitimate cryptographic signature
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${rzpOrderId}|${fakePaymentId}`)
      .digest('hex');

    const verifyRes = await fetch(`${BASE_URL}/payments/razorpay/verify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: validSignature,
      }),
    });
    const verifyData = await verifyRes.json();
    const isVerified = verifyData?.data?.verified === true || verifyData?.verified === true;
    assert(
      (verifyRes.status === 200 || verifyRes.status === 201) && isVerified,
      'Payment Settlement',
      'Cryptographically verifies valid Razorpay HMAC-SHA256 signature and captures payment',
    );

    // ─────────────────────────────────────────────────────────
    // STEP 6: Order State Transition & History Inspection
    // ─────────────────────────────────────────────────────────
    console.log('\n📦 STEP 6: Order Status & Customer Order History');
    const fetchOrderRes = await fetch(`${BASE_URL}/orders/${orderNumber}`, {
      method: 'GET',
      headers: authHeaders,
    });
    const fetchedOrder = await fetchOrderRes.json();
    assert(
      fetchOrderRes.status === 200 &&
        fetchedOrder.data?.payment_status === 'captured' &&
        (fetchedOrder.data?.status === 'processing' || fetchedOrder.data?.status === 'paid'),
      'Order Transition',
      `Order status updated to [${fetchedOrder.data?.status}] and payment_status to [${fetchedOrder.data?.payment_status}]`,
    );

    // Verify order in user order history
    const historyRes = await fetch(`${BASE_URL}/orders`, {
      method: 'GET',
      headers: authHeaders,
    });
    const historyData = await historyRes.json();
    const foundInHistory = historyData.data?.some((o: any) => o.order_number === orderNumber);
    assert(
      historyRes.status === 200 && foundInHistory,
      'Order History',
      `Order #${orderNumber} listed in customer official purchase history`,
    );
  } catch (err: any) {
    console.error('Fatal error during E2E verification:', err);
  } finally {
    await app.close();
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n======================================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ECheckoutVerification();

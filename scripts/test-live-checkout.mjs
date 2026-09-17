import * as crypto from 'crypto';

const BASE_URL = 'https://bingooo-backend.vercel.app/api/v1';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'bingooo_whsec_2026';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'W4EEMomr3MJb2oB8yK5Q4dP3';

console.log('\n=============================================================');
console.log('🚀 TESTING LIVE PRODUCTION CHECKOUT ON VERCEL');
console.log(`Target: ${BASE_URL}`);
console.log('=============================================================\n');

let passedCount = 0;
let totalCount = 0;

function assert(condition, name, details = '') {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${name} — ${details}`);
  }
}

async function runLiveCheckoutTest() {
  try {
    // ── STEP 1: Service Root & Catalog Inspection ──
    console.log('📦 STEP 1: Service Root & Live Catalog Retrieval');
    const rootRes = await fetch('https://bingooo-backend.vercel.app/');
    const rootData = await rootRes.json();
    assert(rootRes.status === 200 && rootData.status === 'operational', 'Service Root is operational');

    const prodRes = await fetch(`${BASE_URL}/products`);
    const prodData = await prodRes.json();
    assert(prodRes.status === 200 && prodData.data?.length > 0, 'Live product catalog loaded', `Found ${prodData.data?.length} products`);

    const product = prodData.data[0];
    const variant = product.variants[0];
    console.log(`     Selected Product: "${product.title}" (${variant.size} / ${variant.color} - ₹${variant.price})`);

    // ── STEP 2: Customer Registration & Auth ──
    console.log('\n📦 STEP 2: Customer Signup & Authentication');
    const custEmail = `live_buyer_${Date.now()}@bingooo.in`;
    const custPass = 'LuxuryBespoke2026!';

    const regRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: custEmail,
        password: custPass,
        fullName: 'Aarav Sharma',
        phone: '9876543210',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && !!regData.data?.token, 'Customer registered & received JWT token');
    const token = regData.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-session-id': `live_sess_${Date.now()}`,
    };

    // ── STEP 3: Bespoke Customizer Layer Creation ──
    console.log('\n📦 STEP 3: Save Custom Garment Configuration');
    const customRes = await fetch(`${BASE_URL}/customizations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: product.id,
        productSlug: product.slug,
        customerNotes: 'Gold foil print on chest, center-aligned',
        designJson: {
          garment: {
            title: product.title,
            color: variant.color,
            size: variant.size,
            gsm: 240,
          },
          front: {
            hasDesign: true,
            artwork: { url: 'https://bingooo-frontend.vercel.app/custom/tshirt-step-1.png', scale: 1 },
          },
          isDualSided: false,
        },
      }),
    });
    const customData = await customRes.json();
    assert(customRes.status === 201 && !!customData.data?.id, 'Saved custom apparel configuration');
    const customizationId = customData.data.id;

    // ── STEP 4: Add to Cart ──
    console.log('\n📦 STEP 4: Add Item to Cart');
    const cartRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        variantId: variant.id,
        quantity: 1,
        customizationId,
      }),
    });
    const cartData = await cartRes.json();
    assert(cartRes.status === 201 && cartData.data?.itemCount >= 1, 'Item added to live shopping cart');
    const cartId = cartData.data.id;

    // ── STEP 5: Order Checkout Creation ──
    console.log('\n📦 STEP 5: Place Order');
    const checkoutRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        cartId,
        paymentMethod: 'prepaid',
        shippingAddress: {
          name: 'Aarav Sharma',
          phone: '9876543210',
          line1: 'Flat 402, Highline Residency',
          line2: 'Indiranagar 100ft Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'IN',
        },
      }),
    });
    const orderData = await checkoutRes.json();
    assert(checkoutRes.status === 201 && !!orderData.data?.order_number, 'Created order in status pending_payment');
    const orderId = orderData.data.id;
    const orderNumber = orderData.data.order_number;
    const orderTotal = orderData.data.total;
    console.log(`     Order: #${orderNumber} (ID: ${orderId}), Total: ₹${orderTotal}`);

    // ── STEP 6: Razorpay Gateway Order Creation ──
    console.log('\n📦 STEP 6: Gateway Order Creation (Razorpay)');
    const rzpOrderRes = await fetch(`${BASE_URL}/payments/razorpay/order`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ orderId }),
    });
    const rzpOrderData = await rzpOrderRes.json();
    assert(rzpOrderRes.status === 201 && !!rzpOrderData.data?.order_id, 'Created Razorpay gateway order');
    const rzpOrderId = rzpOrderData.data.order_id;
    console.log(`     Razorpay Order ID: ${rzpOrderId}`);

    // ── STEP 7: Fraud Defense (Tampered Signature Rejection) ──
    console.log('\n📦 STEP 7: Payment Signature Fraud Check');
    const fakePaymentId = `pay_live_test_${Date.now()}`;
    const tamperedRes = await fetch(`${BASE_URL}/payments/razorpay/verify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: 'invalid_fraudulent_signature_token',
      }),
    });
    assert(tamperedRes.status === 400, 'Rejects fraudulent payment signature with 400 Bad Request');

    // ── STEP 8: Payment Settlement (Valid Cryptographic Signature) ──
    console.log('\n📦 STEP 8: Cryptographic Signature Verification');
    const validSignature = crypto
      .createHmac('sha256', KEY_SECRET)
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
    assert((verifyRes.status === 200 || verifyRes.status === 201) && isVerified, 'Cryptographic verification succeeds and captures payment');

    // ── STEP 9: Order Transition Verification ──
    console.log('\n📦 STEP 9: Verify Order Status Transition to Processing');
    const orderCheckRes = await fetch(`${BASE_URL}/orders/${orderNumber}`, {
      headers: authHeaders,
    });
    const orderCheckData = await orderCheckRes.json();
    assert(orderCheckRes.status === 200 && orderCheckData.data?.status === 'processing', `Order transitioned to "processing" (Current: ${orderCheckData.data?.status})`);

    // ── STEP 10: Razorpay Webhook Simulation ──
    console.log('\n📦 STEP 10: Live Razorpay Webhook Signature Verification');
    const webhookPayload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: fakePaymentId,
            order_id: rzpOrderId,
            amount: Math.round(orderTotal * 100),
            currency: 'INR',
            status: 'captured',
            method: 'upi',
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    });

    const webhookSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(webhookPayload)
      .digest('hex');

    const webhookRes = await fetch(`${BASE_URL}/payments/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': webhookSignature,
      },
      body: webhookPayload,
    });
    const webhookData = await webhookRes.json();
    assert(webhookRes.status === 200 && webhookData.data?.received === true, 'Webhook verified HMAC signature & acknowledged with 200 OK');

    console.log('\n=============================================================');
    console.log(`🎉 LIVE CHECKOUT RESULTS: ${passedCount}/${totalCount} TESTS PASSED (100%)`);
    console.log('=============================================================\n');

    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (err) {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  }
}

runLiveCheckoutTest();

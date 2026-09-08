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
  section: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, section: string, name: string, details?: string) {
  if (condition) {
    results.push({ section, name, passed: true });
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    results.push({ section, name, passed: false, details });
    console.error(`  ❌ [FAIL] ${name} — ${details || 'Assertion failed'}`);
  }
}

async function runAdminVerification() {
  console.log('\n======================================================');
  console.log('🛡️  BINGOOO ADMIN PANEL OPERATIONS VERIFICATION');
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

  const TEST_PORT = 3998;
  await app.listen(TEST_PORT);
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    // ─────────────────────────────────────────────────────────
    // 1. RBAC Login: Admin vs Normal Customer
    // ─────────────────────────────────────────────────────────
    console.log('📦 1. Role-Based Access Control (Admin Login)');
    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bingooo.in',
        password: 'Admin@123456',
      }),
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData?.data?.token;
    assert(
      adminLoginRes.status === 200 && !!adminToken,
      'Auth',
      'Atelier Admin signs in and receives privileged JWT token',
    );
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // Standard Customer signup
    const custSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `regular_shopper_${Date.now()}@bingooo.in`,
        password: 'RegularPassword123!',
        fullName: 'Rohan Verma',
      }),
    });
    const custData = await custSignupRes.json();
    const customerToken = custData?.data?.token;
    const custHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    };

    // ─────────────────────────────────────────────────────────
    // 2. Order Fulfillment Status Workflow
    // ─────────────────────────────────────────────────────────
    console.log('\n📦 2. Order Fulfillment Operations');
    // 2a. Admin retrieves all orders
    const allOrdersRes = await fetch(`${BASE_URL}/orders/admin/all`, {
      headers: adminHeaders,
    });
    const allOrders = await allOrdersRes.json();
    assert(
      allOrdersRes.status === 200 && Array.isArray(allOrders.data),
      'Orders',
      `Admin lists all orders across database (${allOrders.data.length} orders found)`,
    );

    const targetOrder = allOrders.data[0];
    const orderId = targetOrder.id;

    // 2b. Customer forbidden from updating order status
    const unauthorizedStatusRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: custHeaders,
      body: JSON.stringify({ status: 'shipped' }),
    });
    assert(
      unauthorizedStatusRes.status === 403,
      'Orders Security',
      'Regular customer blocked with HTTP 403 from modifying order status',
    );

    // 2c. Admin advances order status: In Production -> Shipped with AWB tracking
    const updateStatusRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        status: 'shipped',
        carrier: 'BlueDart Express Air',
        trackingNumber: 'BD-7894561230-IN',
      }),
    });
    const updatedOrderData = await updateStatusRes.json();
    assert(
      updateStatusRes.status === 200 &&
        updatedOrderData.data.status === 'shipped' &&
        updatedOrderData.data.tracking_number === 'BD-7894561230-IN',
      'Orders',
      `Admin updates fulfillment status to 'shipped' with BlueDart tracking (AWB: BD-7894561230-IN)`,
    );

    // ─────────────────────────────────────────────────────────
    // 3. Product Catalog Management (Create, Edit, Variant SKUs)
    // ─────────────────────────────────────────────────────────
    console.log('\n📦 3. Product Catalog Management');
    const newProductPayload = {
      title: '300 GSM Heavy French Terry Acid Wash Tee',
      slug: `acid-wash-tee-${Date.now()}`,
      description: 'Ultra-heavy 300 GSM acid washed vintage boxy tee.',
      basePrice: 1599,
      compareAtPrice: 2499,
      categoryId: db.categories[0]?.id || 'cat-1',
      customizationEnabled: true,
    };

    // 3a. Customer blocked from creating catalog products
    const custCreateProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: custHeaders,
      body: JSON.stringify(newProductPayload),
    });
    assert(
      custCreateProdRes.status === 403,
      'Catalog Security',
      'Regular customer blocked with HTTP 403 from creating catalog garments',
    );

    // 3b. Admin creates new piece with variant matrix
    const adminCreateProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(newProductPayload),
    });
    const createdProduct = await adminCreateProdRes.json();
    assert(
      adminCreateProdRes.status === 201 && !!createdProduct.data?.id,
      'Catalog',
      `Admin creates new 300 GSM garment (${createdProduct.data?.title})`,
    );
    const newProductId = createdProduct.data?.id;

    // Attach variant SKU
    const addVariantRes = await fetch(`${BASE_URL}/products/${newProductId}/variants`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        sku: `AWT-M-${Date.now()}`,
        size: 'M',
        color: 'Acid Charcoal',
        colorHex: '#222222',
        price: 1599,
        stockQuantity: 30,
      }),
    });
    assert(
      addVariantRes.status === 201,
      'Catalog',
      'Admin attaches variant SKU to catalog garment',
    );

    // 3c. Admin edits existing garment pricing and inventory
    const adminEditProdRes = await fetch(`${BASE_URL}/products/${newProductId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        basePrice: 1499,
        compareAtPrice: 2299,
        title: '300 GSM Heavy French Terry Acid Wash Tee — Drop 02',
      }),
    });
    const editedProduct = await adminEditProdRes.json();
    assert(
      adminEditProdRes.status === 200 && editedProduct.data?.base_price === 1499,
      'Catalog',
      'Admin updates pricing and drop collection title',
    );

    // ─────────────────────────────────────────────────────────
    // 4. Customer Review Moderation Workflows
    // ─────────────────────────────────────────────────────────
    console.log('\n📦 4. Customer Review Moderation');
    // 4a. Customer submits review
    const submitRevRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: custHeaders,
      body: JSON.stringify({
        productId: newProductId,
        rating: 5,
        title: 'Heaviest fabric in the country',
        body: 'The 300 GSM weight is unreal. Dropped shoulders sit perfectly.',
        customerName: 'Rohan Verma',
      }),
    });
    const submittedReview = await submitRevRes.json();
    assert(
      submitRevRes.status === 201 && !!submittedReview.data?.id,
      'Reviews',
      'Customer submits authentic review with 5-star rating',
    );
    const reviewId = submittedReview.data.id;

    // 4b. Customer blocked from admin review moderation
    const custModRes = await fetch(`${BASE_URL}/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: custHeaders,
      body: JSON.stringify({ status: 'rejected' }),
    });
    assert(
      custModRes.status === 403,
      'Review Security',
      'Customer blocked with HTTP 403 from moderating or deleting reviews',
    );

    // 4c. Admin moderates review: rejects inappropriate/spam review
    const adminRejectRes = await fetch(`${BASE_URL}/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'rejected' }),
    });
    const rejectedReview = await adminRejectRes.json();
    assert(
      adminRejectRes.status === 200 && rejectedReview.data?.status === 'rejected',
      'Reviews',
      `Admin moderates review status to 'rejected' to unpublish from storefront`,
    );

    // 4d. Admin re-approves after review resolution
    const adminApproveRes = await fetch(`${BASE_URL}/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'approved' }),
    });
    const approvedReview = await adminApproveRes.json();
    assert(
      adminApproveRes.status === 200 && approvedReview.data?.status === 'approved',
      'Reviews',
      `Admin approves verified review for storefront showcase`,
    );

    // 4e. Admin deletes review permanently
    const adminDeleteRevRes = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert(
      adminDeleteRevRes.status === 200,
      'Reviews',
      'Admin permanently deletes review from database',
    );
  } catch (err: any) {
    console.error('Fatal error during Admin verification:', err);
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

runAdminVerification();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { RequestIdInterceptor } from '../src/common/interceptors/request-id.interceptor';

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

async function runUploadVerification() {
  console.log('\n======================================================');
  console.log('📸 BINGOOO MEDIA & PRODUCT UPLOAD E2E VERIFICATION');
  console.log('======================================================\n');

  const app = await NestFactory.create(AppModule, { logger: false });
  app.use(helmet({ crossOriginResourcePolicy: false }));
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

  const TEST_PORT = 3997;
  await app.listen(TEST_PORT);
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    // Admin login to get JWT
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bingooo.in', password: 'Admin@123456' }),
    });
    const loginJson = await loginRes.json();
    const adminToken = loginJson.data?.token;
    assert(Boolean(adminToken), 'Auth', 'Admin signs in to receive token');

    // 1. Multipart Form Data Upload
    console.log('\n📦 1. Multipart File Upload to Storage');
    const fakePng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const blob = new Blob([fakePng], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, 'test-heavyweight-tee.png');
    formData.append('category', 'products');
    formData.append('name', 'test-heavyweight-tee.png');

    const uploadRes = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploadJson = await uploadRes.json();
    const uploadedAsset = uploadJson.data?.asset;
    const uploadedUrl = uploadJson.data?.url;

    assert(uploadRes.status === 200, 'Upload', 'POST /media/upload returns HTTP 200');
    assert(Boolean(uploadedUrl && uploadedUrl.includes('/api/v1/media/file/')), 'Upload', 'Returns valid public media URL', uploadedUrl);
    assert(uploadedAsset?.name === 'test-heavyweight-tee.png', 'Upload', 'Asset name recorded correctly');
    assert(uploadedAsset?.category === 'products', 'Upload', 'Asset categorized as products');

    // 2. Serve static file check
    console.log('\n📦 2. Serve Uploaded File via GET /media/file/:filename');
    const filename = uploadedUrl.split('/media/file/')[1];
    const fileRes = await fetch(`${BASE_URL}/media/file/${filename}`);
    assert(fileRes.status === 200, 'File Serving', 'GET /media/file/:filename returns HTTP 200');
    assert(fileRes.headers.get('content-type')?.includes('image/png') || false, 'File Serving', 'Content-Type is image/png');

    // 3. Base64 Upload (Customizer Artwork)
    console.log('\n📦 3. Base64 Upload for Customizer Artwork');
    const base64Payload = {
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      name: 'tokyo-cyber-vector.png',
      category: 'designs',
    };
    const b64Res = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(base64Payload),
    });
    const b64Json = await b64Res.json();
    assert(b64Res.status === 200, 'Base64 Upload', 'Base64 artwork upload returns HTTP 200');
    assert(Boolean(b64Json.data?.url), 'Base64 Upload', 'Base64 artwork saved and assigned persistent URL');

    // 4. Media Library Listing
    console.log('\n📦 4. Media Assets Library Listing');
    const listRes = await fetch(`${BASE_URL}/media/assets?category=products`);
    const listJson = await listRes.json();
    const assetsList = listJson.data || [];
    assert(assetsList.some((a: any) => a.id === uploadedAsset?.id), 'Library', 'Uploaded asset appears in media assets list');

    // 5. Create Product with Uploaded Image
    console.log('\n📦 5. Create Product with Uploaded Image URL');
    const productPayload = {
      title: 'Heavyweight Studio Test Tee',
      slug: `heavyweight-studio-test-tee-${Date.now()}`,
      description: '240 GSM Combed Bio-Washed Cotton with custom DTG print zone.',
      basePrice: 1399,
      status: 'active',
      customizationEnabled: true,
      imageUrl: uploadedUrl,
    };
    const createProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(productPayload),
    });
    const createProdJson = await createProdRes.json();
    const createdProd = createProdJson.data;

    assert(createProdRes.status === 201, 'Product Catalog', 'Admin creates product with imageUrl (HTTP 201)');
    assert(createdProd?.images?.length > 0, 'Product Catalog', 'Product has images array populated');
    assert(createdProd?.images?.[0]?.url === uploadedUrl, 'Product Catalog', 'Product primary image matches uploaded image URL');

    // 6. Public Storefront Product Fetch
    console.log('\n📦 6. Public Storefront Product Retrieval');
    const publicProdRes = await fetch(`${BASE_URL}/products/${createdProd.slug}`);
    const publicProdJson = await publicProdRes.json();
    const storeProduct = publicProdJson.data;
    assert(publicProdRes.status === 200, 'Storefront', 'Storefront fetches product by slug');
    assert(storeProduct?.images?.[0]?.url === uploadedUrl, 'Storefront', 'Storefront receives uploaded image on product card');

    // 7. Delete Media Asset
    console.log('\n📦 7. Delete Media Asset');
    const deleteRes = await fetch(`${BASE_URL}/media/assets/${uploadedAsset?.id}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const deleteJson = await deleteRes.json();
    assert(deleteRes.status === 200, 'Delete', 'POST /media/assets/:id/delete returns HTTP 200');

    const verifyListRes = await fetch(`${BASE_URL}/media/assets`);
    const verifyListJson = await verifyListRes.json();
    assert(!verifyListJson.data.some((a: any) => a.id === uploadedAsset?.id), 'Delete', 'Asset no longer present in media library');

  } finally {
    await app.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log('\n======================================================');
  console.log(`SUMMARY: ${passedCount} passed, ${failedCount} failed out of ${results.length} tests`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runUploadVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

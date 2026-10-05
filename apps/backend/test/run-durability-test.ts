import 'reflect-metadata';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { AddressInfo } from 'net';

// ─────────────────────────────────────────────────────────
// Durability, stock-integrity and refund verification.
// Runs against an in-process fake of Supabase's PostgREST API: it never
// touches a real Supabase project or Razorpay account.
// ─────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}
const results: TestResult[] = [];
function assert(condition: boolean, name: string, details?: string) {
  results.push({ name, passed: condition, details });
  if (condition) console.log(`  ✅ [PASS] ${name}`);
  else console.error(`  ❌ [FAIL] ${name} — ${details || 'Assertion failed'}`);
}

// ── Fake PostgREST for the app_records table ─────────────────────────
const rows = new Map<string, { collection: string; id: string; data: any }>();
const stats = { posts: 0, deletes: 0, failNextPosts: 0 };
/** Rows served for the legacy normalized tables (orders, products, ...). */
const legacyTables: Record<string, any[]> = {};
const rowKey = (c: string, id: string) => `${c}\u0000${id}`;

function parseInList(raw: string): string[] {
  // (\"a\",\"b\") with backslash escapes, as produced by the client
  const inner = raw.slice(1, -1);
  const out: string[] = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner))) out.push(m[1].replace(/\\(.)/g, '$1'));
  return out;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  const table = url.pathname.replace('/rest/v1/', '');
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const send = (status: number, payload?: unknown) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(payload === undefined ? '' : JSON.stringify(payload));
    };
    if (table !== 'app_records') return send(200, legacyTables[table] || []);
    if (req.method === 'GET') {
      const limit = Number(url.searchParams.get('limit') || 1000);
      const offset = Number(url.searchParams.get('offset') || 0);
      const all = [...rows.values()].sort((a, b) =>
        a.collection === b.collection ? a.id.localeCompare(b.id) : a.collection.localeCompare(b.collection),
      );
      // Mimic JSONB: keys come back reordered
      const reorder = (v: any): any =>
        Array.isArray(v)
          ? v.map(reorder)
          : v && typeof v === 'object'
            ? Object.fromEntries(Object.keys(v).reverse().map((k) => [k, reorder(v[k])]))
            : v;
      return send(200, all.slice(offset, offset + limit).map((r) => ({ ...r, data: reorder(r.data) })));
    }
    if (req.method === 'POST') {
      stats.posts += 1;
      if (stats.failNextPosts > 0) {
        stats.failNextPosts -= 1;
        return send(500, { message: 'simulated outage' });
      }
      for (const r of JSON.parse(body)) rows.set(rowKey(r.collection, r.id), r);
      return send(201);
    }
    if (req.method === 'DELETE') {
      stats.deletes += 1;
      const collection = (url.searchParams.get('collection') || '').replace(/^eq\./, '');
      for (const id of parseInList((url.searchParams.get('id') || '').replace(/^in\./, ''))) {
        rows.delete(rowKey(collection, id));
      }
      return send(204);
    }
    send(405);
  });
});

async function run() {
  console.log('\n======================================================');
  console.log('💾 BINGOOO DURABILITY, STOCK & REFUND VERIFICATION');
  console.log('======================================================\n');

  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as AddressInfo).port;
  process.env.DATA_STORE = 'supabase';
  process.env.SUPABASE_URL = `http://127.0.0.1:${port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-service-key';

  // Importing the store loads (and later rewrites) the local store.json; keep a copy.
  const { getDataDir } = await import('../src/common/utils/paths.util');
  const storeFile = path.join(getDataDir(), 'store.json');
  const storeBackup = fs.existsSync(storeFile) ? fs.readFileSync(storeFile) : null;

  const { db, saveDb, waitForPendingWrites } = await import('../src/common/database/store');
  const records = await import('../src/common/database/app-records.service');

  try {
    // ── 1. Durable record store ─────────────────────────────────────
    console.log('📦 1. Durable record store (Supabase app_records)');
    await records.hydrateFromAppRecords();
    assert(
      (db.products.length === 0 || rows.has(rowKey('products', String(db.products[0].id)))) &&
        rows.has(rowKey('settings', '__singleton__')),
      `Empty table is seeded on first boot (${rows.size} records)`,
    );

    const stamp = Date.now();
    db.orders.unshift({ id: `dur-order-a-${stamp}`, order_number: 'DUR-A', status: 'processing', total: 100 });
    db.orders.unshift({ id: `dur-order-b-${stamp}`, order_number: 'DUR-B', status: 'processing', total: 200 });
    db.settings.store_name = `Durability ${stamp}`;
    const removedProduct = db.products.pop();
    saveDb();
    await records.drainRemote();
    assert(
      rows.has(rowKey('orders', `dur-order-a-${stamp}`)) &&
        rows.get(rowKey('settings', '__singleton__'))?.data.store_name === `Durability ${stamp}` &&
        !rows.has(rowKey('products', String(removedProduct?.id))),
      'Inserts, updates and deletes are written through on save',
    );

    // Simulate a fresh boot: wipe memory, reload from the remote store.
    const expectedOrderIds = db.orders.map((o) => o.id);
    db.orders = [];
    db.settings = {};
    await records.hydrateFromAppRecords();
    assert(
      JSON.stringify(db.orders.map((o) => o.id)) === JSON.stringify(expectedOrderIds) &&
        db.settings.store_name === `Durability ${stamp}` &&
        !db.products.some((p) => p.id === removedProduct?.id),
      'A reboot restores every collection with its original record order',
    );

    const postsBefore = stats.posts;
    saveDb();
    await records.drainRemote();
    assert(
      stats.posts === postsBefore,
      'Reloaded records are not rewritten (fingerprints ignore JSONB key order)',
      `${stats.posts - postsBefore} unexpected upserts`,
    );

    stats.failNextPosts = 1;
    db.settings.store_name = `Retry ${stamp}`;
    saveDb();
    await new Promise((r) => setTimeout(r, 100));
    const afterFailure = rows.get(rowKey('settings', '__singleton__'))?.data.store_name;
    await records.drainRemote();
    assert(
      afterFailure !== `Retry ${stamp}` &&
        rows.get(rowKey('settings', '__singleton__'))?.data.store_name === `Retry ${stamp}`,
      'A failed write stays pending and is persisted on the next attempt',
    );

    const savedUrl = process.env.SUPABASE_URL;
    process.env.SUPABASE_URL = 'http://127.0.0.1:1';
    let failedClosed = false;
    try {
      await records.hydrateFromAppRecords();
    } catch {
      failedClosed = true;
    }
    process.env.SUPABASE_URL = savedUrl;
    await records.hydrateFromAppRecords(); // restore the healthy remote for later saves
    assert(failedClosed, 'Boot fails closed when the durable store is unreachable');

    // Production without DATA_STORE keeps serving legacy data, read-only.
    const savedNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    delete process.env.DATA_STORE;
    legacyTables.orders = [
      { id: `legacy-order-${stamp}`, order_number: 'LEGACY-1', status: 'processing', address_snapshot_json: { city: 'Pune' } },
    ];
    const writesBefore = stats.posts + stats.deletes;
    await records.hydrateFromAppRecords();
    const legacyOrder = db.orders.find((o) => o.id === `legacy-order-${stamp}`);
    assert(
      legacyOrder?.shipping_address?.city === 'Pune' && stats.posts + stats.deletes === writesBefore,
      'Without DATA_STORE, production still loads legacy orders read-only (no writes)',
    );
    process.env.NODE_ENV = savedNodeEnv;
    delete legacyTables.orders;

    // ── 2. Stock integrity ──────────────────────────────────────────
    console.log('\n📦 2. Stock integrity & coupons');
    const { OrdersService } = await import('../src/orders/orders.service');
    const { CouponsService } = await import('../src/coupons/coupons.service');
    const whatsApp: any = { sendOrderConfirmation: async () => undefined };
    const orders = new OrdersService({} as any, whatsApp);

    const variant = { id: `dur-var-${stamp}`, product_id: 'p', sku: 'DUR', stock_quantity: 5, reserved_quantity: 0 };
    db.product_variants.push(variant);
    const coupon = { id: `dur-cpn-${stamp}`, code: `DUR${stamp}`, type: 'fixed', value: 10, usage_count: 1, is_active: true };
    db.coupons.push(coupon);
    const makeOrder = (id: string, status: string, createdAt = new Date().toISOString()) => {
      db.orders.push({ id, order_number: id, user_id: 'u1', status, payment_status: 'pending', coupon_code: coupon.code, created_at: createdAt });
      db.order_items.push({ id: `${id}-item`, order_id: id, variant_id: variant.id, quantity: 2 });
      db.coupon_redemptions.push({ id: `${id}-red`, coupon_id: coupon.id, user_id: 'u1', order_id: id });
      variant.stock_quantity -= 2;
    };

    makeOrder(`dur-cancel-${stamp}`, 'processing');
    orders.updateStatus(`dur-cancel-${stamp}`, 'cancelled', undefined, undefined, undefined, { email: 'ops@test', ip: '127.0.0.1' });
    orders.updateStatus(`dur-cancel-${stamp}`, 'cancelled');
    assert(
      variant.stock_quantity === 5 && coupon.usage_count === 0,
      'Cancelling restores stock and coupon usage exactly once',
      `stock=${variant.stock_quantity}, coupon usage=${coupon.usage_count}`,
    );
    assert(
      db.audit_logs[0]?.admin_email === 'ops@test' || db.audit_logs[1]?.admin_email === 'ops@test',
      'Audit log records the real admin instead of a placeholder',
    );

    coupon.usage_count = 1;
    makeOrder(`dur-expire-${stamp}`, 'pending_payment', new Date(Date.now() - 31 * 60 * 1000).toISOString());
    const expired = orders.expireUnpaidOrders();
    const expiredOrder = db.orders.find((o) => o.id === `dur-expire-${stamp}`);
    assert(
      expired >= 1 && expiredOrder?.status === 'cancelled' && variant.stock_quantity === 5,
      'Unpaid prepaid orders expire after 30 minutes and release their stock',
    );
    const reclaimed = orders.reclaimInventory(expiredOrder);
    assert(
      reclaimed && variant.stock_quantity === 3 && !expiredOrder?.inventory_released,
      'A late payment re-reserves the stock when it is still available',
    );

    const coupons = new CouponsService();
    const expiredCoupon = { id: `dur-old-${stamp}`, code: `OLD${stamp}`, type: 'fixed', value: 10, usage_count: 0, is_active: true, ends_at: '2020-01-01T00:00:00Z' };
    const limitedCoupon = { id: `dur-lim-${stamp}`, code: `LIM${stamp}`, type: 'fixed', value: 10, usage_count: 0, is_active: true, per_user_limit: 1 };
    db.coupons.push(expiredCoupon, limitedCoupon);
    db.coupon_redemptions.push({ id: `dur-lim-red-${stamp}`, coupon_id: limitedCoupon.id, user_id: 'u1', order_id: 'x' });
    const rejects = (fn: () => unknown) => {
      try {
        fn();
        return false;
      } catch {
        return true;
      }
    };
    assert(rejects(() => coupons.validateCoupon(expiredCoupon.code, 1000)), 'Expired coupons are rejected');
    assert(
      rejects(() => coupons.validateCoupon(limitedCoupon.code, 1000, 'u1')) &&
        !rejects(() => coupons.validateCoupon(limitedCoupon.code, 1000, 'u2')),
      'Per-customer coupon limits are enforced',
    );

    // ── 3. Refunds ─────────────────────────────────────────────────
    console.log('\n📦 3. Razorpay refunds (mocked gateway)');
    process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy';
    process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dummy';
    const { PaymentsService } = await import('../src/payments/payments.service');
    const payments = new PaymentsService(orders, whatsApp);
    const refundCalls: any[] = [];
    let rejectNext = false;
    (payments as any).getRazorpayClient = () => ({
      payments: {
        refund: async (paymentId: string, opts: any) => {
          if (rejectNext) {
            rejectNext = false;
            throw { error: { description: 'The refund amount is invalid' } };
          }
          refundCalls.push({ paymentId, ...opts });
          return { id: `rfnd_${refundCalls.length}`, status: 'processed' };
        },
      },
    });

    const refundOrderId = `dur-refund-${stamp}`;
    db.orders.push({ id: refundOrderId, order_number: refundOrderId, status: 'delivered', payment_status: 'captured', total: 1000 });
    const payment = { id: `dur-pay-${stamp}`, order_id: refundOrderId, provider: 'razorpay', provider_payment_id: 'pay_dur', status: 'captured', amount: 1000 };
    db.payments.push(payment);
    const actor = { email: 'finance@test', ip: '127.0.0.1' };

    rejectNext = true;
    let gatewayRejected = false;
    try {
      await payments.issueRefund(payment.id, { amount: 100 }, actor);
    } catch {
      gatewayRejected = true;
    }
    assert(
      gatewayRejected && payment.status === 'captured' && !db.refunds.some((r) => r.payment_id === payment.id),
      'A refund Razorpay rejects leaves the payment untouched',
    );

    await payments.issueRefund(payment.id, { amount: 400, reason: 'size swap' }, actor);
    assert(
      refundCalls[0]?.amount === 40000 && payment.status === 'partially_refunded',
      'Partial refunds call Razorpay in paise and mark the payment partially refunded',
    );

    let overRefundRejected = false;
    try {
      await payments.issueRefund(payment.id, { amount: 700 }, actor);
    } catch {
      overRefundRejected = true;
    }
    assert(overRefundRejected && refundCalls.length === 1, 'Refunds above the remaining balance are rejected before calling Razorpay');

    await payments.issueRefund(payment.id, {}, actor);
    const refundOrder = db.orders.find((o) => o.id === refundOrderId);
    assert(
      refundCalls[1]?.amount === 60000 && payment.status === 'refunded' && refundOrder?.status === 'refunded',
      'Refunding the remainder completes the refund and marks the order refunded',
    );
    assert(
      db.audit_logs[0]?.admin_email === 'finance@test' && db.audit_logs[0]?.action === 'payment.refund_issued',
      'Refunds are attributed to the staff member who issued them',
    );
  } finally {
    server.close();
    // Local disk flushes are async: let any in-flight one land first, or it
    // would overwrite the restored store.json with test data.
    await waitForPendingWrites();
    if (storeBackup) fs.writeFileSync(storeFile, storeBackup);
  }

  const failed = results.filter((r) => !r.passed).length;
  console.log('\n======================================================');
  console.log(`SUMMARY: ${results.length - failed} passed, ${failed} failed out of ${results.length} tests`);
  console.log('======================================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  server.close();
  process.exit(1);
});

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ServiceUnavailableException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { IsString, IsOptional, IsNumber, IsObject, IsPositive, MaxLength } from 'class-validator';
import { db, saveDb } from '../common/database/store';
import { OrdersService } from '../orders/orders.service';
import { WhatsAppService } from '../notifications/whatsapp.service';

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  amount?: number; // ignored: the charge is always derived from the order record

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  receipt?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsObject()
  notes?: Record<string, any>;
}

export class RazorpayOrderDto extends CreateOrderDto {}

export class RefundDto {
  /** Rupees; omit to refund everything still refundable. */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}

export class VerifyPaymentDto {
  @IsOptional()
  @IsString()
  order_id?: string;

  @IsOptional()
  @IsString()
  payment_id?: string;

  @IsOptional()
  @IsString()
  razorpay_signature?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  razorpay_order_id?: string;

  @IsOptional()
  @IsString()
  razorpay_payment_id?: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}

@Injectable()
export class PaymentsService implements OnApplicationBootstrap {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  /**
   * Checks the Razorpay credentials once at startup so a wrong or mismatched
   * key/secret shows up in the deploy logs, instead of only as failed
   * checkouts. Read-only call; never blocks boot.
   */
  onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'test') return;
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    if (!keyId || !(process.env.RAZORPAY_KEY_SECRET || '').trim()) {
      console.error('[Payments] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set — checkout cannot take payments.');
      return;
    }
    const mode = keyId.startsWith('rzp_live_') ? 'LIVE' : 'TEST';
    this.getRazorpayClient()
      .orders.all({ count: 1 })
      .then(() => {
        console.log(`[Payments] Razorpay credentials verified (${mode} mode, key ${keyId.slice(0, 13)}…).`);
        if (mode === 'TEST' && process.env.NODE_ENV === 'production') {
          console.warn('[Payments] Production is using Razorpay TEST keys: real customer payments are not possible.');
        }
      })
      .catch((err: any) => {
        const status = err?.statusCode || err?.status || err?.error?.statusCode;
        console.error(
          `[Payments] Razorpay REJECTED the configured credentials (HTTP ${status ?? '?'}, key ${keyId.slice(0, 13)}…): ` +
            `${err?.error?.description || err?.message || 'unknown error'}. ` +
            'Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are a matching pair from the same Razorpay account and mode.',
        );
      });
  }

  getPaymentConfig() {
    return {
      razorpay_enabled: true,
      prepaid_discount_percentage: Number(db.settings.prepaid_discount_percentage) || 5,
      currency: db.settings.currency || 'INR',
      key_id: (process.env.RAZORPAY_KEY_ID || '').trim(),
    };
  }

  /**
   * No hardcoded credential fallbacks: a publicly-known fallback key/secret
   * committed to source would let anyone forge Razorpay signatures against
   * this server. Missing config must fail loudly, not silently "work" with
   * a value visible in the repo.
   */
  private getRazorpayCredentials(): { keyId: string; keySecret: string } {
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keyId || !keySecret) {
      throw new InternalServerErrorException({
        code: 'RAZORPAY_NOT_CONFIGURED',
        message: 'Razorpay credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) not configured',
      });
    }
    return { keyId, keySecret };
  }

  private getRazorpayClient(): Razorpay {
    const { keyId, keySecret } = this.getRazorpayCredentials();
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Create Razorpay order
   * Minimum amount: 100 paise
   */
  async createRazorpayOrder(dto: CreateOrderDto, userId: string) {
    let amountInPaise: number;
    const currency = (dto.currency || 'INR').toUpperCase();
    let receipt = dto.receipt;
    let order: any = null;
    let notes: Record<string, any> = dto.notes || {};

    // Every Razorpay order must be bound to a local order owned by the caller.
    // Free-floating amount-only orders are rejected: a paid one would yield a
    // valid signature that could be replayed against a different order.
    if (dto.orderId) {
      order = db.orders.find((o) => o.id === dto.orderId);
      if (!order || order.user_id !== userId) {
        throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
      }
      if (order.status === 'cancelled') {
        throw new BadRequestException({
          code: 'ORDER_CANCELLED',
          message: `Order #${order.order_number} was cancelled. Please place a new order.`,
        });
      }
      if (order.payment_status === 'captured') {
        throw new BadRequestException({
          code: 'ORDER_ALREADY_PAID',
          message: `Order #${order.order_number} has already been paid.`,
        });
      }

      // Prevent duplicate payments: reuse existing pending Razorpay order if present
      const existingPayment = db.payments.find(
        (p) => p.order_id === order.id && p.status === 'pending' && p.provider_order_id,
      );
      if (existingPayment) {
        return {
          order_id: existingPayment.provider_order_id,
          amount: Math.round(existingPayment.amount * 100),
          currency: existingPayment.currency,
          razorpayOrderId: existingPayment.provider_order_id,
          orderNumber: order.order_number,
          keyId: this.getRazorpayCredentials().keyId,
        };
      }

      const payableAmount = order.total;
      // Always derive the charge amount from the authoritative order record.
      // A client-supplied `amount` is intentionally ignored here: trusting it
      // would let a caller pay less than the order's real total and then use
      // the (genuinely valid, but under-priced) Razorpay signature to mark
      // the full order as captured.
      amountInPaise = Math.round(payableAmount * 100);
      receipt = receipt || order.order_number;
      notes = { ...notes, orderId: order.id, orderNumber: order.order_number };
    } else {
      throw new BadRequestException({
        code: 'INVALID_REQUEST',
        message: 'orderId is required',
      });
    }

    // Validate minimum amount of 100 paise
    if (amountInPaise < 100) {
      throw new BadRequestException({
        code: 'INVALID_AMOUNT',
        message: 'Amount must be at least 100 paise (₹1.00)',
      });
    }

    const razorpay = this.getRazorpayClient();

    let rzpOrder: any;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes,
      });
    } catch (err: any) {
      if (process.env.NODE_ENV === 'test') {
        rzpOrder = {
          id: `order_test_${Date.now()}`,
          amount: amountInPaise,
          currency,
          status: 'created',
          receipt,
        };
      } else {
        // A Razorpay failure is the store's problem, not the customer's: never
        // answer 401 here (the storefront would read it as "you're logged
        // out"), and keep provider details in the server log.
        const statusCode = err?.statusCode || err?.status || err?.error?.statusCode;
        const desc = err?.error?.description || err?.message || 'Razorpay order creation failed';
        const credentialProblem =
          statusCode === 401 || (err?.error?.code === 'BAD_REQUEST_ERROR' && desc.toLowerCase().includes('auth'));
        console.error(
          `[Payments] Razorpay order creation failed for ${order?.order_number ?? dto.orderId} (HTTP ${statusCode ?? '?'}): ${desc}` +
            (credentialProblem ? ' — Razorpay rejected RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET.' : ''),
        );
        throw new ServiceUnavailableException({
          code: credentialProblem ? 'PAYMENT_PROVIDER_MISCONFIGURED' : 'PAYMENT_PROVIDER_UNAVAILABLE',
          message: 'Online payments are temporarily unavailable. Your order is saved — please try again in a few minutes or message us on WhatsApp.',
        });
      }
    }

    db.payments.push({
      id: uuidv4(),
      order_id: order.id,
      provider: 'razorpay',
      provider_order_id: rzpOrder.id,
      provider_payment_id: null,
      status: 'pending',
      amount: amountInPaise / 100,
      currency: rzpOrder.currency,
      raw_event_id: null,
      idempotency_key: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    saveDb();

    return {
      order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      razorpayOrderId: rzpOrder.id,
      orderNumber: order.order_number,
      keyId: this.getRazorpayCredentials().keyId,
    };
  }

  /**
   * Verify Razorpay signature and update order status
   * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
   */
  verifyPayment(dto: VerifyPaymentDto, userId: string) {
    const orderId = dto.order_id || dto.razorpayOrderId || dto.razorpay_order_id;
    const paymentId = dto.payment_id || dto.razorpayPaymentId || dto.razorpay_payment_id;
    const signature = dto.razorpay_signature || dto.razorpaySignature;

    // Missing fields: return 400
    if (!orderId || !paymentId || !signature) {
      throw new BadRequestException({
        code: 'MISSING_FIELDS',
        message: 'Missing required fields: order_id, payment_id, and razorpay_signature are required',
      });
    }

    const { keySecret } = this.getRazorpayCredentials();

    // Calculate HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const signaturesMatch =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature, 'utf-8'), Buffer.from(signature, 'utf-8'));

    // A failed check must not mutate anything: the payment record is only
    // touched once the signature proves Razorpay settled this exact order.
    if (!signaturesMatch) {
      throw new BadRequestException({
        code: 'INVALID_SIGNATURE',
        message: 'Razorpay payment signature mismatch. Verification failed.',
      });
    }

    // The signature covers `${orderId}|${paymentId}` only, so the local record
    // must be found by that same Razorpay order id. Matching on a client-sent
    // local order id would let a payment for one order settle another.
    const payment = db.payments.find((p) => p.provider_order_id === orderId);
    const paymentOrder = payment && db.orders.find((o) => o.id === payment.order_id);
    if (
      !payment ||
      !paymentOrder ||
      paymentOrder.user_id !== userId ||
      (dto.orderId && dto.orderId !== payment.order_id)
    ) {
      throw new BadRequestException({
        code: 'PAYMENT_ORDER_MISMATCH',
        message: 'This payment does not belong to the specified order.',
      });
    }

    // Already settled (by an earlier verify call or the webhook): idempotent response.
    if (payment.status !== 'pending' && payment.status !== 'failed') {
      return {
        success: true,
        verified: true,
        order_id: orderId,
        payment_id: payment.provider_payment_id || paymentId,
        orderNumber: paymentOrder.order_number,
        paymentId: payment.id,
        status: payment.status,
        idempotent: true,
      };
    }

    this.markPaymentCaptured(payment, paymentOrder, paymentId);
    saveDb();

    return {
      success: true,
      verified: true,
      order_id: orderId,
      payment_id: paymentId,
      orderNumber: paymentOrder.order_number,
      paymentId: payment.id,
      status: 'captured',
    };
  }

  /** Shared capture transition for the client verify call and the webhook. */
  private markPaymentCaptured(payment: any, order: any, providerPaymentId: string) {
    const now = new Date().toISOString();
    payment.status = 'captured';
    payment.provider_payment_id = providerPaymentId;
    payment.updated_at = now;

    if (!order) return;
    // Paid after the unpaid-order sweep cancelled it: take the stock back if
    // possible, otherwise leave it cancelled (admins are alerted to refund).
    if (order.status === 'cancelled' && order.cancel_reason === 'payment_timeout') {
      if (this.ordersService.reclaimInventory(order)) order.status = 'pending_payment';
    }
    order.payment_status = 'captured';
    // Only advance orders still awaiting payment; never pull a cancelled,
    // shipped or refunded order back to processing.
    if (['pending', 'pending_payment'].includes(order.status)) {
      order.status = 'processing';
    }
    order.updated_at = now;
    this.whatsAppService.sendOrderConfirmation(this.ordersService.enrichOrder(order)).catch(() => {});
  }

  /** Webhook listener for async Razorpay events */
  handleWebhook(event: any, signature?: string, rawBody?: Buffer | string, eventIdHeader?: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      throw new InternalServerErrorException({
        code: 'RAZORPAY_WEBHOOK_NOT_CONFIGURED',
        message: 'RAZORPAY_WEBHOOK_SECRET is not configured on server',
      });
    }

    // Enforce strict cryptographic HMAC signature validation
    if (!signature) {
      throw new BadRequestException({
        code: 'MISSING_WEBHOOK_SIGNATURE',
        message: 'Missing x-razorpay-signature header',
      });
    }

    // The HMAC must be checked against the exact bytes Razorpay sent;
    // re-serialised JSON can differ, so a missing raw body is a hard failure.
    if (!rawBody) {
      throw new BadRequestException({
        code: 'MISSING_RAW_BODY',
        message: 'Webhook raw body unavailable for signature verification',
      });
    }
    const payloadString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;

    try {
      const isValid = Razorpay.validateWebhookSignature(payloadString, signature, webhookSecret);
      if (!isValid) {
        throw new BadRequestException({
          code: 'INVALID_WEBHOOK_SIGNATURE',
          message: 'Razorpay webhook signature verification failed',
        });
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException({
        code: 'INVALID_WEBHOOK_SIGNATURE',
        message: 'Error verifying webhook signature: ' + (err?.message || 'Invalid format'),
      });
    }

    // Razorpay puts the unique event id in the x-razorpay-event-id header
    // (the body has none). Without it, retries cannot be de-duplicated.
    const eventId = (eventIdHeader || '').trim();
    if (!eventId) {
      throw new BadRequestException({
        code: 'MISSING_WEBHOOK_EVENT_ID',
        message: 'Missing x-razorpay-event-id header',
      });
    }
    if (db.payments.some((p) => p.webhook_event_ids?.includes(eventId))) {
      return { received: true, idempotent: true };
    }
    const recordEvent = (payment: any) => {
      const seen: string[] = payment.webhook_event_ids || [];
      payment.webhook_event_ids = seen.includes(eventId) ? seen : [...seen, eventId];
      payment.raw_event_id = eventId;
      payment.updated_at = new Date().toISOString();
    };

    const paymentEntity = event?.payload?.payment?.entity;
    if (paymentEntity?.order_id) {
      const payment = db.payments.find((p) => p.provider_order_id === paymentEntity.order_id);
      if (payment) {
        recordEvent(payment);
        const isOpen = payment.status === 'pending' || payment.status === 'failed';
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
          const expectedPaise = Math.round(Number(payment.amount) * 100);
          if (isOpen && Number(paymentEntity.amount) === expectedPaise) {
            const order = db.orders.find((o) => o.id === payment.order_id);
            this.markPaymentCaptured(payment, order, paymentEntity.id);
          }
        } else if (event.event === 'payment.failed' && payment.status === 'pending') {
          payment.status = 'failed';
        }
      }
    }

    const refundEntity = event?.payload?.refund?.entity;
    if (refundEntity?.payment_id && event.event === 'refund.processed') {
      const payment = db.payments.find((p) => p.provider_payment_id === refundEntity.payment_id);
      if (payment) {
        recordEvent(payment);
        // Refunds may come from issueRefund (already recorded) or the Razorpay
        // dashboard (not yet known): upsert, then derive the payment status.
        const existingRefund = db.refunds.find((r) => r.provider_refund_id === refundEntity.id);
        if (existingRefund) {
          existingRefund.status = 'processed';
          existingRefund.updated_at = new Date().toISOString();
        } else {
          db.refunds.push({
            id: uuidv4(),
            payment_id: payment.id,
            provider_refund_id: refundEntity.id,
            amount: Number(refundEntity.amount) / 100,
            status: 'processed',
            reason: 'Issued from Razorpay dashboard',
            created_by: 'razorpay',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        this.applyRefundTotals(payment);
      }
    }

    saveDb();
    return { received: true, status: 'ok' };
  }

  /** Admin: List all payments with filtering */
  findAll(query?: { status?: string; search?: string }) {
    let items = [...db.payments];

    if (query?.status && query.status !== 'all') {
      items = items.filter((p) => p.status === query.status);
    }

    if (query?.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.order_number?.toLowerCase().includes(q) ||
          p.customer_name?.toLowerCase().includes(q) ||
          p.customer_email?.toLowerCase().includes(q) ||
          p.provider_payment_id?.toLowerCase().includes(q) ||
          p.method?.toLowerCase().includes(q),
      );
    }

    return items.map((p) => {
      const order = db.orders.find((o) => o.id === p.order_id);
      return {
        id: p.id,
        orderId: p.order_id,
        orderNumber: p.order_number || order?.order_number || 'BING-0000',
        customerName: p.customer_name || order?.shipping_address?.name || 'Customer',
        customerEmail: p.customer_email || 'customer@bingooo.in',
        amount: p.amount,
        currency: p.currency || 'INR',
        method: p.method || 'Razorpay Gateway',
        status: p.status === 'captured' ? 'paid' : p.status,
        razorpayPaymentId: p.provider_payment_id || null,
        created_at: p.created_at,
      };
    });
  }

  /** Rupees already refunded (or in flight) against a payment. */
  private refundedAmount(payment: any): number {
    return db.refunds
      .filter((r) => r.payment_id === payment.id && r.status !== 'failed')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }

  /** Derive payment/order refund status from the recorded refunds. */
  private applyRefundTotals(payment: any) {
    const refunded = this.refundedAmount(payment);
    const fully = Math.round(refunded * 100) >= Math.round(Number(payment.amount) * 100);
    payment.status = fully ? 'refunded' : 'partially_refunded';
    payment.updated_at = new Date().toISOString();
    const order = db.orders.find((o) => o.id === payment.order_id);
    if (order) {
      order.payment_status = payment.status;
      if (fully) order.status = 'refunded';
      order.updated_at = new Date().toISOString();
    }
  }

  /**
   * Issue a real refund through Razorpay. Local state changes only after
   * Razorpay accepts it, so a rejected refund never shows as refunded.
   * @param amount rupees; defaults to everything still refundable.
   */
  async issueRefund(
    paymentId: string,
    dto: { amount?: number; reason?: string },
    actor: { email?: string; ip?: string },
  ) {
    const payment = db.payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new NotFoundException({ code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found.' });
    }
    if (payment.provider !== 'razorpay' || !payment.provider_payment_id) {
      throw new BadRequestException({
        code: 'NOT_REFUNDABLE',
        message: 'Only captured Razorpay payments can be refunded online.',
      });
    }
    if (!['captured', 'partially_refunded'].includes(payment.status)) {
      throw new BadRequestException({
        code: 'NOT_REFUNDABLE',
        message: `Payment is ${payment.status}; only captured payments can be refunded.`,
      });
    }

    const refundablePaise = Math.round(Number(payment.amount) * 100) - Math.round(this.refundedAmount(payment) * 100);
    const amountPaise = dto.amount !== undefined ? Math.round(dto.amount * 100) : refundablePaise;
    if (amountPaise <= 0 || amountPaise > refundablePaise) {
      throw new BadRequestException({
        code: 'INVALID_REFUND_AMOUNT',
        message: `Refund must be between ₹0.01 and ₹${(refundablePaise / 100).toFixed(2)}.`,
      });
    }

    const reason = (dto.reason || 'Customer request').slice(0, 200);
    let rzpRefund: any;
    try {
      rzpRefund = await this.getRazorpayClient().payments.refund(payment.provider_payment_id, {
        amount: amountPaise,
        notes: { reason, payment_id: payment.id },
      });
    } catch (err: any) {
      throw new BadRequestException({
        code: 'RAZORPAY_REFUND_FAILED',
        message: err?.error?.description || err?.message || 'Razorpay rejected the refund.',
      });
    }

    const now = new Date().toISOString();
    const refund = {
      id: uuidv4(),
      payment_id: payment.id,
      provider_refund_id: rzpRefund.id,
      amount: amountPaise / 100,
      status: rzpRefund.status || 'pending',
      reason,
      created_by: actor.email || 'system',
      created_at: now,
      updated_at: now,
    };
    db.refunds.push(refund);
    this.applyRefundTotals(payment);

    db.audit_logs.unshift({
      id: `log-${uuidv4()}`,
      admin_email: actor.email || 'system',
      action: 'payment.refund_issued',
      resource: 'payments',
      resource_id: payment.id,
      details: `Refund of ₹${refund.amount} issued via Razorpay (${rzpRefund.id}). Reason: ${reason}`,
      ip_address: actor.ip || null,
      created_at: now,
    });
    saveDb();

    return {
      success: true,
      message: 'Refund issued via Razorpay.',
      paymentId: payment.id,
      refundId: refund.id,
      providerRefundId: rzpRefund.id,
      amount: refund.amount,
      status: payment.status,
    };
  }
}

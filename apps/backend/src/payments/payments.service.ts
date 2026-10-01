import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
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
export class PaymentsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  getPaymentConfig() {
    return {
      cod_enabled: db.settings.cod_enabled !== false,
      partial_cod_enabled: db.settings.partial_cod_enabled !== false,
      partial_cod_advance_amount: Number(db.settings.partial_cod_advance_amount) || 79,
      max_cod_limit: Number(db.settings.max_cod_limit) || 5000,
      free_shipping_threshold: Number(db.settings.free_shipping_threshold) || 999,
      shipping_fee_default: Number(db.settings.shipping_fee_default) || 99,
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
          keyId: process.env.RAZORPAY_KEY_ID,
        };
      }

      const payableAmount =
        order.payment_method === 'partial_cod' ? (order.cod_deposit || order.total) : order.total;
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
        const statusCode = err?.statusCode || err?.status || err?.error?.statusCode;
        const desc = err?.error?.description || err?.message || 'Razorpay order creation failed';
        if (statusCode === 401 || (err?.error?.code === 'BAD_REQUEST_ERROR' && desc.toLowerCase().includes('auth'))) {
          throw new UnauthorizedException({
            code: 'RAZORPAY_AUTH_FAILED',
            message: desc,
          });
        }
        throw new InternalServerErrorException({
          code: 'RAZORPAY_API_ERROR',
          message: desc,
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
      keyId: process.env.RAZORPAY_KEY_ID,
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
    order.payment_status = order.payment_method === 'partial_cod' ? 'partial_paid' : 'captured';
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
        payment.status = 'refunded';
        const order = db.orders.find((o) => o.id === payment.order_id);
        if (order) {
          order.payment_status = 'refunded';
          order.updated_at = new Date().toISOString();
        }
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
        method: p.method || (p.provider === 'razorpay' ? 'Razorpay Gateway' : 'Cash on Delivery'),
        status: p.status === 'captured' ? 'paid' : p.status,
        razorpayPaymentId: p.provider_payment_id || null,
        created_at: p.created_at,
      };
    });
  }

  /** Admin: Process refund */
  refund(id: string, dto?: { amount?: number; reason?: string }) {
    const payment = db.payments.find((p) => p.id === id);
    if (!payment) {
      throw new NotFoundException({ code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found.' });
    }

    payment.status = 'refunded';
    payment.updated_at = new Date().toISOString();

    const order = db.orders.find((o) => o.id === payment.order_id);
    if (order) {
      order.status = 'refunded';
      order.payment_status = 'refunded';
      order.updated_at = new Date().toISOString();
    }

    // Log audit trail
    db.audit_logs.unshift({
      id: `log-${Date.now()}`,
      admin_email: 'admin@bingooo.in',
      action: 'payment.refund_issued',
      resource: 'payments',
      resource_id: payment.id,
      details: `Refund of ₹${dto?.amount || payment.amount} issued. Reason: ${dto?.reason || 'Customer request'}`,
      ip_address: '103.24.12.89',
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Refund issued successfully.',
      paymentId: payment.id,
      status: payment.status,
    };
  }
}

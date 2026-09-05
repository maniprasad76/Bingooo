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
import { db } from '../common/database/store';
import { OrdersService } from '../orders/orders.service';

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  amount?: number; // amount in paise

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
  constructor(private readonly ordersService: OrdersService) {}

  private getRazorpayClient(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new InternalServerErrorException({
        code: 'RAZORPAY_NOT_CONFIGURED',
        message: 'Razorpay credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) not configured',
      });
    }
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Create Razorpay order
   * Minimum amount: 100 paise
   */
  async createRazorpayOrder(dto: CreateOrderDto) {
    let amountInPaise: number;
    let currency = (dto.currency || 'INR').toUpperCase();
    let receipt = dto.receipt;
    let order: any = null;
    let notes: Record<string, any> = dto.notes || {};

    if (dto.orderId) {
      order = db.orders.find((o) => o.id === dto.orderId);
      if (!order) {
        throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
      }
      const payableAmount =
        order.payment_method === 'partial_cod' ? (order.cod_deposit || order.total) : order.total;
      amountInPaise = dto.amount !== undefined ? Math.round(dto.amount) : Math.round(payableAmount * 100);
      receipt = receipt || order.order_number;
      notes = { orderId: order.id, orderNumber: order.order_number, ...notes };
    } else if (dto.amount !== undefined) {
      amountInPaise = Math.round(dto.amount);
      receipt = receipt || `rcpt_${Date.now()}`;
    } else {
      throw new BadRequestException({
        code: 'INVALID_REQUEST',
        message: 'Either amount (in paise) or orderId must be provided',
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

    if (order) {
      const payment = {
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
      };
      db.payments.push(payment);
    }

    return {
      order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      razorpayOrderId: rzpOrder.id,
      orderNumber: order?.order_number,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify Razorpay signature and update order status
   * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
   */
  verifyPayment(dto: VerifyPaymentDto) {
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

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new InternalServerErrorException({
        code: 'RAZORPAY_SECRET_MISSING',
        message: 'Razorpay key secret is not configured on server',
      });
    }

    // Calculate HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const signaturesMatch =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature, 'utf-8'), Buffer.from(signature, 'utf-8'));

    // Find associated payment in store
    const payment = db.payments.find(
      (p) =>
        p.provider_order_id === orderId ||
        (dto.orderId && p.order_id === dto.orderId),
    );

    if (!signaturesMatch) {
      if (payment) {
        payment.status = 'failed';
        payment.updated_at = new Date().toISOString();
      }
      throw new BadRequestException({
        code: 'INVALID_SIGNATURE',
        message: 'Razorpay payment signature mismatch. Verification failed.',
      });
    }

    if (payment) {
      payment.status = 'captured';
      payment.provider_payment_id = paymentId;
      payment.updated_at = new Date().toISOString();

      const order = db.orders.find((o) => o.id === payment.order_id);
      if (order) {
        order.payment_status = 'captured';
        order.status = 'processing';
        order.updated_at = new Date().toISOString();
      }
    }

    return {
      success: true,
      verified: true,
      order_id: orderId,
      payment_id: paymentId,
      orderNumber: payment?.order_number,
      paymentId: payment?.id,
      status: 'captured',
    };
  }

  /** Webhook listener for async Razorpay events */
  handleWebhook(event: any, signature?: string) {
    const eventId = event?.id || uuidv4();
    const existing = db.payments.find((p) => p.raw_event_id === eventId);
    if (existing) {
      return { received: true, idempotent: true };
    }

    const payload = event?.payload?.payment?.entity;
    if (payload?.order_id) {
      const payment = db.payments.find((p) => p.provider_order_id === payload.order_id);
      if (payment) {
        payment.raw_event_id = eventId;
        if (event.event === 'payment.captured') {
          payment.status = 'captured';
          payment.provider_payment_id = payload.id;
          const order = db.orders.find((o) => o.id === payment.order_id);
          if (order) {
            order.payment_status = 'captured';
            order.status = 'processing';
          }
        } else if (event.event === 'payment.failed') {
          payment.status = 'failed';
        }
      }
    }

    return { received: true };
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

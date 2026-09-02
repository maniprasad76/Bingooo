import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { db } from '../common/database/store';
import { OrdersService } from '../orders/orders.service';

export interface RazorpayOrderDto {
  orderId: string;
}

export interface VerifyPaymentDto {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly ordersService: OrdersService) {}

  /** Create Razorpay order */
  createRazorpayOrder(dto: RazorpayOrderDto) {
    const order = db.orders.find((o) => o.id === dto.orderId);
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });

    const payableAmount = order.payment_method === 'partial_cod' ? (order.cod_deposit || order.total) : order.total;
    const amountInPaise = Math.round(payableAmount * 100);
    const mockRazorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const payment = {
      id: uuidv4(),
      order_id: order.id,
      provider: 'razorpay',
      provider_order_id: mockRazorpayOrderId,
      provider_payment_id: null,
      status: 'pending',
      amount: payableAmount,
      currency: 'INR',
      raw_event_id: null,
      idempotency_key: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.payments.push(payment);

    return {
      razorpayOrderId: mockRazorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      orderNumber: order.order_number,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
    };
  }

  /** Verify Razorpay signature and update order status */
  verifyPayment(dto: VerifyPaymentDto) {
    const payment = db.payments.find((p) => p.order_id === dto.orderId && p.provider_order_id === dto.razorpayOrderId);
    if (!payment) throw new NotFoundException({ code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found' });

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = true;

    // Verify cryptographic signature if secret configured
    if (razorpaySecret) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
        .digest('hex');

      isValid = generatedSignature === dto.razorpaySignature;
    }

    if (!isValid) {
      payment.status = 'failed';
      payment.updated_at = new Date().toISOString();
      throw new BadRequestException({ code: 'INVALID_SIGNATURE', message: 'Razorpay signature verification failed' });
    }

    payment.status = 'captured';
    payment.provider_payment_id = dto.razorpayPaymentId;
    payment.updated_at = new Date().toISOString();

    const order = db.orders.find((o) => o.id === dto.orderId);
    if (order) {
      order.payment_status = 'captured';
      order.status = 'processing';
      order.updated_at = new Date().toISOString();
    }

    return {
      verified: true,
      orderNumber: order?.order_number,
      paymentId: payment.id,
      status: payment.status,
    };
  }

  /** Webhook listener for async Razorpay events */
  handleWebhook(event: any, signature?: string) {
    const eventId = event?.id || uuidv4();
    // Check if event already processed for idempotency
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
}

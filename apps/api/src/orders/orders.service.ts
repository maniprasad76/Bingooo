import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';
import { CheckoutService, CheckoutValidationDto } from '../checkout/checkout.service';

export interface CreateOrderDto extends CheckoutValidationDto {
  userId?: string;
  notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(private readonly checkoutService: CheckoutService) {}

  createOrder(dto: CreateOrderDto) {
    const calculation = this.checkoutService.validateAndCalculate(dto);
    const orderId = uuidv4();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BGO-${dateStr}-${randSuffix}`;

    const order = {
      id: orderId,
      order_number: orderNumber,
      user_id: dto.userId || 'mock-user-id',
      status: dto.paymentMethod === 'cod' ? 'processing' : 'pending_payment',
      payment_status: dto.paymentMethod === 'cod' ? 'pending' : 'pending',
      payment_method: dto.paymentMethod,
      subtotal: calculation.subtotal,
      discount: calculation.discount,
      shipping_fee: calculation.shippingFee,
      tax: calculation.tax,
      total: calculation.total,
      currency: 'INR',
      address_snapshot_json: dto.shippingAddress,
      cod_deposit: calculation.codDeposit || null,
      cod_remaining: calculation.codRemaining || null,
      coupon_code: dto.couponCode || null,
      notes: dto.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.orders.push(order);

    // Create order items & adjust inventory
    for (const item of calculation.items) {
      db.order_items.push({
        id: uuidv4(),
        order_id: orderId,
        product_id: item.productId,
        variant_id: item.variantId,
        customization_id: item.customizationId || null,
        sku: item.sku,
        title_snapshot: item.title,
        variant_snapshot_json: { size: item.size, color: item.color, colorHex: item.colorHex },
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
        created_at: new Date().toISOString(),
      });

      // Update variant stock and record inventory movement
      const variant = db.product_variants.find((v) => v.id === item.variantId);
      if (variant) {
        variant.stock_quantity = Math.max(0, variant.stock_quantity - item.quantity);
        db.inventory_movements.push({
          id: uuidv4(),
          variant_id: variant.id,
          type: 'sale',
          quantity: -item.quantity,
          reference_type: 'order',
          reference_id: orderId,
          created_by: dto.userId || null,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Record coupon redemption
    if (dto.couponCode && calculation.coupon) {
      const coupon = db.coupons.find((c) => c.code.toUpperCase() === dto.couponCode?.toUpperCase());
      if (coupon) {
        coupon.usage_count += 1;
        db.coupon_redemptions.push({
          id: uuidv4(),
          coupon_id: coupon.id,
          user_id: dto.userId || 'mock-user-id',
          order_id: orderId,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Clear cart items
    db.cart_items = db.cart_items.filter((i) => i.cart_id !== dto.cartId);

    return this.enrichOrder(order);
  }

  findByUser(userId: string) {
    const userOrders = db.orders.filter((o) => o.user_id === userId);
    return userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((o) => this.enrichOrder(o));
  }

  findByOrderNumber(orderNumber: string) {
    const order = db.orders.find((o) => o.order_number === orderNumber);
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: `Order "${orderNumber}" not found` });
    return this.enrichOrder(order);
  }

  findAllAdmin() {
    return db.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((o) => this.enrichOrder(o));
  }

  updateStatus(orderId: string, status: string, paymentStatus?: string) {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    order.status = status;
    if (paymentStatus) order.payment_status = paymentStatus;
    order.updated_at = new Date().toISOString();
    return this.enrichOrder(order);
  }

  private enrichOrder(order: any) {
    const items = db.order_items.filter((i) => i.order_id === order.id).map((i) => {
      const customization = i.customization_id ? db.customizations.find((c) => c.id === i.customization_id) : null;
      return {
        ...i,
        customization: customization ? { id: customization.id, previewKey: customization.preview_key, status: customization.status } : null,
      };
    });
    const payments = db.payments.filter((p) => p.order_id === order.id);
    const shipments = db.shipments.filter((s) => s.order_id === order.id);

    return {
      ...order,
      items,
      payments,
      shipments,
    };
  }
}

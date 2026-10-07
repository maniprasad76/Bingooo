import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDb } from '../common/database/store';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CheckoutService } from '../checkout/checkout.service';
import { CheckoutValidationDto, CartOwner } from '../checkout/dto/checkout.dto';
import { getOrderById, getOrderByOrderNumber, getImagesByProductId } from '../common/database/db-index.service';


export class CreateOrderDto extends CheckoutValidationDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/** Unpaid prepaid orders release their stock after this long. */
export const UNPAID_ORDER_TTL_MS = 30 * 60 * 1000;
const EXPIRY_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

/** Who performed an admin action, for the audit trail. */
export interface AuditActor {
  email?: string;
  ip?: string;
}

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  private expiryTimer: NodeJS.Timeout | null = null;

  constructor(private readonly checkoutService: CheckoutService) {}

  onModuleInit() {
    this.expiryTimer = setInterval(() => this.expireUnpaidOrders(), EXPIRY_SWEEP_INTERVAL_MS);
    this.expiryTimer.unref?.();
  }

  onModuleDestroy() {
    if (this.expiryTimer) clearInterval(this.expiryTimer);
  }

  /**
   * Return an order's stock and coupon usage. Idempotent: guarded by
   * `inventory_released` so repeated cancels never double-restock.
   * Caller is responsible for saveDb().
   */
  releaseOrderInventory(order: any, reason: string, actorId: string | null = null) {
    if (order.inventory_released) return;
    const now = new Date().toISOString();
    for (const item of db.order_items.filter((i) => i.order_id === order.id)) {
      const variant = db.product_variants.find((v) => v.id === item.variant_id);
      if (!variant) continue;
      variant.stock_quantity += item.quantity;
      db.inventory_movements.push({
        id: uuidv4(),
        variant_id: variant.id,
        type: 'release',
        quantity: item.quantity,
        reference_type: 'order',
        reference_id: order.id,
        notes: reason,
        created_by: actorId,
        created_at: now,
      });
    }
    if (order.coupon_code) {
      const coupon = db.coupons.find((c) => c.code.toUpperCase() === String(order.coupon_code).toUpperCase());
      if (coupon) coupon.usage_count = Math.max(0, (coupon.usage_count || 0) - 1);
      db.coupon_redemptions = db.coupon_redemptions.filter((r) => r.order_id !== order.id);
    }
    order.inventory_released = true;
  }

  /**
   * A payment can still arrive after an order expired. Take the stock back if
   * it is still available; otherwise the order stays cancelled and admins are
   * alerted to refund it. Returns true when the order can be fulfilled.
   */
  reclaimInventory(order: any): boolean {
    if (!order.inventory_released) return true;
    const items = db.order_items.filter((i) => i.order_id === order.id);
    const available = items.every((item) => {
      const variant = db.product_variants.find((v) => v.id === item.variant_id);
      return variant && variant.stock_quantity - (variant.reserved_quantity || 0) >= item.quantity;
    });
    if (!available) {
      db.notifications.unshift({
        id: `notif-${uuidv4()}`,
        category: 'order',
        severity: 'critical',
        title: `Refund needed: #${order.order_number} paid after expiry`,
        description: 'Payment was captured after the order expired and the stock is no longer available.',
        link_href: '/orders',
        link_text: 'Review order →',
        is_read: false,
        created_at: new Date().toISOString(),
      });
      return false;
    }
    const now = new Date().toISOString();
    for (const item of items) {
      const variant = db.product_variants.find((v) => v.id === item.variant_id)!;
      variant.stock_quantity -= item.quantity;
      db.inventory_movements.push({
        id: uuidv4(),
        variant_id: variant.id,
        type: 'sale',
        quantity: -item.quantity,
        reference_type: 'order',
        reference_id: order.id,
        notes: 'reclaimed after late payment',
        created_by: order.user_id,
        created_at: now,
      });
    }
    order.inventory_released = false;
    order.cancel_reason = null;
    return true;
  }

  /** Cancel prepaid orders left unpaid past the TTL and return their stock. */
  expireUnpaidOrders(now = Date.now()) {
    let expired = 0;
    for (const order of db.orders) {
      if (order.status !== 'pending_payment') continue;
      if (now - Date.parse(order.created_at) < UNPAID_ORDER_TTL_MS) continue;
      order.status = 'cancelled';
      order.payment_status = 'expired';
      order.cancel_reason = 'payment_timeout';
      order.updated_at = new Date(now).toISOString();
      this.releaseOrderInventory(order, 'unpaid order expired');
      expired += 1;
    }
    if (expired > 0) saveDb();
    return expired;
  }

  createOrder(dto: CreateOrderDto, owner: CartOwner & { userId: string }) {
    const calculation = this.checkoutService.validateAndCalculate(dto, owner);
    const orderId = uuidv4();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BGO-${dateStr}-${randSuffix}`;

    const order = {
      id: orderId,
      order_number: orderNumber,
      user_id: owner.userId,
      status: 'pending_payment',
      payment_status: 'pending',
      payment_method: 'prepaid',
      subtotal: calculation.subtotal,
      discount: calculation.discount,
      prepaid_discount: calculation.prepaidDiscount || 0,
      tax: calculation.tax,
      total: calculation.total,
      currency: 'INR',
      shipping_address: dto.shippingAddress,
      address_snapshot_json: dto.shippingAddress,
      coupon_code: dto.couponCode || null,
      notes: dto.notes || null,
      tracking_number: null,
      carrier: null,
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
          created_by: owner.userId,
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
          user_id: owner.userId,
          order_id: orderId,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Push notification for admin
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      category: 'order',
      severity: 'info',
      title: `New Order Placed (#${order.order_number})`,
      description: `Order for ₹${order.total} placed via ${order.payment_method.toUpperCase()}`,
      link_href: '/orders',
      link_text: 'View Order →',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Clear cart items
    db.cart_items = db.cart_items.filter((i) => i.cart_id !== dto.cartId);

    saveDb();
    // The WhatsApp confirmation goes out once payment is captured (PaymentsService).
    return this.enrichOrder(order);
  }

  findByUser(userId: string) {
    const userOrders = db.orders.filter((o) => o.user_id === userId || userId === 'all');
    return userOrders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((o) => this.enrichOrder(o));
  }

  findByOrderNumberOrId(identifier: string) {
    const order = getOrderById(identifier) || getOrderByOrderNumber(identifier);
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: `Order "${identifier}" not found` });
    return this.enrichOrder(order);
  }

  findAllAdmin(query?: { status?: string; search?: string }) {
    let items = [...db.orders];
    if (query?.status && query.status !== 'all') {
      items = items.filter((o) => o.status === query.status);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.shipping_address?.name?.toLowerCase().includes(q) ||
          o.shipping_address?.phone?.includes(q) ||
          o.tracking_number?.toLowerCase().includes(q),
      );
    }

    return items
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((o) => this.enrichOrder(o));
  }

  updateStatus(
    orderId: string,
    status: string,
    paymentStatus?: string,
    trackingNumber?: string,
    carrier?: string,
    actor: AuditActor = {},
  ) {
    const order = db.orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Returned stock is only automatic for cancellations; refunds after a
      // return need the garment inspected before it goes back on sale.
      this.releaseOrderInventory(order, 'order cancelled by staff');
    }
    order.status = status;
    if (paymentStatus) order.payment_status = paymentStatus;
    if (trackingNumber) order.tracking_number = trackingNumber;
    if (carrier) order.carrier = carrier;
    order.updated_at = new Date().toISOString();

    // Log audit
    db.audit_logs.unshift({
      id: `log-${uuidv4()}`,
      admin_email: actor.email || 'system',
      action: 'order.status_update',
      resource: 'orders',
      resource_id: order.order_number,
      details: `Status updated to ${status}.${trackingNumber ? ` Carrier: ${carrier || 'BlueDart'} AWB: ${trackingNumber}` : ''}`,
      ip_address: actor.ip || null,
      created_at: new Date().toISOString(),
    });

    saveDb();
    return this.enrichOrder(order);
  }

  deleteOrder(orderId: string, actor: AuditActor = {}) {
    const index = db.orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (index === -1) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    }
    const target = db.orders[index];
    if (!['shipped', 'delivered', 'refunded'].includes(target.status)) {
      this.releaseOrderInventory(target, 'order deleted by staff');
    }
    const [deleted] = db.orders.splice(index, 1);
    db.order_items = db.order_items.filter((i) => i.order_id !== deleted.id);
    db.payments = db.payments.filter((p) => p.order_id !== deleted.id);
    db.shipments = db.shipments.filter((s) => s.order_id !== deleted.id);

    if (db.audit_logs) {
      db.audit_logs.unshift({
        id: `log-${uuidv4()}`,
        admin_email: actor.email || 'system',
        action: 'order.deleted',
        resource: 'orders',
        resource_id: deleted.order_number,
        details: `Order #${deleted.order_number} was permanently removed.`,
        ip_address: actor.ip || null,
        created_at: new Date().toISOString(),
      });
    }

    saveDb();
    return {
      success: true,
      message: `Order #${deleted.order_number} deleted successfully`,
      deletedId: deleted.id,
    };
  }


  enrichOrder(order: any) {
    const items = db.order_items
      .filter((i) => i.order_id === order.id)
      .map((i) => {
        const customization = i.customization_id
          ? db.customizations.find((c) => c.id === i.customization_id)
          : null;
        const variant = i.variant_id ? db.product_variants.find((v) => v.id === i.variant_id) : null;
        const productId = i.product_id || variant?.product_id;
        const product = productId ? db.products.find((p) => p.id === productId) : null;
        const productImages = productId ? getImagesByProductId(productId) : [];
        const primaryImage = productImages.find((img: any) => img.is_primary) || productImages[0];
        const imageUrl =
          customization?.preview_url ||
          customization?.preview_key ||
          (primaryImage ? (primaryImage.url || primaryImage.object_key) : null) ||
          (product as any)?.image_url ||
          null;

        return {
          ...i,
          image: imageUrl,
          imageUrl: imageUrl,
          image_url: imageUrl,
          product_title: i.title_snapshot || product?.title || 'Garment',
          customization: customization
            ? {
                id: customization.id,
                previewKey: customization.preview_url || customization.preview_key,
                status: customization.status,
                designJson: customization.design_json,
                printSpec: customization.print_spec,
              }
            : null,
        };
      });
    const payments = db.payments.filter((p) => p.order_id === order.id);
    const shipments = db.shipments.filter((s) => s.order_id === order.id);

    return {
      ...order,
      primary_image: items[0]?.image_url || null,
      items,
      payments,
      shipments,
    };
  }
}

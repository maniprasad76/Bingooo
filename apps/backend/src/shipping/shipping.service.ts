import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../common/database/store';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Order confirmed',
  confirmed: 'Order confirmed',
  processing: 'In production',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return requested',
  returned: 'Returned',
  refunded: 'Refunded',
};

@Injectable()
export class ShippingService {
  /**
   * Public order tracking by AWB or order number. Returns only what is
   * actually recorded on the order — no simulated hubs, dates or events —
   * and nothing personal (no address, contact or item details).
   */
  track(trackingNumber: string) {
    const query = trackingNumber.trim().toLowerCase();
    const order = db.orders.find(
      (o) => o.tracking_number?.toLowerCase() === query || o.order_number?.toLowerCase() === query,
    );
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'We could not find an order with that number.',
      });
    }

    const status: string = order.status || 'pending_payment';
    const events = [{ status: 'Order placed', timestamp: order.created_at }];
    if (status !== 'pending_payment' && order.updated_at && order.updated_at !== order.created_at) {
      events.push({ status: STATUS_LABELS[status] || status, timestamp: order.updated_at });
    }

    return {
      orderNumber: order.order_number,
      status,
      statusLabel: STATUS_LABELS[status] || status,
      carrier: order.carrier || null,
      trackingNumber: order.tracking_number || null,
      placedAt: order.created_at,
      updatedAt: order.updated_at || order.created_at,
      events,
    };
  }
}

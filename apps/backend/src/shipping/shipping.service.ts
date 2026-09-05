import { Injectable } from '@nestjs/common';
import { db } from '../common/database/store';

@Injectable()
export class ShippingService {
  /** Available delivery tiers */
  getMethods() {
    const threshold = db.settings.free_shipping_threshold || 999;
    const defaultFee = db.settings.shipping_fee_default || 99;

    return [
      {
        id: 'standard',
        name: 'Standard Surface Logistics',
        estimatedDays: '3-5 business days',
        carrier: 'BlueDart / Delhivery Surface',
        rate: defaultFee,
        freeAbove: threshold,
        description: `Delivered via premium surface network. Free on orders above ₹${threshold}.`,
      },
      {
        id: 'express',
        name: 'Express Air Priority',
        estimatedDays: '1-2 business days',
        carrier: 'BlueDart Apex Air',
        rate: 199,
        freeAbove: null,
        description: 'Next-flight priority courier dispatch with guaranteed fast delivery.',
      },
    ];
  }

  /** Calculate shipping fee for cart or checkout */
  calculate(subtotal: number, methodId = 'standard') {
    const threshold = db.settings.free_shipping_threshold || 999;
    const defaultFee = db.settings.shipping_fee_default || 99;

    if (methodId === 'express') {
      return { fee: 199, isFree: false, threshold };
    }

    if (subtotal >= threshold || subtotal === 0) {
      return { fee: 0, isFree: true, threshold };
    }

    return { fee: defaultFee, isFree: false, threshold };
  }

  /** Track parcel by AWB / Tracking number */
  track(trackingNumber: string) {
    // Check if an order in db has this tracking number
    const order = db.orders.find(
      (o) =>
        o.tracking_number?.toLowerCase() === trackingNumber.toLowerCase() ||
        o.order_number?.toLowerCase() === trackingNumber.toLowerCase(),
    );

    const now = Date.now();
    const isDelivered = order?.status === 'delivered';
    const isShipped = order?.status === 'shipped' || isDelivered;

    return {
      trackingNumber,
      carrier: order?.carrier || (trackingNumber.startsWith('BLUE') ? 'BlueDart' : 'Delhivery'),
      orderNumber: order?.order_number || 'BING-89421',
      status: order?.status || 'in_transit',
      estimatedDelivery: new Date(now + 86400000 * 2).toISOString(),
      events: [
        {
          timestamp: new Date(now - 86400000 * 3).toISOString(),
          status: 'Manifest Created',
          location: 'Bengaluru Hub, KA',
          details: 'Shipping label created and parcel packed at Bingooo Garment Center',
        },
        {
          timestamp: new Date(now - 86400000 * 2).toISOString(),
          status: 'Picked Up by Courier',
          location: 'Bengaluru Sort Facility, KA',
          details: 'Package received by carrier logistics partner',
        },
        ...(isShipped
          ? [
              {
                timestamp: new Date(now - 86400000 * 1).toISOString(),
                status: 'In Transit',
                location: 'Regional Transit Sorting Facility',
                details: 'Departed transit hub heading to destination fulfillment center',
              },
            ]
          : []),
        ...(isDelivered
          ? [
              {
                timestamp: new Date(now - 3600000 * 4).toISOString(),
                status: 'Out for Delivery',
                location: 'Local Delivery Station',
                details: 'Courier associate assigned and out for delivery',
              },
              {
                timestamp: new Date(now - 3600000 * 1).toISOString(),
                status: 'Delivered',
                location: 'Customer Address',
                details: 'Shipment delivered to recipient and signed',
              },
            ]
          : []),
      ],
    };
  }
}

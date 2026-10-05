import { Injectable } from '@nestjs/common';
import { db } from '../common/database/store';

@Injectable()
export class ShippingService {
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

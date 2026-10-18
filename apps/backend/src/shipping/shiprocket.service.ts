import { Injectable, Logger, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { db, saveDb } from '../common/database/store';
import { OrdersService } from '../orders/orders.service';

export interface ShiprocketCredentials {
  email?: string;
  password?: string;
}

export interface ServiceabilityCourier {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  estimated_delivery_days: string;
  etd: string;
  rating: number;
}

@Injectable()
export class ShiprocketService {
  private readonly logger = new Logger(ShiprocketService.name);
  private token: string | null = null;
  private tokenExpiresAt: number = 0;
  private readonly apiBase = 'https://apiv2.shiprocket.in/v1/external';

  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Acquire or reuse JWT token for Shiprocket API v2
   */
  async getAuthToken(): Promise<string | null> {
    const email = process.env.SHIPROCKET_EMAIL?.trim();
    const password = process.env.SHIPROCKET_PASSWORD?.trim();

    // If no credentials configured, return null to activate mock sandbox mode
    if (!email || !password) {
      return null;
    }

    const now = Date.now();
    if (this.token && this.tokenExpiresAt > now + 60000) {
      return this.token;
    }

    try {
      const res = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        this.logger.warn(`Shiprocket auth failed (${res.status}): ${errorText}`);
        return null;
      }

      const data = await res.json();
      if (data?.token) {
        this.token = data.token;
        // Shiprocket tokens expire in 10 days; cache for 9 days
        this.tokenExpiresAt = now + 9 * 24 * 60 * 60 * 1000;
        return this.token;
      }
    } catch (err: any) {
      this.logger.error(`Shiprocket auth exception: ${err.message}`);
    }

    return null;
  }

  /**
   * Check courier serviceability and rates for a destination pincode
   */
  async checkServiceability(
    deliveryPincode: string,
    weightKg: number = 0.5,
    pickupPincode: string = '560001',
  ): Promise<{ couriers: ServiceabilityCourier[]; isMock: boolean }> {
    const token = await this.getAuthToken();

    if (token) {
      try {
        const qs = new URLSearchParams({
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          weight: String(weightKg),
          cod: '0', // 100% prepaid
        });

        const res = await fetch(`${this.apiBase}/courier/serviceability/?${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.available_courier_companies || [];
          const couriers: ServiceabilityCourier[] = list.map((c: any) => ({
            courier_company_id: c.courier_company_id,
            courier_name: c.courier_name,
            rate: Math.round(Number(c.rate) || 50),
            estimated_delivery_days: c.estimated_delivery_days || '3-4',
            etd: c.etd || '3-4 Days',
            rating: Number(c.rating) || 4.5,
          }));

          return { couriers, isMock: false };
        }
      } catch (err: any) {
        this.logger.warn(`Serviceability API error: ${err.message}`);
      }
    }

    // Realistic Simulated Sandbox Couriers for Indian logistics
    const mockCouriers: ServiceabilityCourier[] = [
      {
        courier_company_id: 1,
        courier_name: 'Delhivery Surface (Air Connect)',
        rate: 55,
        estimated_delivery_days: '2-3',
        etd: '2-3 Days',
        rating: 4.8,
      },
      {
        courier_company_id: 2,
        courier_name: 'Bluedart Express Air',
        rate: 85,
        estimated_delivery_days: '1-2',
        etd: '1-2 Days',
        rating: 4.9,
      },
      {
        courier_company_id: 3,
        courier_name: 'Xpressbees Standard',
        rate: 45,
        estimated_delivery_days: '3-4',
        etd: '3-4 Days',
        rating: 4.5,
      },
      {
        courier_company_id: 4,
        courier_name: 'DTDC Priority Premium',
        rate: 60,
        estimated_delivery_days: '2-3',
        etd: '2-3 Days',
        rating: 4.6,
      },
    ];

    return { couriers: mockCouriers, isMock: true };
  }

  /**
   * Create an adhoc shipment order in Shiprocket
   */
  async createShipment(orderId: string): Promise<any> {
    const order = db.orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: `Order ${orderId} not found.` });
    }

    const token = await this.getAuthToken();
    // Real order data only: a wrong address, amount or payment type costs a parcel or the cash.
    const addr = order.shipping_address || order.address_snapshot_json || {};
    const recipientName = String(addr.name || '').trim();
    const recipientPhone = String(addr.phone || '').replace(/[^0-9]/g, '').slice(-10);
    const pincode = String(addr.postalCode || addr.postal_code || addr.pincode || '').trim();
    const items = db.order_items.filter((i) => i.order_id === order.id);
    if (!recipientName || recipientPhone.length !== 10 || !addr.line1 || !addr.city || !pincode || items.length === 0) {
      throw new BadRequestException({
        code: 'ORDER_NOT_SHIPPABLE',
        message: 'This order is missing its delivery address, phone or items, so it cannot be sent to Shiprocket.',
      });
    }
    const customerEmail = db.users.find((u) => u.id === order.user_id)?.email || '';

    const orderItems = items.map((item: any) => ({
      name: item.title_snapshot || item.sku,
      sku: item.sku,
      units: item.quantity || 1,
      selling_price: Math.round(item.unit_price || 0),
      discount: 0,
      tax: 0,
      hsn: 610910,
    }));

    const payload = {
      order_id: order.order_number || order.id,
      order_date: new Date(order.created_at || Date.now()).toISOString().slice(0, 10),
      // Must match a pickup location name in the Shiprocket dashboard.
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary Warehouse',
      channel_id: '',
      comment: 'BINGOOO 240 GSM Luxury Streetwear',
      billing_customer_name: recipientName.split(' ')[0],
      billing_last_name: recipientName.split(' ').slice(1).join(' '),
      billing_address: addr.line1,
      billing_address_2: addr.line2 || '',
      billing_city: addr.city,
      billing_pincode: pincode,
      billing_state: addr.state || '',
      billing_country: 'India',
      billing_email: customerEmail,
      billing_phone: recipientPhone,
      shipping_is_billing: true,
      order_items: orderItems,
      // COD tells the courier to collect sub_total in cash at the door.
      payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      // The final order total (discounts and COD fee already applied).
      sub_total: Math.round(order.total || 0),
      length: 30,
      breadth: 25,
      height: 5,
      weight: 0.45 * Math.max(1, items.reduce((n: number, i: any) => n + (i.quantity || 1), 0)),
    };

    if (token) {
      try {
        const res = await fetch(`${this.apiBase}/orders/create/adhoc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          order.shiprocket_order_id = data.order_id;
          order.shiprocket_shipment_id = data.shipment_id;
          order.status = 'processing';
          order.updated_at = new Date().toISOString();
          saveDb();
          return { success: true, ...data, isMock: false };
        }
      } catch (err: any) {
        this.logger.warn(`Shiprocket create order error: ${err.message}`);
      }
    }

    // Never invent a shipment: the admin must know it was not created.
    throw new ServiceUnavailableException({
      code: 'SHIPROCKET_UNAVAILABLE',
      message: token
        ? 'Shiprocket did not create the shipment. Check the order details and try again, or ship manually.'
        : 'Shiprocket is not configured (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD). Ship manually and enter the AWB.',
    });
  }

  /**
   * Assign courier and generate Air Waybill (AWB) number
   */
  async generateAWB(orderId: string, courierId?: number): Promise<any> {
    const order = db.orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: `Order ${orderId} not found.` });
    }

    // If shipment not created yet, create it first
    if (!order.shiprocket_shipment_id) {
      await this.createShipment(order.id);
    }

    const token = await this.getAuthToken();
    const shipmentId = order.shiprocket_shipment_id;

    if (token && shipmentId) {
      try {
        const res = await fetch(`${this.apiBase}/courier/assign/awb`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shipment_id: shipmentId,
            courier_id: courierId || undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const awb = data?.response?.data?.awb_code;
          const carrier = data?.response?.data?.courier_name || 'Delhivery Express';

          if (awb) {
            // Same path as a manual "shipped" update: audit log, WhatsApp and email.
            this.ordersService.updateStatus(order.id, 'shipped', undefined, awb, carrier, { email: 'shiprocket' });

            return {
              success: true,
              awb_code: awb,
              courier_name: carrier,
              isMock: false,
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(`Shiprocket AWB API error: ${err.message}`);
      }
    }

    // Never send the customer a made-up tracking number.
    throw new ServiceUnavailableException({
      code: 'SHIPROCKET_AWB_FAILED',
      message: token
        ? 'Shiprocket did not assign an AWB. Nothing was sent to the customer; try again or ship manually.'
        : 'Shiprocket is not configured. Nothing was sent to the customer; ship manually and enter the AWB.',
    });
  }

  /**
   * Track shipment via Shiprocket AWB
   */
  async trackShipment(awb: string): Promise<any> {
    const token = await this.getAuthToken();

    if (token) {
      try {
        const res = await fetch(`${this.apiBase}/courier/track/awb/${encodeURIComponent(awb)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          return { tracking: data?.tracking_data || data, isMock: false };
        }
      } catch (err: any) {
        this.logger.warn(`Shiprocket track API error: ${err.message}`);
      }
    }

    throw new ServiceUnavailableException({
      code: 'SHIPROCKET_TRACKING_UNAVAILABLE',
      message: 'Live courier tracking is unavailable right now. Use /shipping/track for the order status.',
    });
  }

  /**
   * Ingest webhook notifications from Shiprocket
   */
  async handleWebhook(payload: any): Promise<{ received: boolean; updated: boolean }> {
    const awb = payload?.awb || payload?.awb_code || payload?.current_status_awb;
    const orderId = payload?.order_id;
    const currentStatus = String(payload?.current_status || payload?.shipment_status || '').toUpperCase();

    this.logger.log(`Shiprocket webhook received: AWB ${awb}, status: ${currentStatus}`);

    const order = db.orders.find(
      (o) => (awb && o.tracking_number === awb) || (orderId && (o.id === orderId || o.order_number === orderId)),
    );

    if (!order) {
      return { received: true, updated: false };
    }

    // RTO first: "RTO DELIVERED" means it came back to us, not that the customer got it.
    let next: string | null = null;
    if (currentStatus.includes('RTO') || currentStatus.includes('RETURN')) next = 'returned';
    else if (currentStatus.includes('DELIVERED')) next = 'delivered';
    else if (currentStatus.includes('IN TRANSIT') || currentStatus.includes('SHIPPED') || currentStatus.includes('OUT FOR DELIVERY')) next = 'shipped';

    if (!next || order.status === next) return { received: true, updated: false };
    this.ordersService.updateStatus(order.id, next, undefined, undefined, undefined, { email: 'shiprocket-webhook' });
    return { received: true, updated: true };
  }
}

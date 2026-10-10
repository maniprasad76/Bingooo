import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { db, saveDb } from '../common/database/store';
import { WhatsAppService } from '../notifications/whatsapp.service';

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

  constructor(private readonly whatsAppService: WhatsAppService) {}

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
    const addr = order.shipping_address || {};
    const recipientName = addr.name || order.customer_name || 'Valued Customer';
    const recipientPhone = addr.phone || order.customer_phone || '9999999999';

    const orderItems = (order.items || []).map((item: any, idx: number) => ({
      name: item.product_name || item.title || 'Heavyweight Garment',
      sku: item.sku || `BNG-${idx + 1}`,
      units: item.quantity || 1,
      selling_price: Math.round(item.unit_price || item.price || 999),
      discount: 0,
      tax: 0,
      hsn: 610910,
    }));

    const payload = {
      order_id: order.order_number || order.id,
      order_date: new Date(order.created_at || Date.now()).toISOString().slice(0, 10),
      pickup_location: 'Primary Warehouse',
      channel_id: '',
      comment: 'BINGOOO 240 GSM Luxury Streetwear',
      billing_customer_name: recipientName.split(' ')[0] || 'Customer',
      billing_last_name: recipientName.split(' ').slice(1).join(' ') || 'Bingooo',
      billing_address: [addr.line1, addr.address, addr.street].filter(Boolean).join(' ') || 'Street Address',
      billing_address_2: addr.line2 || '',
      billing_city: addr.city || 'Bangalore',
      billing_pincode: addr.postal_code || addr.postalCode || addr.pincode || '560001',
      billing_state: addr.state || 'Karnataka',
      billing_country: 'India',
      billing_email: order.customer_email || 'orders@bingooo.in',
      billing_phone: recipientPhone.replace(/[^0-9]/g, '').slice(-10) || '9876543210',
      shipping_is_billing: true,
      order_items: orderItems.length > 0 ? orderItems : [{
        name: 'BINGOOO Apparel Item',
        sku: 'BNG-001',
        units: 1,
        selling_price: Math.round(order.total_amount || 999),
      }],
      payment_method: 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: Math.round(order.discount_amount || 0),
      sub_total: Math.round(order.total_amount || 999),
      length: 30,
      breadth: 25,
      height: 5,
      weight: 0.45 * Math.max(1, order.items?.length || 1),
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

    // Sandbox / Mock simulation fallback
    const mockShipmentId = 1000000 + Math.floor(Math.random() * 900000);
    const mockOrderId = 2000000 + Math.floor(Math.random() * 900000);
    order.shiprocket_order_id = mockOrderId;
    order.shiprocket_shipment_id = mockShipmentId;
    order.status = 'processing';
    order.updated_at = new Date().toISOString();
    saveDb();

    return {
      success: true,
      order_id: mockOrderId,
      shipment_id: mockShipmentId,
      status: 'PROCESSING',
      status_code: 1,
      isMock: true,
    };
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
            order.tracking_number = awb;
            order.carrier = carrier;
            order.status = 'shipped';
            order.updated_at = new Date().toISOString();
            saveDb();

            // Notify customer via WhatsApp
            this.whatsAppService.sendShippingUpdate(order).catch(() => {});

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

    // Sandbox / Mock simulation fallback
    const mockCouriers = ['Delhivery Express', 'Bluedart Air', 'Xpressbees Priority', 'DTDC Express'];
    const carrier = mockCouriers[Math.floor(Math.random() * mockCouriers.length)];
    const mockAwb = `BNG${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

    order.tracking_number = mockAwb;
    order.carrier = carrier;
    order.status = 'shipped';
    order.updated_at = new Date().toISOString();
    saveDb();

    // Trigger WhatsApp dispatch alert
    this.whatsAppService.sendShippingUpdate(order).catch(() => {});

    return {
      success: true,
      awb_code: mockAwb,
      courier_name: carrier,
      shipment_id: shipmentId || 1002345,
      isMock: true,
    };
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

    // Local DB lookup fallback
    const order = db.orders.find((o) => o.tracking_number?.toLowerCase() === awb.toLowerCase());
    return {
      tracking: {
        track_status: 1,
        shipment_status: order?.status ? order.status.toUpperCase() : 'SHIPPED',
        carrier_name: order?.carrier || 'Delhivery Surface',
        awb_code: awb,
        current_status: order?.status === 'delivered' ? 'Delivered' : 'In Transit — Out for Delivery Soon',
        origin: 'Bangalore Hub',
        destination: order?.shipping_address?.city || 'Customer Destination',
        events: [
          { status: 'Manifest Generated', activity: 'Parcel packed at BINGOOO Dispatch Atelier', location: 'Bangalore Hub', date: new Date(Date.now() - 86400000).toISOString() },
          { status: 'In Transit', activity: 'Arrived at sorting facility', location: 'Hub Central', date: new Date(Date.now() - 43200000).toISOString() },
          { status: order?.status === 'delivered' ? 'Delivered' : 'Out for Delivery', activity: order?.status === 'delivered' ? 'Delivered to recipient' : 'Dispatched with delivery rider', location: order?.shipping_address?.city || 'Local Hub', date: new Date().toISOString() },
        ],
      },
      isMock: true,
    };
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

    let statusUpdated = false;
    if (currentStatus.includes('DELIVERED')) {
      order.status = 'delivered';
      statusUpdated = true;
    } else if (currentStatus.includes('OUT FOR DELIVERY')) {
      order.status = 'out_for_delivery';
      statusUpdated = true;
    } else if (currentStatus.includes('IN TRANSIT') || currentStatus.includes('SHIPPED')) {
      order.status = 'shipped';
      statusUpdated = true;
    } else if (currentStatus.includes('RTO') || currentStatus.includes('RETURN')) {
      order.status = 'returned';
      statusUpdated = true;
    }

    if (statusUpdated) {
      order.updated_at = new Date().toISOString();
      saveDb();
      this.whatsAppService.sendShippingUpdate(order).catch(() => {});
    }

    return { received: true, updated: statusUpdated };
  }
}

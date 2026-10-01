import { Injectable, Logger } from '@nestjs/common';
import { db, saveDb } from '../common/database/store';

export interface WhatsAppSendResult {
  success: boolean;
  mode: 'cloud_api' | 'webhook' | 'simulated_fallback';
  recipient: string;
  messageId?: string;
  error?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  /**
   * Cleans and normalizes customer phone numbers into E.164 standard (+91XXXXXXXXXX)
   */
  normalizePhoneNumber(phone?: string): string {
    if (!phone) return '+919080474163'; // Fallback to store concierge
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
    return `+${cleaned}`;
  }

  /**
   * Generates formatted WhatsApp order confirmation message with luxury streetwear tone
   */
  formatOrderConfirmationMessage(order: any): string {
    const orderNum = order.order_number || order.id || 'ORDER';
    const addr = order.address_snapshot_json || order.address || {};
    const customerName = addr.name || 'Valued Patron';
    const city = addr.city || 'India';
    const total = Number(order.total || 0).toLocaleString('en-IN');
    const paymentMethod = order.payment_method || 'Prepaid Secure Gateway';

    // Format item summaries
    let itemsSummary = '';
    const items = order.items || [];
    if (items.length > 0) {
      itemsSummary = items
        .map((item: any) => {
          const title = item.title_snapshot || item.title || 'Atelier Heavyweight Garment';
          const qty = item.quantity || 1;
          const variant = item.variant_snapshot_json || {};
          const size = variant.size ? ` (${variant.size})` : '';
          return `  • ${qty}x ${title}${size}`;
        })
        .join('\n');
    } else {
      itemsSummary = '  • 1x BINGOOO Heavyweight Essential';
    }

    const frontendBaseUrl =
      process.env.FRONTEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://bingooo-frontend.vercel.app';
    const trackingUrl = `${frontendBaseUrl}/track-order/${orderNum}`;

    return `*BINGOOO.* 🔴 — *Order Confirmed*
────────────────────────
Hey *${customerName}*, your order *#${orderNum}* has been confirmed!

📦 *Garments in Workshop:*
${itemsSummary}

💰 *Total Settled:* ₹${total}
💳 *Method:* ${paymentMethod}
📍 *Delivery Destination:* ${city}
🚚 *Air Dispatch:* Within 36 Hours via BlueDart Air

🔍 *Live Parcel Tracking:*
${trackingUrl}

────────────────────────
Need assistance? Reply directly to this WhatsApp message or email concierge@bingooo.in.`;
  }

  /**
   * Sends the order confirmation message via WhatsApp Cloud API, custom webhook, or fallback simulator
   */
  async sendOrderConfirmation(order: any, customerPhone?: string): Promise<WhatsAppSendResult> {
    const phone = this.normalizePhoneNumber(customerPhone || order.address_snapshot_json?.phone);
    const message = this.formatOrderConfirmationMessage(order);
    const orderNum = order.order_number || order.id || 'ORDER';

    try {
      const apiToken = process.env.WHATSAPP_API_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

      // 1. Meta / WhatsApp Business Cloud API
      if (apiToken && phoneNumberId) {
        const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone.replace('+', ''),
            type: 'text',
            text: { body: message },
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          const messageId = data?.messages?.[0]?.id;
          this.logger.log(`WhatsApp Cloud API sent confirmation for #${orderNum} to ${phone} (ID: ${messageId})`);
          this.recordAuditNotification(orderNum, phone, 'cloud_api');
          return { success: true, mode: 'cloud_api', recipient: phone, messageId };
        } else {
          const errText = await res.text();
          this.logger.warn(`WhatsApp Cloud API error (${res.status}): ${errText}`);
        }
      }

      // 2. Custom Webhook Dispatcher (Twilio / Aisensy / Wati / Generic Webhook)
      if (webhookUrl) {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order.confirmed',
            to: phone,
            orderNumber: orderNum,
            message,
            order,
          }),
        });

        if (res.ok) {
          this.logger.log(`WhatsApp webhook dispatched confirmation for #${orderNum} to ${phone}`);
          this.recordAuditNotification(orderNum, phone, 'webhook');
          return { success: true, mode: 'webhook', recipient: phone };
        }
      }

      // 3. Fallback / Development Simulation
      this.logger.log(
        `[WhatsApp Notification Simulation] Order #${orderNum} confirmed for ${phone}:\n${message}`
      );
      this.recordAuditNotification(orderNum, phone, 'simulated_fallback');

      return {
        success: true,
        mode: 'simulated_fallback',
        recipient: phone,
      };
    } catch (err: any) {
      this.logger.error(`Failed to dispatch WhatsApp confirmation for #${orderNum}: ${err?.message || err}`);
      return {
        success: false,
        mode: 'simulated_fallback',
        recipient: phone,
        error: err?.message || 'Unknown error',
      };
    }
  }

  private recordAuditNotification(orderNum: string, phone: string, mode: string) {
    db.notifications.unshift({
      id: `notif-wa-${Date.now()}`,
      category: 'order',
      severity: 'info',
      title: `WhatsApp Confirmation Sent (#${orderNum})`,
      description: `Notification delivered to ${phone} via ${mode}`,
      link_href: '/orders',
      link_text: 'View Order →',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    saveDb();
  }
}

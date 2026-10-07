import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { createHmac } from 'crypto';
import { db, saveDb } from '../common/database/store';

export interface WhatsAppSendResult {
  success: boolean;
  mode: 'cloud_api' | 'webhook' | 'not_configured' | 'skipped';
  recipient?: string;
  messageId?: string;
  error?: string;
}

const SEND_TIMEOUT_MS = 10_000;

/**
 * Sends the "your order is confirmed" WhatsApp message once an order's
 * payment is captured.
 *
 * Delivery options, in order of preference:
 * 1. Meta WhatsApp Cloud API (WHATSAPP_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID).
 *    WhatsApp only delivers business-initiated messages that use an approved
 *    template, so set WHATSAPP_ORDER_TEMPLATE to that template's name. The
 *    template body takes four variables: {{1}} customer name, {{2}} order
 *    number, {{3}} amount paid, {{4}} tracking link.
 * 2. A provider webhook (WHATSAPP_WEBHOOK_URL), e.g. AiSensy, Interakt, WATI or
 *    a Zapier/Make hook. Signed with WHATSAPP_WEBHOOK_SECRET when it is set.
 *
 * With neither configured nothing is sent. A failed send never affects the
 * order or the payment; staff get an admin notification to follow up by hand.
 */
@Injectable()
export class WhatsAppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(WhatsAppService.name);

  onApplicationBootstrap() {
    const cloud = Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
    if (cloud && !process.env.WHATSAPP_ORDER_TEMPLATE) {
      this.logger.warn(
        'WhatsApp Cloud API is configured without WHATSAPP_ORDER_TEMPLATE. Plain-text messages only reach customers who messaged the store in the last 24 hours; set an approved template name.',
      );
    }
    if (!cloud && !process.env.WHATSAPP_WEBHOOK_URL) {
      this.logger.log('WhatsApp order confirmations are off (no Cloud API or webhook configured).');
    }
  }

  /** Returns WhatsApp's digits-only international format (91XXXXXXXXXX), or null if unusable. */
  normalizePhoneNumber(phone?: string | null): string | null {
    if (!phone) return null;
    let digits = String(phone).replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    if (digits.length === 10) digits = `91${digits}`;
    return digits.length >= 11 && digits.length <= 15 ? digits : null;
  }

  private trackingUrl(orderNumber: string): string {
    const base = (process.env.FRONTEND_URL || 'https://www.bingooo.co.in').split(',')[0].trim().replace(/\/+$/, '');
    return `${base}/track-order?orderNumber=${encodeURIComponent(orderNumber)}`;
  }

  private customerName(order: any): string {
    const name = String(order.address_snapshot_json?.name || '').trim();
    return name ? name.split(/\s+/)[0] : 'there';
  }

  private amountPaid(order: any): string {
    return Number(order.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  /** Plain-text version, used for the webhook and as the Cloud API fallback without a template. */
  formatOrderConfirmationMessage(order: any): string {
    const orderNumber = order.order_number || order.id;
    const items: any[] = order.items || [];
    const lines = items.map((item) => {
      const title = item.title_snapshot || item.product_title || 'Item';
      const size = item.variant_snapshot_json?.size ? ` (${item.variant_snapshot_json.size})` : '';
      return `• ${item.quantity || 1} × ${title}${size}`;
    });

    return [
      '*BINGOOO.* — Order confirmed',
      '',
      `Hi ${this.customerName(order)}, thank you for shopping with us! We've received your payment and your order *${orderNumber}* is confirmed.`,
      ...(lines.length ? ['', ...lines] : []),
      '',
      `*Paid:* ₹${this.amountPaid(order)}`,
      '',
      `Track your order: ${this.trackingUrl(orderNumber)}`,
      '',
      'Questions? Just reply to this message.',
    ].join('\n');
  }

  /**
   * Sends the confirmation for a paid order, at most once per order. Safe to
   * call from every capture path (client verify and Razorpay webhook).
   */
  async sendOrderConfirmation(order: any): Promise<WhatsAppSendResult> {
    const stored = db.orders.find((o) => o.id === order?.id);
    if (!stored) return { success: false, mode: 'skipped', error: 'order not found' };
    if (stored.payment_status !== 'captured') return { success: false, mode: 'skipped', error: 'order not paid' };
    if (stored.whatsapp_confirmation?.status === 'sent' || stored.whatsapp_confirmation?.status === 'sending') {
      return { success: true, mode: 'skipped', error: 'already sent' };
    }

    const orderNumber = stored.order_number || stored.id;
    const user = stored.user_id ? db.users.find((u) => u.id === stored.user_id) : null;
    const phone = this.normalizePhoneNumber(stored.address_snapshot_json?.phone || user?.phone);

    const cloud = Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    if (!cloud && !webhookUrl) {
      // Lets the thank-you page know not to wait for a message (persisted by the caller's save).
      stored.whatsapp_confirmation = { status: 'off', at: new Date().toISOString() };
      return { success: false, mode: 'not_configured' };
    }

    if (!phone) {
      this.record(stored, { status: 'failed', error: 'no valid phone number' });
      this.notifyStaff(orderNumber, false, 'no valid phone number on the order');
      return { success: false, mode: 'skipped', error: 'no valid phone number' };
    }

    // Claim the send before any await so a concurrent capture can't send twice.
    stored.whatsapp_confirmation = { status: 'sending', at: new Date().toISOString() };

    const enriched = { ...order, ...stored, items: order.items };
    let result: WhatsAppSendResult;
    try {
      result = cloud ? await this.sendViaCloudApi(enriched, phone) : await this.sendViaWebhook(enriched, phone, webhookUrl!);
      if (!result.success && cloud && webhookUrl) {
        result = await this.sendViaWebhook(enriched, phone, webhookUrl);
      }
    } catch (err: any) {
      result = { success: false, mode: cloud ? 'cloud_api' : 'webhook', recipient: phone, error: err?.message || String(err) };
    }

    const masked = `…${phone.slice(-4)}`;
    if (result.success) {
      this.logger.log(`Order ${orderNumber}: WhatsApp confirmation sent to ${masked} via ${result.mode}`);
      this.record(stored, { status: 'sent', mode: result.mode, message_id: result.messageId });
    } else {
      this.logger.warn(`Order ${orderNumber}: WhatsApp confirmation to ${masked} failed via ${result.mode}: ${result.error}`);
      this.record(stored, { status: 'failed', mode: result.mode, error: result.error?.slice(0, 300) });
    }
    this.notifyStaff(orderNumber, result.success, result.error);
    return result;
  }

  private async sendViaCloudApi(order: any, phone: string): Promise<WhatsAppSendResult> {
    const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';
    const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const template = process.env.WHATSAPP_ORDER_TEMPLATE?.trim();
    const orderNumber = order.order_number || order.id;

    const payload = template
      ? {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: template,
            language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', parameter_name: 'customer_name', text: this.customerName(order) },
                  { type: 'text', parameter_name: 'order_number', text: String(orderNumber) },
                  { type: 'text', parameter_name: 'amount', text: `₹${this.amountPaid(order)}` },
                  { type: 'text', parameter_name: 'tracking_url', text: this.trackingUrl(orderNumber) },
                ],
              },
            ],
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: this.formatOrderConfirmationMessage(order), preview_url: false },
        };

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { success: false, mode: 'cloud_api', recipient: phone, error: `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}` };
    }
    const data: any = await res.json().catch(() => ({}));
    return { success: true, mode: 'cloud_api', recipient: phone, messageId: data?.messages?.[0]?.id };
  }

  private async sendViaWebhook(order: any, phone: string, webhookUrl: string): Promise<WhatsAppSendResult> {
    const orderNumber = order.order_number || order.id;
    const body = JSON.stringify({
      event: 'order.confirmed',
      to: `+${phone}`,
      customerName: this.customerName(order),
      orderNumber,
      amount: Number(order.total || 0),
      trackingUrl: this.trackingUrl(orderNumber),
      message: this.formatOrderConfirmationMessage(order),
    });
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
    if (secret) headers['X-Bingooo-Signature'] = createHmac('sha256', secret).update(body).digest('hex');

    const res = await fetch(webhookUrl, { method: 'POST', headers, body, signal: AbortSignal.timeout(SEND_TIMEOUT_MS) });
    if (!res.ok) {
      return { success: false, mode: 'webhook', recipient: phone, error: `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}` };
    }
    return { success: true, mode: 'webhook', recipient: phone };
  }

  private record(order: any, entry: Record<string, unknown>) {
    order.whatsapp_confirmation = { ...entry, at: new Date().toISOString() };
    saveDb();
  }

  private notifyStaff(orderNumber: string, sent: boolean, error?: string) {
    db.notifications.unshift({
      id: `notif-wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: 'order',
      severity: sent ? 'info' : 'warning',
      title: sent ? `WhatsApp confirmation sent (#${orderNumber})` : `WhatsApp confirmation not sent (#${orderNumber})`,
      description: sent
        ? 'The customer was told on WhatsApp that their order is confirmed.'
        : `Message the customer manually. Reason: ${error || 'unknown error'}`.slice(0, 300),
      link_href: '/orders',
      link_text: 'View Order →',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    saveDb();
  }
}

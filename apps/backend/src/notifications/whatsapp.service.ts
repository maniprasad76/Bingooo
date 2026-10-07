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

/** One kind of customer message: its template, variables and plain-text fallback. */
interface MessageSpec {
  event: 'order.confirmed' | 'order.shipped';
  label: string;
  templateEnv: 'WHATSAPP_ORDER_TEMPLATE' | 'WHATSAPP_SHIPPED_TEMPLATE';
  params: Record<string, string>;
  text: string;
}

/**
 * Customer WhatsApp messages for orders:
 * - "order confirmed", once an order's payment is captured;
 * - "order shipped", when staff mark it shipped with a tracking number.
 *
 * Delivery options, in order of preference:
 * 1. Meta WhatsApp Cloud API (WHATSAPP_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID).
 *    WhatsApp only delivers business-initiated messages that use an approved
 *    template with NAMED variables:
 *    - WHATSAPP_ORDER_TEMPLATE: {{customer_name}}, {{order_number}}, {{amount}}, {{tracking_url}}
 *    - WHATSAPP_SHIPPED_TEMPLATE: {{customer_name}}, {{order_number}}, {{carrier}}, {{tracking_number}}, {{tracking_url}}
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
    const cloud = this.cloudConfigured();
    for (const env of ['WHATSAPP_ORDER_TEMPLATE', 'WHATSAPP_SHIPPED_TEMPLATE']) {
      if (cloud && !process.env[env]) {
        this.logger.warn(
          `WhatsApp Cloud API is configured without ${env}. Plain-text messages only reach customers who messaged the store in the last 24 hours; set an approved template name.`,
        );
      }
    }
    if (!cloud && !process.env.WHATSAPP_WEBHOOK_URL) {
      this.logger.log('WhatsApp order messages are off (no Cloud API or webhook configured).');
    }
  }

  private cloudConfigured(): boolean {
    return Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
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

  formatShippedMessage(order: any): string {
    const orderNumber = order.order_number || order.id;
    return [
      '*BINGOOO.* — Your order is on its way',
      '',
      `Hi ${this.customerName(order)}, good news! Your order *${orderNumber}* has shipped${order.carrier ? ` with *${order.carrier}*` : ''}.`,
      '',
      `*Tracking number:* ${order.tracking_number}`,
      `Track it here: ${this.trackingUrl(orderNumber)}`,
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

    const enriched = { ...order, ...stored, items: order.items };
    const orderNumber = stored.order_number || stored.id;
    return this.deliver(stored, 'whatsapp_confirmation', {
      event: 'order.confirmed',
      label: 'confirmation',
      templateEnv: 'WHATSAPP_ORDER_TEMPLATE',
      params: {
        customer_name: this.customerName(stored),
        order_number: String(orderNumber),
        amount: `₹${this.amountPaid(stored)}`,
        tracking_url: this.trackingUrl(orderNumber),
      },
      text: this.formatOrderConfirmationMessage(enriched),
    });
  }

  /**
   * Tells the customer their order shipped. Sent once per tracking number, so
   * correcting a mistyped AWB sends the corrected one.
   */
  async sendShippingUpdate(order: any): Promise<WhatsAppSendResult> {
    const stored = db.orders.find((o) => o.id === order?.id);
    if (!stored) return { success: false, mode: 'skipped', error: 'order not found' };
    const tracking = String(stored.tracking_number || '').trim();
    if (stored.status !== 'shipped' || !tracking) return { success: false, mode: 'skipped', error: 'not shipped' };
    const previous = stored.whatsapp_shipping;
    if (previous?.tracking_number === tracking && ['sent', 'sending'].includes(previous.status)) {
      return { success: true, mode: 'skipped', error: 'already sent' };
    }

    const orderNumber = stored.order_number || stored.id;
    return this.deliver(
      stored,
      'whatsapp_shipping',
      {
        event: 'order.shipped',
        label: 'shipping update',
        templateEnv: 'WHATSAPP_SHIPPED_TEMPLATE',
        params: {
          customer_name: this.customerName(stored),
          order_number: String(orderNumber),
          carrier: String(stored.carrier || 'our courier partner'),
          tracking_number: tracking,
          tracking_url: this.trackingUrl(orderNumber),
        },
        text: this.formatShippedMessage(stored),
      },
      { tracking_number: tracking },
    );
  }

  /** Shared send path: phone lookup, claim, Cloud API or webhook, record and staff alert. */
  private async deliver(
    stored: any,
    recordKey: 'whatsapp_confirmation' | 'whatsapp_shipping',
    spec: MessageSpec,
    extra: Record<string, unknown> = {},
  ): Promise<WhatsAppSendResult> {
    const orderNumber = stored.order_number || stored.id;
    const cloud = this.cloudConfigured();
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    if (!cloud && !webhookUrl) {
      // Lets the storefront know not to wait for a message (persisted by the caller's save).
      stored[recordKey] = { status: 'off', ...extra, at: new Date().toISOString() };
      return { success: false, mode: 'not_configured' };
    }

    const user = stored.user_id ? db.users.find((u) => u.id === stored.user_id) : null;
    const phone = this.normalizePhoneNumber(stored.address_snapshot_json?.phone || user?.phone);
    if (!phone) {
      this.record(stored, recordKey, { status: 'failed', error: 'no valid phone number', ...extra });
      this.notifyStaff(orderNumber, spec.label, false, 'no valid phone number on the order');
      return { success: false, mode: 'skipped', error: 'no valid phone number' };
    }

    // Claim the send before any await so a concurrent trigger can't send twice.
    stored[recordKey] = { status: 'sending', ...extra, at: new Date().toISOString() };

    let result: WhatsAppSendResult;
    try {
      result = cloud ? await this.sendViaCloudApi(spec, phone) : await this.sendViaWebhook(spec, phone, webhookUrl!);
      if (!result.success && cloud && webhookUrl) {
        result = await this.sendViaWebhook(spec, phone, webhookUrl);
      }
    } catch (err: any) {
      result = { success: false, mode: cloud ? 'cloud_api' : 'webhook', recipient: phone, error: err?.message || String(err) };
    }

    const masked = `…${phone.slice(-4)}`;
    if (result.success) {
      this.logger.log(`Order ${orderNumber}: WhatsApp ${spec.label} sent to ${masked} via ${result.mode}`);
      this.record(stored, recordKey, { status: 'sent', mode: result.mode, message_id: result.messageId, ...extra });
    } else {
      this.logger.warn(`Order ${orderNumber}: WhatsApp ${spec.label} to ${masked} failed via ${result.mode}: ${result.error}`);
      this.record(stored, recordKey, { status: 'failed', mode: result.mode, error: result.error?.slice(0, 300), ...extra });
    }
    this.notifyStaff(orderNumber, spec.label, result.success, result.error);
    return result;
  }

  private async sendViaCloudApi(spec: MessageSpec, phone: string): Promise<WhatsAppSendResult> {
    const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';
    const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const template = process.env[spec.templateEnv]?.trim();

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
                parameters: Object.entries(spec.params).map(([name, text]) => ({ type: 'text', parameter_name: name, text })),
              },
            ],
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: spec.text, preview_url: false },
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

  private async sendViaWebhook(spec: MessageSpec, phone: string, webhookUrl: string): Promise<WhatsAppSendResult> {
    const p = spec.params;
    const body = JSON.stringify({
      event: spec.event,
      to: `+${phone}`,
      customerName: p.customer_name,
      orderNumber: p.order_number,
      ...(p.amount ? { amount: p.amount } : {}),
      ...(p.carrier ? { carrier: p.carrier, trackingNumber: p.tracking_number } : {}),
      trackingUrl: p.tracking_url,
      message: spec.text,
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

  private record(order: any, key: string, entry: Record<string, unknown>) {
    order[key] = { ...entry, at: new Date().toISOString() };
    saveDb();
  }

  private notifyStaff(orderNumber: string, label: string, sent: boolean, error?: string) {
    db.notifications.unshift({
      id: `notif-wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: 'order',
      severity: sent ? 'info' : 'warning',
      title: sent ? `WhatsApp ${label} sent (#${orderNumber})` : `WhatsApp ${label} not sent (#${orderNumber})`,
      description: sent
        ? `The customer received the ${label} on WhatsApp.`
        : `Message the customer manually. Reason: ${error || 'unknown error'}`.slice(0, 300),
      link_href: '/orders',
      link_text: 'View Order →',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    saveDb();
  }
}

// ─────────────────────────────────────────────────────────────────
// BINGOOO. Transactional Email Service — Powered by Resend REST API
// Handles: Password Reset · Order Confirmation · Status Updates
// Zero npm dependency — uses native fetch (Node 18+)
// ─────────────────────────────────────────────────────────────────

import { Injectable, Logger } from '@nestjs/common';

// ── Brand tokens ──────────────────────────────────────────────────
const BRAND = {
  name: 'BINGOOO.',
  tagline: 'Wear what defines you.',
  cream: '#F7EEDB',
  charcoal: '#171717',
  red: '#E6321C',
  url: process.env.FRONTEND_URL || 'https://bingooo.co.in',
  supportEmail: 'support@bingooo.co.in',
  logoText: 'BINGOOO<span style="color:#E6321C">.</span>',
};

// ── HTML escaping ─────────────────────────────────────────────────
// Customer- and admin-entered values (names, addresses, tracking text) are
// interpolated into HTML; escape them so they cannot inject markup or links.
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Resend REST helper ─────────────────────────────────────────────
async function sendViaResend(payload: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Graceful degradation — log to console in local dev
    console.warn(
      '[Email] RESEND_API_KEY not configured. Email preview:\n',
      `TO: ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}\n`,
      `SUBJECT: ${payload.subject}\n`,
      `--- (HTML body suppressed in logs) ---`,
    );
    return { ok: false, error: 'RESEND_NOT_CONFIGURED' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (body as any)?.message || res.statusText };
    }
    return { ok: true, id: (body as any)?.id };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ── Shared email shell ─────────────────────────────────────────────
function emailShell(title: string, previewText: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F0E8D5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#F0E8D5;">${previewText}&nbsp;‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0E8D5;">
    <tr>
      <td align="center" style="padding:40px 20px 0;">
        <!-- Logo bar -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td style="padding:0 0 24px 0;text-align:center;">
              <a href="${BRAND.url}" style="text-decoration:none;">
                <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:28px;font-weight:900;letter-spacing:-1px;color:${BRAND.charcoal};">BINGOOO<span style="color:${BRAND.red};">.</span></span>
              </a>
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${BRAND.cream};border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
          <!-- Top accent bar -->
          <tr><td height="4" style="background-color:${BRAND.red};font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 36px;">
              ${body}
            </td>
          </tr>

          <!-- Footer divider -->
          <tr><td style="padding:0 48px;"><hr style="border:none;border-top:1px solid rgba(23,23,23,0.1);margin:0;"/></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 36px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B6356;">${BRAND.tagline}</p>
              <p style="margin:0;font-size:11px;color:#9E9285;">
                Questions? Reply to this email or contact
                <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.red};text-decoration:none;">${BRAND.supportEmail}</a>
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#B5ADA5;">
                © ${new Date().getFullYear()} BINGOOO. All rights reserved.<br/>
                Mumbai, Maharashtra, India
              </p>
            </td>
          </tr>
        </table>
        <div style="height:40px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Injectable Service ─────────────────────────────────────────────

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress = `BINGOOO. <noreply@bingooo.co.in>`;

  // ── 1. Password Reset Email ─────────────────────────────────────
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    recipientName?: string,
  ): Promise<void> {
    const resetUrl = `${BRAND.url}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const greeting = recipientName ? `Hi ${escapeHtml(recipientName.split(' ')[0])},` : 'Hi there,';

    const body = `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.charcoal};letter-spacing:-0.5px;">Reset your password</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#6B6356;">${greeting}</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${BRAND.charcoal};">
        We received a request to reset the password for your BINGOOO. account associated with <strong>${escapeHtml(to)}</strong>.
        If you made this request, click the button below. This link expires in <strong>1 hour</strong>.
      </p>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="${resetUrl}"
               style="display:inline-block;background-color:${BRAND.red};color:${BRAND.cream};text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#6B6356;">
        If the button doesn't work, paste this URL into your browser:
      </p>
      <p style="margin:0 0 24px;font-size:12px;word-break:break-all;">
        <a href="${resetUrl}" style="color:${BRAND.red};text-decoration:none;">${resetUrl}</a>
      </p>

      <div style="background-color:rgba(230,50,28,0.06);border-left:3px solid ${BRAND.red};border-radius:4px;padding:14px 16px;margin-bottom:8px;">
        <p style="margin:0;font-size:13px;color:${BRAND.charcoal};">
          <strong>Didn't request this?</strong> You can safely ignore this email — your password will remain unchanged.
        </p>
      </div>
    `;

    const result = await sendViaResend({
      from: this.fromAddress,
      to,
      subject: 'Reset your BINGOOO. password',
      html: emailShell('Reset Your Password — BINGOOO.', 'Your password reset link is ready. It expires in 1 hour.', body),
      replyTo: BRAND.supportEmail,
    });

    if (result.ok) {
      this.logger.log(`[Email] Password reset email sent to ${to} (id: ${result.id})`);
    } else {
      this.logger.warn(`[Email] Failed to send password reset to ${to}: ${result.error}`);
    }
  }

  // ── 2. Order Confirmation Email ─────────────────────────────────
  async sendOrderConfirmationEmail(params: {
    to: string;
    recipientName: string;
    orderNumber: string;
    orderId: string;
    items: Array<{ title: string; sku: string; quantity: number; price: number }>;
    subtotal: number;
    discount: number;
    shippingFee: number;
    tax: number;
    total: number;
    paymentMethod: string;
    shippingAddress: {
      full_name?: string;
      address_line1?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    codDeposit?: number;
    codRemaining?: number;
  }): Promise<void> {
    const { to, recipientName, orderNumber, orderId } = params;
    const orderUrl = `${BRAND.url}/orders/${orderId}`;
    const firstName = recipientName?.split(' ')[0] || 'there';

    const formatINR = (amount: number) =>
      `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

    const itemRows = params.items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(23,23,23,0.06);">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:${BRAND.charcoal};">${escapeHtml(item.title)}</p>
            <p style="margin:0;font-size:12px;color:#9E9285;">SKU: ${escapeHtml(item.sku)} &middot; Qty: ${item.quantity}</p>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(23,23,23,0.06);text-align:right;font-size:14px;font-weight:600;color:${BRAND.charcoal};">
            ${formatINR(item.price * item.quantity)}
          </td>
        </tr>`,
      )
      .join('');

    const body = `
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${BRAND.charcoal};letter-spacing:-0.5px;">Order confirmed! 🎉</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#6B6356;">Hi ${escapeHtml(firstName)}, thanks for your order. We're on it!</p>

      <!-- Order number badge -->
      <div style="background-color:rgba(23,23,23,0.04);border-radius:8px;padding:16px 20px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9E9285;letter-spacing:1px;text-transform:uppercase;">Order Number</p>
          <p style="margin:0;font-size:18px;font-weight:800;color:${BRAND.charcoal};">${orderNumber}</p>
        </div>
        <a href="${orderUrl}" style="display:inline-block;background-color:${BRAND.charcoal};color:${BRAND.cream};text-decoration:none;font-weight:600;font-size:13px;padding:10px 20px;border-radius:6px;">
          Track Order
        </a>
      </div>

      <!-- Items table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9E9285;font-weight:600;padding-bottom:8px;border-bottom:2px solid rgba(23,23,23,0.1);">Item</th>
            <th style="text-align:right;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9E9285;font-weight:600;padding-bottom:8px;border-bottom:2px solid rgba(23,23,23,0.1);">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        ${params.discount > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#6B6356;">Discount</td><td style="padding:4px 0;font-size:13px;color:#2E9E58;text-align:right;">-${formatINR(params.discount)}</td></tr>` : ''}
        <tr><td style="padding:4px 0;font-size:13px;color:#6B6356;">Shipping</td><td style="padding:4px 0;font-size:13px;color:${BRAND.charcoal};text-align:right;">${params.shippingFee === 0 ? '<span style="color:#2E9E58;">FREE</span>' : formatINR(params.shippingFee)}</td></tr>
        ${params.tax > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#6B6356;">Taxes</td><td style="padding:4px 0;font-size:13px;color:${BRAND.charcoal};text-align:right;">${formatINR(params.tax)}</td></tr>` : ''}
        <tr>
          <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:${BRAND.charcoal};border-top:2px solid rgba(23,23,23,0.1);">Total</td>
          <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:${BRAND.charcoal};text-align:right;border-top:2px solid rgba(23,23,23,0.1);">${formatINR(params.total)}</td>
        </tr>
      </table>

      <!-- Shipping address -->
      <div style="background-color:rgba(23,23,23,0.04);border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#9E9285;letter-spacing:1px;text-transform:uppercase;">Shipping To</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.charcoal};">
          ${escapeHtml(params.shippingAddress.full_name || recipientName)}<br/>
          ${escapeHtml(params.shippingAddress.address_line1)}<br/>
          ${escapeHtml(params.shippingAddress.city)}, ${escapeHtml(params.shippingAddress.state)} ${escapeHtml(params.shippingAddress.pincode)}
        </p>
      </div>
    `;

    const result = await sendViaResend({
      from: this.fromAddress,
      to,
      subject: `Order ${orderNumber} confirmed — BINGOOO.`,
      html: emailShell(
        `Order ${orderNumber} Confirmed — BINGOOO.`,
        `Your order ${orderNumber} is confirmed. We're preparing your garments now.`,
        body,
      ),
      replyTo: BRAND.supportEmail,
    });

    if (result.ok) {
      this.logger.log(`[Email] Order confirmation sent to ${to} for ${orderNumber} (id: ${result.id})`);
    } else {
      this.logger.warn(`[Email] Failed to send order confirmation to ${to}: ${result.error}`);
    }
  }

  // ── 3. Order Status Update Email ────────────────────────────────
  async sendOrderStatusUpdateEmail(params: {
    to: string;
    recipientName: string;
    orderNumber: string;
    orderId: string;
    newStatus: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  }): Promise<void> {
    const { to, recipientName, orderNumber, orderId, newStatus } = params;
    const firstName = recipientName?.split(' ')[0] || 'there';
    const orderUrl = `${BRAND.url}/orders/${orderId}`;

    const statusConfig: Record<string, { emoji: string; title: string; message: string; color: string }> = {
      confirmed: {
        emoji: '✅',
        title: 'Order Confirmed',
        message: `Your order <strong>${orderNumber}</strong> has been confirmed and is being prepared by our craft team.`,
        color: '#2E9E58',
      },
      processing: {
        emoji: '🧵',
        title: 'Your Garment Is Being Crafted',
        message: `Great news! Your order <strong>${orderNumber}</strong> is now in production. Our artisans are working on your garment.`,
        color: '#D97706',
      },
      shipped: {
        emoji: '📦',
        title: 'Your Order Is On Its Way!',
        message: `Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.`,
        color: BRAND.red,
      },
      out_for_delivery: {
        emoji: '🛵',
        title: 'Out for Delivery Today!',
        message: `Your order <strong>${orderNumber}</strong> is out for delivery today. Make sure someone is available to receive it!`,
        color: BRAND.red,
      },
      delivered: {
        emoji: '🎉',
        title: 'Order Delivered!',
        message: `Your order <strong>${orderNumber}</strong> has been delivered. We hope you love it!`,
        color: '#2E9E58',
      },
      cancelled: {
        emoji: '❌',
        title: 'Order Cancelled',
        message: `Your order <strong>${orderNumber}</strong> has been cancelled. If you have any questions, please reach out to us.`,
        color: '#6B6356',
      },
    };

    const config = statusConfig[newStatus] || {
      emoji: '📋',
      title: `Order Update: ${escapeHtml(newStatus)}`,
      message: `Your order <strong>${orderNumber}</strong> status has been updated to <strong>${escapeHtml(newStatus)}</strong>.`,
      color: BRAND.charcoal,
    };

    const trackingBlock =
      params.trackingNumber
        ? `<div style="background-color:rgba(23,23,23,0.04);border-radius:8px;padding:16px 20px;margin-top:20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9E9285;letter-spacing:1px;text-transform:uppercase;">Tracking</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:${BRAND.charcoal};">${escapeHtml(params.trackingNumber)}</p>
          ${params.carrier ? `<p style="margin:2px 0 0;font-size:13px;color:#6B6356;">via ${escapeHtml(params.carrier)}</p>` : ''}
          ${params.estimatedDelivery ? `<p style="margin:4px 0 0;font-size:13px;color:#6B6356;">Estimated delivery: <strong>${escapeHtml(params.estimatedDelivery)}</strong></p>` : ''}
        </div>`
        : '';

    const body = `
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:44px;margin-bottom:12px;">${config.emoji}</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${BRAND.charcoal};">${config.title}</h1>
        <p style="margin:0;font-size:14px;color:#6B6356;">Hi ${escapeHtml(firstName)},</p>
      </div>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${BRAND.charcoal};">${config.message}</p>

      ${trackingBlock}

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
        <tr>
          <td align="center">
            <a href="${orderUrl}" style="display:inline-block;background-color:${BRAND.charcoal};color:${BRAND.cream};text-decoration:none;font-weight:700;font-size:14px;padding:13px 32px;border-radius:8px;letter-spacing:0.3px;">
              View Order Details
            </a>
          </td>
        </tr>
      </table>
    `;

    const result = await sendViaResend({
      from: this.fromAddress,
      to,
      subject: `${config.emoji} ${config.title} — ${orderNumber}`,
      html: emailShell(`${config.title} — BINGOOO.`, config.message.replace(/<[^>]*>/g, ''), body),
      replyTo: BRAND.supportEmail,
    });

    if (result.ok) {
      this.logger.log(`[Email] Status update (${newStatus}) sent to ${to} for ${orderNumber}`);
    } else {
      this.logger.warn(`[Email] Failed to send status update to ${to}: ${result.error}`);
    }
  }
}

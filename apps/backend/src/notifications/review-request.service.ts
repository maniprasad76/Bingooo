import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { db, saveDb } from '../common/database/store';
import { EmailService } from '../email/email.service';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Ask once the customer has had a few days to wear the piece. */
const DEFAULT_DELAY_DAYS = 4;
/** Never ask about old orders (e.g. ones delivered before this feature existed). */
const MAX_AGE_DAYS = 30;
/** Keep each run small; the next hourly run picks up the rest. */
const MAX_PER_RUN = 50;
/** A failed send (e.g. the email provider was down) is retried on later runs. */
const MAX_ATTEMPTS = 3;

/**
 * Emails customers a few days after delivery asking them to review what they
 * bought. Real reviews are what earn star ratings in search results.
 *
 * Runs hourly and is restart-safe: the decision is based on the order's
 * delivered_at timestamp, and order.review_request records that the email went
 * out, so each order is asked at most once. Orders with a return in progress
 * and products the customer has already reviewed are skipped.
 */
@Injectable()
export class ReviewRequestService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(ReviewRequestService.name);
  private timer: NodeJS.Timeout | null = null;
  private firstRun: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly emailService: EmailService) {}

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'test') return;
    // Let boot-time hydration from Supabase finish first.
    this.firstRun = setTimeout(() => this.tick(), 3 * 60 * 1000);
    this.timer = setInterval(() => this.tick(), 60 * 60 * 1000);
    this.firstRun.unref?.();
    this.timer.unref?.();
  }

  onApplicationShutdown() {
    if (this.firstRun) clearTimeout(this.firstRun);
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const sent = await this.sendDueRequests();
      if (sent > 0) this.logger.log(`Sent ${sent} review request(s).`);
    } catch (err) {
      this.logger.error(`Review request run failed: ${(err as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  private delayMs(): number {
    const days = Number(process.env.REVIEW_REQUEST_DELAY_DAYS);
    return (Number.isFinite(days) && days >= 0 ? days : DEFAULT_DELAY_DAYS) * DAY_MS;
  }

  private frontendUrl(): string {
    return (process.env.FRONTEND_URL || 'https://www.bingooo.co.in').split(',')[0].trim().replace(/\/+$/, '');
  }

  /** Products on the order the customer hasn't reviewed yet, with review links. */
  private reviewableItems(order: any) {
    const seen = new Set<string>();
    const items: Array<{ title: string; url: string; imageUrl?: string }> = [];
    for (const item of db.order_items.filter((i: any) => i.order_id === order.id)) {
      const variant = item.variant_id ? db.product_variants.find((v: any) => v.id === item.variant_id) : null;
      const productId = item.product_id || variant?.product_id;
      const product = productId ? db.products.find((p: any) => p.id === productId) : null;
      if (!product || product.status !== 'active' || seen.has(product.id)) continue;
      seen.add(product.id);
      if (db.reviews.some((r: any) => r.product_id === product.id && r.user_id === order.user_id)) continue;
      const image =
        db.product_images.find((img: any) => img.product_id === product.id && img.is_primary) ||
        db.product_images.find((img: any) => img.product_id === product.id);
      items.push({
        title: item.title_snapshot || product.title,
        url: `${this.frontendUrl()}/product/${encodeURIComponent(product.slug)}?review=1#reviews`,
        imageUrl: image?.url || image?.object_key || undefined,
      });
    }
    return items;
  }

  /** Sends every review request that is due. Returns how many were sent. */
  async sendDueRequests(now = Date.now()): Promise<number> {
    const delay = this.delayMs();
    const due = db.orders.filter((o: any) => {
      if (o.status !== 'delivered' || !o.delivered_at) return false;
      const previous = o.review_request;
      if (previous && !(previous.status === 'failed' && (previous.attempts || 1) < MAX_ATTEMPTS)) return false;
      const age = now - Date.parse(o.delivered_at);
      return age >= delay && age <= MAX_AGE_DAYS * DAY_MS;
    });

    let sent = 0;
    for (const order of due.slice(0, MAX_PER_RUN)) {
      const at = new Date(now).toISOString();
      if (db.returns.some((r: any) => r.order_id === order.id && !['rejected', 'cancelled'].includes(String(r.status)))) {
        order.review_request = { status: 'skipped', reason: 'return in progress', at };
        continue;
      }
      const user = order.user_id ? db.users.find((u: any) => u.id === order.user_id) : null;
      const to = String(user?.email || order.email || '').trim();
      const items = this.reviewableItems(order);
      if (!to || items.length === 0) {
        order.review_request = { status: 'skipped', reason: !to ? 'no email' : 'nothing left to review', at };
        continue;
      }

      // Claim before the await so an overlapping run can't send twice.
      const attempts = (order.review_request?.attempts || 0) + 1;
      order.review_request = { status: 'sending', attempts, at };
      const result = await this.emailService.sendReviewRequestEmail({
        to,
        recipientName: order.address_snapshot_json?.name || user?.full_name || '',
        orderNumber: order.order_number,
        items,
      });
      order.review_request = result.ok
        ? { status: 'sent', id: result.id, attempts, at: new Date().toISOString() }
        : { status: 'failed', error: String(result.error || '').slice(0, 300), attempts, at: new Date().toISOString() };
      if (result.ok) sent++;
    }
    if (due.length) saveDb();
    return sent;
  }
}

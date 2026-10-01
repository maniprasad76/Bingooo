import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDb } from '../common/database/store';

@Injectable()
export class ReviewsService {
  /** Check if a customer is eligible to submit a review for a product */
  checkEligibility(productId: string, userId?: string) {
    if (!userId) {
      return { eligible: false, hasPurchased: false, reason: 'AUTHENTICATION_REQUIRED' };
    }
    const product = db.products.find((p) => p.id === productId || p.slug === productId);
    if (!product) {
      return { eligible: false, hasPurchased: false, reason: 'PRODUCT_NOT_FOUND' };
    }

    const userOrders = db.orders.filter(
      (o) => (o.user_id === userId || o.customer_id === userId) && o.status !== 'cancelled',
    );

    const matchingOrder = userOrders.find((order) => {
      const items = db.order_items.filter((oi) => oi.order_id === order.id);
      return items.some((item) => {
        if (item.product_id === product.id) return true;
        const variant = db.product_variants.find((v) => v.id === item.variant_id);
        return variant && variant.product_id === product.id;
      });
    });

    const hasReviewedAlready = db.reviews.some(
      (r) => r.product_id === product.id && r.user_id === userId,
    );

    if (hasReviewedAlready) {
      return { eligible: false, hasPurchased: true, hasReviewedAlready: true, reason: 'ALREADY_REVIEWED' };
    }

    if (!matchingOrder) {
      return { eligible: false, hasPurchased: false, reason: 'PURCHASE_REQUIRED' };
    }

    return { eligible: true, hasPurchased: true, orderId: matchingOrder.id };
  }

  /** Public: get approved reviews for product */
  findByProduct(productId: string) {
    // Find matching by product id or slug
    const product = db.products.find((p) => p.id === productId || p.slug === productId);
    const targetId = product ? product.id : productId;

    const list = db.reviews.filter((r) => r.product_id === targetId && r.status === 'approved');
    const avgRating = list.length > 0 ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;

    // Calculate real fit breakdown
    const fitCounts = { runs_small: 0, true_to_size: 0, runs_large: 0 };
    for (const r of list) {
      const fit = (r.fit_feedback || 'true_to_size') as keyof typeof fitCounts;
      if (fitCounts[fit] !== undefined) {
        fitCounts[fit]++;
      } else {
        fitCounts.true_to_size++;
      }
    }
    const totalWithFit = list.length || 1;
    const fitBreakdown = {
      runsSmallPct: Math.round((fitCounts.runs_small / totalWithFit) * 100),
      trueToSizePct: Math.round((fitCounts.true_to_size / totalWithFit) * 100),
      runsLargePct: Math.round((fitCounts.runs_large / totalWithFit) * 100),
    };

    // Real star distribution (1 to 5 stars)
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of list) {
      const stars = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[stars] = (distribution[stars] || 0) + 1;
    }

    return {
      reviews: list.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        customerName: r.customer_name || 'Verified Buyer',
        verifiedBuyer: Boolean(r.verified_buyer),
        fitFeedback: r.fit_feedback || 'true_to_size',
        imageUrl: r.image_url || null,
        created_at: r.created_at,
      })),
      total: list.length,
      averageRating: Number(avgRating.toFixed(1)),
      distribution,
      fitBreakdown,
    };
  }

  /** Customer: submit verified review */
  createReview(data: {
    productId: string;
    userId?: string;
    rating: number;
    title?: string;
    body?: string;
    customerName?: string;
    imageUrl?: string;
    fitFeedback?: 'runs_small' | 'true_to_size' | 'runs_large';
    bypassPurchaseCheck?: boolean;
  }) {
    const product = db.products.find((p) => p.id === data.productId || p.slug === data.productId);
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });

    const user = data.userId ? db.users.find((u) => u.id === data.userId) : null;
    const userId = data.userId || 'usr-cust-1';

    // Verify genuine purchase: check user's orders unless test/admin bypass flag is set
    const userOrders = db.orders.filter(
      (o) => (o.user_id === userId || o.customer_id === userId) && o.status !== 'cancelled',
    );
    const hasPurchased = userOrders.some((order) => {
      const items = db.order_items.filter((oi) => oi.order_id === order.id);
      return items.some((item) => {
        if (item.product_id === product.id) return true;
        const variant = db.product_variants.find((v) => v.id === item.variant_id);
        return variant && variant.product_id === product.id;
      });
    });

    if (!hasPurchased && !data.bypassPurchaseCheck) {
      throw new ForbiddenException({
        code: 'PURCHASE_REQUIRED',
        message: 'Only verified customers who have purchased this garment may submit a review.',
      });
    }

    const review = {
      id: `rev-${Date.now()}`,
      product_id: product.id,
      product_title: product.title,
      user_id: userId,
      customer_name: data.customerName || (user ? user.full_name : 'Verified Customer'),
      rating: Math.max(1, Math.min(5, Number(data.rating))),
      title: data.title || '',
      body: data.body || '',
      fit_feedback: data.fitFeedback || 'true_to_size',
      status: 'approved',
      // Only a real purchase earns the badge; staff-entered reviews do not.
      verified_buyer: hasPurchased,
      image_url: data.imageUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.reviews.unshift(review);
    saveDb();
    return review;
  }

  /** Customer: get user submitted reviews */
  findByUser(userId: string) {
    return db.reviews.filter((r) => r.user_id === userId);
  }

  /** Admin: get all reviews with status/search filter */
  getAllAdmin(status?: string, search?: string) {
    let items = [...db.reviews];
    if (status && status !== 'all') {
      items = items.filter((r) => r.status === status);
    }
    if (search) {
      const term = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(term) ||
          r.product_title?.toLowerCase().includes(term) ||
          r.title?.toLowerCase().includes(term) ||
          r.body?.toLowerCase().includes(term),
      );
    }

    return items.map((r) => ({
      id: r.id,
      customerName: r.customer_name,
      productTitle: r.product_title || 'Bingooo Garment',
      rating: r.rating,
      title: r.title,
      body: r.body,
      status: r.status,
      verifiedBuyer: Boolean(r.verified_buyer),
      imageUrl: r.image_url,
      created_at: r.created_at,
    }));
  }

  /** Admin: approve or reject review */
  updateStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    const review = db.reviews.find((r) => r.id === id);
    if (!review) {
      throw new NotFoundException({ code: 'REVIEW_NOT_FOUND', message: 'Review not found.' });
    }
    review.status = status;
    review.updated_at = new Date().toISOString();
    saveDb();
    return review;
  }

  /** Admin: delete review */
  delete(id: string) {
    db.reviews = db.reviews.filter((r) => r.id !== id);
    saveDb();
    return { success: true, id };
  }
}


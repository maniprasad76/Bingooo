import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class ReviewsService {
  /** Public: get approved reviews for product */
  findByProduct(productId: string) {
    // Find matching by product id or slug
    const product = db.products.find((p) => p.id === productId || p.slug === productId);
    const targetId = product ? product.id : productId;

    const list = db.reviews.filter((r) => r.product_id === targetId && r.status === 'approved');
    const avgRating = list.length > 0 ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;
    return {
      reviews: list.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        customerName: r.customer_name || 'Verified Buyer',
        verifiedBuyer: Boolean(r.verified_buyer),
        imageUrl: r.image_url || null,
        created_at: r.created_at,
      })),
      total: list.length,
      averageRating: Number(avgRating.toFixed(1)),
    };
  }

  /** Customer: submit review */
  createReview(data: {
    productId: string;
    userId?: string;
    rating: number;
    title?: string;
    body?: string;
    customerName?: string;
    imageUrl?: string;
  }) {
    const product = db.products.find((p) => p.id === data.productId || p.slug === data.productId);
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });

    const user = data.userId ? db.users.find((u) => u.id === data.userId) : null;

    const review = {
      id: `rev-${Date.now()}`,
      product_id: product.id,
      product_title: product.title,
      user_id: data.userId || 'usr-cust-1',
      customer_name: data.customerName || (user ? user.full_name : 'Customer'),
      rating: Math.max(1, Math.min(5, Number(data.rating))),
      title: data.title || '',
      body: data.body || '',
      status: 'approved', // Auto-approved
      verified_buyer: true,
      image_url: data.imageUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.reviews.unshift(review);
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
    return review;
  }

  /** Admin: delete review */
  delete(id: string) {
    db.reviews = db.reviews.filter((r) => r.id !== id);
    return { success: true, id };
  }
}

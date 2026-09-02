import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class ReviewsService {
  findByProduct(productId: string) {
    const list = db.reviews.filter((r) => r.product_id === productId && r.status === 'approved');
    const avgRating = list.length > 0 ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;
    return {
      reviews: list,
      total: list.length,
      averageRating: avgRating,
    };
  }

  createReview(data: { productId: string; userId?: string; rating: number; title?: string; body?: string }) {
    const product = db.products.find((p) => p.id === data.productId);
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });

    const review = {
      id: uuidv4(),
      product_id: data.productId,
      user_id: data.userId || 'mock-user-id',
      rating: Math.max(1, Math.min(5, data.rating)),
      title: data.title || null,
      body: data.body || null,
      status: 'approved', // auto-approve in mock
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.reviews.push(review);
    return review;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class WishlistService {
  getUserWishlist(userId: string) {
    const entries = db.wishlists.filter((w) => w.user_id === userId);
    const productIds = entries.map((w) => w.product_id);
    const products = db.products.filter((p) => productIds.includes(p.id));
    return products.map((p) => {
      const variants = db.product_variants.filter((v) => v.product_id === p.id);
      return {
        ...p,
        variants,
        inStock: variants.some((v) => v.stock_quantity - v.reserved_quantity > 0),
      };
    });
  }

  addToWishlist(userId: string, productId: string) {
    const product = db.products.find((p) => p.id === productId);
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });

    const exists = db.wishlists.find((w) => w.user_id === userId && w.product_id === productId);
    if (!exists) {
      db.wishlists.push({
        id: uuidv4(),
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString(),
      });
    }
    return this.getUserWishlist(userId);
  }

  removeFromWishlist(userId: string, productId: string) {
    db.wishlists = db.wishlists.filter((w) => !(w.user_id === userId && w.product_id === productId));
    return this.getUserWishlist(userId);
  }

  isInWishlist(userId: string, productId: string) {
    return { inWishlist: db.wishlists.some((w) => w.user_id === userId && w.product_id === productId) };
  }
}

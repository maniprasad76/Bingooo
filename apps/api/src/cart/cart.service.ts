import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  /** Get or create active cart for user or guest session */
  getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      sessionId = uuidv4();
    }

    let cart = db.carts.find(
      (c) => c.status === 'active' && ((userId && c.user_id === userId) || (!userId && sessionId && c.session_id === sessionId)),
    );

    if (!cart) {
      cart = {
        id: uuidv4(),
        user_id: userId || null,
        session_id: sessionId || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.carts.push(cart);
    }

    return this.getEnrichedCart(cart.id);
  }

  /** Add item to cart */
  addItem(dto: AddToCartDto, userId?: string) {
    const variant = db.product_variants.find((v) => v.id === dto.variantId && v.is_active);
    if (!variant) throw new NotFoundException({ code: 'VARIANT_NOT_FOUND', message: 'Product variant not found or unavailable' });

    const availableStock = variant.stock_quantity - variant.reserved_quantity;
    if (availableStock < dto.quantity) {
      throw new BadRequestException({ code: 'INSUFFICIENT_STOCK', message: `Only ${availableStock} items available in stock` });
    }

    const cart = this.getOrCreateCart(userId, dto.sessionId);

    // Look for existing item with identical variant & customization
    const existing = db.cart_items.find(
      (item) => item.cart_id === cart.id && item.variant_id === dto.variantId && item.customization_id === (dto.customizationId || null),
    );

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (availableStock < newQty) {
        throw new BadRequestException({ code: 'INSUFFICIENT_STOCK', message: `Cannot add more. Max available is ${availableStock}` });
      }
      existing.quantity = newQty;
    } else {
      db.cart_items.push({
        id: uuidv4(),
        cart_id: cart.id,
        variant_id: dto.variantId,
        quantity: dto.quantity,
        customization_id: dto.customizationId || null,
        created_at: new Date().toISOString(),
      });
    }

    return this.getEnrichedCart(cart.id);
  }

  /** Update quantity of an item */
  updateItem(itemId: string, dto: UpdateCartItemDto, userId?: string, sessionId?: string) {
    const item = db.cart_items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException({ code: 'ITEM_NOT_FOUND', message: 'Cart item not found' });

    const variant = db.product_variants.find((v) => v.id === item.variant_id);
    if (variant && (variant.stock_quantity - variant.reserved_quantity) < dto.quantity) {
      throw new BadRequestException({ code: 'INSUFFICIENT_STOCK', message: 'Requested quantity exceeds available stock' });
    }

    item.quantity = dto.quantity;
    return this.getEnrichedCart(item.cart_id);
  }

  /** Remove item */
  removeItem(itemId: string) {
    const idx = db.cart_items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new NotFoundException({ code: 'ITEM_NOT_FOUND', message: 'Cart item not found' });
    const cartId = db.cart_items[idx].cart_id;
    db.cart_items.splice(idx, 1);
    return this.getEnrichedCart(cartId);
  }

  /** Clear all items in cart */
  clearCart(userId?: string, sessionId?: string) {
    const cart = db.carts.find(
      (c) => c.status === 'active' && ((userId && c.user_id === userId) || (!userId && sessionId && c.session_id === sessionId)),
    );
    if (cart) {
      db.cart_items = db.cart_items.filter((item) => item.cart_id !== cart.id);
      return this.getEnrichedCart(cart.id);
    }
    return { id: null, items: [], subtotal: 0, total: 0, itemCount: 0 };
  }

  /** Merge guest session cart into authenticated user cart */
  mergeCart(guestSessionId: string, userId: string) {
    const guestCart = db.carts.find((c) => c.session_id === guestSessionId && c.status === 'active');
    if (!guestCart) return this.getOrCreateCart(userId);

    const userCart = this.getOrCreateCart(userId);
    const guestItems = db.cart_items.filter((i) => i.cart_id === guestCart.id);

    for (const gItem of guestItems) {
      const existing = db.cart_items.find(
        (uItem) => uItem.cart_id === userCart.id && uItem.variant_id === gItem.variant_id && uItem.customization_id === gItem.customization_id,
      );
      if (existing) {
        existing.quantity += gItem.quantity;
      } else {
        gItem.cart_id = userCart.id;
      }
    }

    guestCart.status = 'merged';
    return this.getEnrichedCart(userCart.id);
  }

  /** Calculate totals and enrich item data */
  private getEnrichedCart(cartId: string) {
    const cart = db.carts.find((c) => c.id === cartId);
    if (!cart) throw new NotFoundException({ code: 'CART_NOT_FOUND', message: 'Cart not found' });

    const rawItems = db.cart_items.filter((i) => i.cart_id === cartId);
    const items = rawItems.map((item) => {
      const variant = db.product_variants.find((v) => v.id === item.variant_id);
      const product = variant ? db.products.find((p) => p.id === variant.product_id) : null;
      const customization = item.customization_id ? db.customizations.find((c) => c.id === item.customization_id) : null;

      const unitPrice = variant ? variant.price : 0;
      const total = unitPrice * item.quantity;

      return {
        id: item.id,
        variantId: item.variant_id,
        quantity: item.quantity,
        customizationId: item.customization_id,
        unitPrice,
        total,
        product: product ? { id: product.id, title: product.title, slug: product.slug } : null,
        variant: variant ? { id: variant.id, sku: variant.sku, size: variant.size, color: variant.color, colorHex: variant.color_hex } : null,
        customization: customization ? { id: customization.id, previewKey: customization.preview_key, status: customization.status } : null,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const freeShippingThreshold = db.settings.free_shipping_threshold || 999;
    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : (db.settings.shipping_fee_default || 99);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + shippingFee + tax;

    return {
      id: cart.id,
      userId: cart.user_id,
      sessionId: cart.session_id,
      items,
      itemCount,
      subtotal,
      shippingFee,
      tax,
      total,
      freeShippingThreshold,
      qualifiesForFreeShipping: subtotal >= freeShippingThreshold,
    };
  }
}

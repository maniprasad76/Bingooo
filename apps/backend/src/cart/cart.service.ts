import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';
import { getCategoryById, getImagesByProductId } from '../common/database/db-index.service';
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

    // A design can only be added by the customer who created it; otherwise its
    // artwork (design_json / print_spec) would leak through the cart and order.
    if (dto.customizationId) {
      const customization = db.customizations.find((c) => c.id === dto.customizationId);
      if (!customization || !userId || customization.user_id !== userId) {
        throw new NotFoundException({ code: 'CUSTOMIZATION_NOT_FOUND', message: 'Customization not found' });
      }
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

  /**
   * Resolve a cart item only if its cart belongs to the caller: the signed-in
   * user it is bound to, or the guest session that created it.
   */
  private findOwnedItem(itemId: string, userId?: string, sessionId?: string) {
    const item = db.cart_items.find((i) => i.id === itemId);
    const cart = item && db.carts.find((c) => c.id === item.cart_id);
    const owned =
      !!cart &&
      ((!!userId && cart.user_id === userId) ||
        (!cart.user_id && !!sessionId && cart.session_id === sessionId));
    if (!item || !owned) {
      throw new NotFoundException({ code: 'ITEM_NOT_FOUND', message: 'Cart item not found' });
    }
    return item;
  }

  /** Update quantity of an item */
  updateItem(itemId: string, dto: UpdateCartItemDto, userId?: string, sessionId?: string) {
    const item = this.findOwnedItem(itemId, userId, sessionId);

    const variant = db.product_variants.find((v) => v.id === item.variant_id);
    if (variant && (variant.stock_quantity - variant.reserved_quantity) < dto.quantity) {
      throw new BadRequestException({ code: 'INSUFFICIENT_STOCK', message: 'Requested quantity exceeds available stock' });
    }

    item.quantity = dto.quantity;
    return this.getEnrichedCart(item.cart_id);
  }

  /** Remove item */
  removeItem(itemId: string, userId?: string, sessionId?: string) {
    const item = this.findOwnedItem(itemId, userId, sessionId);
    const cartId = item.cart_id;
    db.cart_items = db.cart_items.filter((i) => i.id !== itemId);
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
    // Only unclaimed guest carts can be merged; a cart already bound to a
    // user is never pulled into someone else's account.
    const guestCart = db.carts.find(
      (c) => c.session_id === guestSessionId && c.status === 'active' && !c.user_id,
    );
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

      const category = product?.category_id ? getCategoryById(product.category_id) : null;
      const productImages = product ? getImagesByProductId(product.id) : [];
      const primaryImage = productImages.find((img: any) => img.is_primary) || productImages[0];
      const imageUrl = primaryImage ? (primaryImage.url || primaryImage.object_key) : (product as any)?.image_url || null;

      return {
        id: item.id,
        variantId: item.variant_id,
        quantity: item.quantity,
        customizationId: item.customization_id,
        unitPrice,
        total,
        image: imageUrl,
        imageUrl: imageUrl,
        product: product
          ? {
              id: product.id,
              title: product.title,
              slug: product.slug,
              category: category?.name || (product as any).category || 'Apparel',
              fabric: product.fabric || null,
              gsm: product.gsm || null,
              fabricWeight: product.gsm ? `${product.gsm} GSM` : product.fabric || '240 GSM',
              images: productImages.map((img: any) => ({
                id: img.id,
                url: img.url,
                isPrimary: img.is_primary,
              })),
            }
          : null,
        variant: variant
          ? {
              id: variant.id,
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              colorHex: variant.color_hex,
            }
          : null,
        customization: customization
          ? {
              id: customization.id,
              previewKey: customization.preview_key,
              status: customization.status,
            }
          : null,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const tax = 0; // All prices are all-inclusive (no extra GST)
    const total = subtotal;

    return {
      id: cart.id,
      userId: cart.user_id,
      sessionId: cart.session_id,
      items,
      itemCount,
      subtotal,
      tax,
      total,
    };
  }
}

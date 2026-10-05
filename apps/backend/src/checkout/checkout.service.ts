import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { db } from '../common/database/store';
import { CouponsService } from '../coupons/coupons.service';
import { CheckoutValidationDto, CartOwner } from './dto/checkout.dto';

export { CheckoutValidationDto };
export type { CartOwner };

@Injectable()
export class CheckoutService {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * A cart may only be checked out by its owner: the signed-in user it is
   * bound to, or (for a guest cart) the browser session that created it.
   */
  assertCartOwnership(cartId: string, owner: CartOwner) {
    const cart = db.carts.find((c) => c.id === cartId);
    const ownsCart =
      !!cart &&
      ((!!owner.userId && cart.user_id === owner.userId) ||
        (!cart.user_id && !!owner.sessionId && cart.session_id === owner.sessionId));
    if (!ownsCart) {
      throw new NotFoundException({ code: 'CART_NOT_FOUND', message: 'Cart not found' });
    }
    return cart;
  }

  validateAndCalculate(dto: CheckoutValidationDto, owner: CartOwner) {
    this.assertCartOwnership(dto.cartId, owner);
    const rawItems = db.cart_items.filter((i) => i.cart_id === dto.cartId);
    if (rawItems.length === 0) {
      throw new BadRequestException({ code: 'EMPTY_CART', message: 'Cart is empty' });
    }

    // Validate stock for all items
    const validatedItems = rawItems.map((item) => {
      const variant = db.product_variants.find((v) => v.id === item.variant_id);
      if (!variant) throw new BadRequestException({ code: 'INVALID_VARIANT', message: 'One or more items in cart no longer exist' });

      const available = variant.stock_quantity - variant.reserved_quantity;
      if (available < item.quantity) {
        throw new BadRequestException({
          code: 'INSUFFICIENT_STOCK',
          message: `Item ${variant.sku} has only ${available} left in stock (you requested ${item.quantity})`,
        });
      }

      const product = db.products.find((p) => p.id === variant.product_id);
      const customization = item.customization_id ? db.customizations.find((c) => c.id === item.customization_id) : null;

      return {
        variantId: variant.id,
        productId: product?.id,
        title: product?.title || 'Product',
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        colorHex: variant.color_hex,
        unitPrice: variant.price,
        quantity: item.quantity,
        total: variant.price * item.quantity,
        customizationId: item.customization_id,
        customizationPreview: customization?.preview_key || null,
      };
    });

    const subtotal = validatedItems.reduce((sum, item) => sum + item.total, 0);

    // Apply coupon if provided
    let discount = 0;
    let couponInfo: any = null;
    if (dto.couponCode) {
      try {
        couponInfo = this.couponsService.validateCoupon(dto.couponCode, subtotal, owner.userId);
        discount = couponInfo.discountAmount;
      } catch (err: any) {
        throw new BadRequestException(err.response || { message: 'Coupon validation failed' });
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);

    // All orders are 100% secure prepaid; apply prepaid discount
    const prepaidPct = Number(db.settings.prepaid_discount_percentage) || 5;
    const prepaidDiscount = Math.round(discountedSubtotal * (prepaidPct / 100));

    const tax = 0; // All prices are all-inclusive (no extra GST)
    const total = Math.max(0, discountedSubtotal - prepaidDiscount);

    return {
      isValid: true,
      items: validatedItems,
      itemCount: validatedItems.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      discount,
      prepaidDiscount,
      coupon: couponInfo,
      tax,
      total,
      paymentMethod: 'prepaid' as const,
      payableNow: total,
      shippingAddress: dto.shippingAddress,
    };
  }
}

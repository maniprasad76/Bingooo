import { Injectable, BadRequestException } from '@nestjs/common';
import { db } from '../common/database/store';
import { CouponsService } from '../coupons/coupons.service';

export interface CheckoutValidationDto {
  cartId: string;
  couponCode?: string;
  paymentMethod: 'prepaid' | 'cod' | 'partial_cod';
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

@Injectable()
export class CheckoutService {
  constructor(private readonly couponsService: CouponsService) {}

  validateAndCalculate(dto: CheckoutValidationDto) {
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
        couponInfo = this.couponsService.validateCoupon(dto.couponCode, subtotal);
        discount = couponInfo.discountAmount;
      } catch (err: any) {
        throw new BadRequestException(err.response || { message: 'Coupon validation failed' });
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const freeShippingThreshold = db.settings.free_shipping_threshold || 999;
    const shippingFee = discountedSubtotal >= freeShippingThreshold || discountedSubtotal === 0 ? 0 : (db.settings.shipping_fee_default || 99);
    const tax = Math.round(discountedSubtotal * 0.05); // 5% GST
    const total = discountedSubtotal + shippingFee + tax;

    // COD calculation
    let codDeposit = 0;
    let codRemaining = 0;
    if (dto.paymentMethod === 'partial_cod') {
      const depositPct = db.settings.cod_deposit_percentage || 30;
      codDeposit = Math.round((total * depositPct) / 100);
      codRemaining = total - codDeposit;
    } else if (dto.paymentMethod === 'cod') {
      codDeposit = 0;
      codRemaining = total;
    }

    return {
      isValid: true,
      items: validatedItems,
      itemCount: validatedItems.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      discount,
      coupon: couponInfo,
      shippingFee,
      tax,
      total,
      paymentMethod: dto.paymentMethod,
      codDeposit,
      codRemaining,
      payableNow: dto.paymentMethod === 'partial_cod' ? codDeposit : dto.paymentMethod === 'cod' ? 0 : total,
      shippingAddress: dto.shippingAddress,
    };
  }
}

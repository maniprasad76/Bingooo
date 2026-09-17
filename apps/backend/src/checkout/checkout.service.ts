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

    // Apply prepaid discount if applicable
    let prepaidDiscount = 0;
    if (dto.paymentMethod === 'prepaid') {
      const prepaidPct = Number(db.settings.prepaid_discount_percentage) || 5;
      prepaidDiscount = Math.round(discountedSubtotal * (prepaidPct / 100));
    }

    const finalSubtotal = Math.max(0, discountedSubtotal - prepaidDiscount);
    const freeShippingThreshold = db.settings.free_shipping_threshold || 999;
    const shippingFee = finalSubtotal >= freeShippingThreshold || finalSubtotal === 0 ? 0 : (db.settings.shipping_fee_default || 99);
    const tax = Math.round(finalSubtotal * 0.05); // 5% GST
    const total = finalSubtotal + shippingFee + tax;

    // COD calculation
    let codDeposit = 0;
    let codRemaining = 0;
    if (dto.paymentMethod === 'partial_cod') {
      if (db.settings.partial_cod_enabled === false) {
        throw new BadRequestException({
          code: 'PARTIAL_COD_DISABLED',
          message: 'Partial Cash on Delivery is currently disabled by store policy',
        });
      }
      // Advance security deposit (default ₹79)
      codDeposit = Number(db.settings.partial_cod_advance_amount) || 79;
      codDeposit = Math.min(codDeposit, total);
      codRemaining = Math.max(0, total - codDeposit);
    } else if (dto.paymentMethod === 'cod') {
      if (db.settings.cod_enabled === false) {
        throw new BadRequestException({
          code: 'COD_DISABLED',
          message: 'Cash on Delivery is currently disabled by store policy',
        });
      }
      const maxCod = Number(db.settings.max_cod_limit) || 5000;
      if (total > maxCod) {
        throw new BadRequestException({
          code: 'COD_LIMIT_EXCEEDED',
          message: `Cash on Delivery is capped at ₹${maxCod}. Please choose Partial COD (₹79 advance) or Prepaid.`,
        });
      }
      codDeposit = 0;
      codRemaining = total;
    }

    return {
      isValid: true,
      items: validatedItems,
      itemCount: validatedItems.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      discount,
      prepaidDiscount,
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

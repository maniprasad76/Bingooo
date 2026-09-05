import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class CouponsService {
  validateCoupon(code: string, orderSubtotal: number) {
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.is_active);
    if (!coupon) {
      throw new NotFoundException({ code: 'COUPON_INVALID', message: 'Invalid or inactive coupon code' });
    }

    if (coupon.min_order_value && orderSubtotal < coupon.min_order_value) {
      throw new BadRequestException({
        code: 'COUPON_MIN_ORDER',
        message: `Minimum order amount of ₹${coupon.min_order_value} required for coupon ${coupon.code}`,
      });
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      throw new BadRequestException({ code: 'COUPON_EXHAUSTED', message: 'Coupon usage limit has been reached' });
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = Math.min(coupon.value, orderSubtotal);
    }

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      finalSubtotal: Math.max(0, orderSubtotal - discountAmount),
    };
  }

  findAll() {
    return db.coupons;
  }

  create(data: any) {
    const coupon = {
      id: uuidv4(),
      code: data.code.toUpperCase(),
      type: data.type,
      value: Number(data.value),
      min_order_value: data.minOrderValue ? Number(data.minOrderValue) : null,
      max_discount: data.maxDiscount ? Number(data.maxDiscount) : null,
      usage_limit: data.usageLimit ? Number(data.usageLimit) : null,
      usage_count: 0,
      starts_at: data.startsAt || null,
      ends_at: data.endsAt || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.coupons.push(coupon);
    return coupon;
  }

  toggleActive(id: string) {
    const coupon = db.coupons.find((c) => c.id === id);
    if (!coupon) throw new NotFoundException({ code: 'COUPON_NOT_FOUND', message: 'Coupon not found' });
    coupon.is_active = !coupon.is_active;
    coupon.updated_at = new Date().toISOString();
    return coupon;
  }

  delete(id: string) {
    const index = db.coupons.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException({ code: 'COUPON_NOT_FOUND', message: 'Coupon not found' });
    db.coupons.splice(index, 1);
    return { success: true, id };
  }
}


import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class InventoryService {
  findAll(search?: string, lowStockOnly = false) {
    const normalizedSearch = search?.trim().toLowerCase();

    return db.product_variants
      .map((variant) => {
        const product = db.products.find((item) => item.id === variant.product_id);
        const availableStock = variant.stock_quantity - variant.reserved_quantity;
        return {
          id: variant.id,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          stockQuantity: variant.stock_quantity,
          reservedQuantity: variant.reserved_quantity,
          availableStock,
          lowStock: availableStock < 5,
          product: product ? { id: product.id, title: product.title, slug: product.slug } : null,
          updatedAt: variant.updated_at,
        };
      })
      .filter((variant) => !lowStockOnly || variant.lowStock)
      .filter((variant) => !normalizedSearch || [variant.sku, variant.product?.title, variant.color, variant.size]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)))
      .sort((a, b) => Number(b.lowStock) - Number(a.lowStock) || a.product?.title.localeCompare(b.product?.title ?? '') || 0);
  }

  adjust(variantId: string, quantity: number, reason?: string, userId?: string) {
    if (!Number.isInteger(quantity) || quantity === 0) {
      throw new BadRequestException({ code: 'INVALID_ADJUSTMENT', message: 'Enter a non-zero whole-number adjustment.' });
    }

    const variant = db.product_variants.find((item) => item.id === variantId);
    if (!variant) throw new NotFoundException({ code: 'VARIANT_NOT_FOUND', message: 'Inventory item not found.' });

    const nextQuantity = variant.stock_quantity + quantity;
    if (nextQuantity < variant.reserved_quantity) {
      throw new BadRequestException({ code: 'STOCK_BELOW_RESERVED', message: 'Stock cannot be reduced below reserved quantity.' });
    }

    variant.stock_quantity = nextQuantity;
    variant.updated_at = new Date().toISOString();
    db.inventory_movements.push({
      id: uuidv4(),
      variant_id: variant.id,
      type: 'adjustment',
      quantity,
      reference_type: reason || 'manual adjustment',
      reference_id: null,
      created_by: userId || null,
      created_at: variant.updated_at,
    });

    return this.findAll().find((item) => item.id === variantId);
  }

  history(variantId: string) {
    if (!db.product_variants.some((item) => item.id === variantId)) {
      throw new NotFoundException({ code: 'VARIANT_NOT_FOUND', message: 'Inventory item not found.' });
    }
    return db.inventory_movements
      .filter((movement) => movement.variant_id === variantId)
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

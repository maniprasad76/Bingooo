import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class CustomizationsService {
  saveCustomization(data: {
    userId?: string;
    productId: string;
    designJson: any;
    previewKey?: string;
    printFileKey?: string;
  }) {
    const product = db.products.find((p) => p.id === data.productId);
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });

    const customization = {
      id: uuidv4(),
      user_id: data.userId || 'mock-user-id',
      product_id: data.productId,
      status: 'uploaded',
      design_json: data.designJson,
      preview_key: data.previewKey || null,
      print_file_key: data.printFileKey || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.customizations.push(customization);
    return customization;
  }

  findById(id: string) {
    const cust = db.customizations.find((c) => c.id === id);
    if (!cust) throw new NotFoundException({ code: 'CUSTOMIZATION_NOT_FOUND', message: 'Customization not found' });
    const product = db.products.find((p) => p.id === cust.product_id);
    return {
      ...cust,
      product: product ? { id: product.id, title: product.title, slug: product.slug, basePrice: product.base_price } : null,
    };
  }

  findByUser(userId: string) {
    const list = db.customizations.filter((c) => c.user_id === userId);
    return list.map((cust) => {
      const product = db.products.find((p) => p.id === cust.product_id);
      return {
        ...cust,
        product: product ? { id: product.id, title: product.title, slug: product.slug } : null,
      };
    });
  }

  updateStatus(id: string, status: string) {
    const cust = db.customizations.find((c) => c.id === id);
    if (!cust) throw new NotFoundException({ code: 'CUSTOMIZATION_NOT_FOUND', message: 'Customization not found' });
    cust.status = status;
    cust.updated_at = new Date().toISOString();
    return cust;
  }

  getAllForAdmin() {
    return db.customizations.map((cust) => {
      const product = db.products.find((p) => p.id === cust.product_id);
      return {
        ...cust,
        product: product ? { id: product.id, title: product.title, slug: product.slug } : null,
      };
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

@Injectable()
export class CustomizationsService {
  /** Save a new custom design from the Customizer Studio */
  saveCustomization(data: {
    userId?: string;
    productId: string;
    productSlug?: string;
    designJson: any;
    previewKey?: string;
    printFileKey?: string;
    printSpec?: any;
    customerNotes?: string;
  }) {
    const product = db.products.find(
      (p) => p.id === data.productId || p.slug === data.productId || p.slug === data.productSlug,
    );

    const user = data.userId ? db.users.find((u) => u.id === data.userId) : null;

    const customization = {
      id: `cust-${Date.now()}`,
      user_id: data.userId || 'usr-cust-1',
      product_id: product ? product.id : data.productId,
      product_title: product ? product.title : 'Custom Apparel',
      status: 'approved', // ready for print
      print_status: 'ready_to_print',
      design_json: data.designJson || {},
      preview_url: data.previewKey || '/custom/tshirt-step-3-black.png',
      print_file_key: data.printFileKey || null,
      print_spec: data.printSpec || {
        method: 'DTG (Direct-to-Garment)',
        placement: 'Chest & Back Print',
        resolutionDPI: 300,
        colorSpace: 'CMYK',
      },
      customer_name: user ? user.full_name : 'Customer',
      customer_email: user ? user.email : 'customer@bingooo.in',
      customer_notes: data.customerNotes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.customizations.unshift(customization);

    // Push notification to admin print queue
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      category: 'custom',
      severity: 'warning',
      title: `New Custom Design Submitted (#${customization.id})`,
      description: `${customization.customer_name} created artwork for ${customization.product_title}`,
      link_href: '/custom-orders',
      link_text: 'Open Custom Print Queue →',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return customization;
  }

  findById(id: string) {
    const cust = db.customizations.find((c) => c.id === id);
    if (!cust) throw new NotFoundException({ code: 'CUSTOMIZATION_NOT_FOUND', message: 'Customization not found' });
    const product = db.products.find((p) => p.id === cust.product_id);
    return {
      ...cust,
      product: product
        ? { id: product.id, title: product.title, slug: product.slug, basePrice: product.base_price }
        : null,
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

  updateStatus(id: string, status: string, printStatus?: string) {
    const cust = db.customizations.find((c) => c.id === id);
    if (!cust) throw new NotFoundException({ code: 'CUSTOMIZATION_NOT_FOUND', message: 'Customization not found' });
    cust.status = status;
    if (printStatus) cust.print_status = printStatus;
    cust.updated_at = new Date().toISOString();
    return cust;
  }

  getQueue(query?: { status?: string; search?: string }) {
    let items = [...db.customizations];
    if (query?.status && query.status !== 'all') {
      items = items.filter((c) => c.status === query.status || c.print_status === query.status);
    }
    if (query?.search) {
      const term = query.search.toLowerCase();
      items = items.filter(
        (c) =>
          c.customer_name?.toLowerCase().includes(term) ||
          c.product_title?.toLowerCase().includes(term) ||
          c.id?.toLowerCase().includes(term),
      );
    }
    return items.map((cust) => {
      const product = db.products.find((p) => p.id === cust.product_id);
      return {
        ...cust,
        product: product ? { id: product.id, title: product.title, slug: product.slug } : null,
      };
    });
  }

  /** Bulk custom requirements inquiry methods */
  getRequirements(query?: { status?: string; search?: string }) {
    let items = [...(db.custom_requirements || [])];
    if (query?.status && query.status !== 'all') {
      items = items.filter((r) => r.status === query.status);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.customerName?.toLowerCase().includes(q) ||
          r.customerEmail?.toLowerCase().includes(q) ||
          r.garmentType?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q),
      );
    }
    return items;
  }

  createRequirement(data: any) {
    const newReq = {
      id: `cr-${Date.now()}`,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || '',
      garmentType: data.garmentType,
      quantity: Number(data.quantity) || 20,
      printPlacements: data.printPlacements || ['Front Chest'],
      targetDate: data.targetDate || '',
      estimatedBudget: Number(data.estimatedBudget) || 0,
      status: 'new',
      description: data.description || '',
      attachmentName: data.attachmentName || null,
      attachmentUrl: data.attachmentUrl || null,
      internalNotes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.custom_requirements.unshift(newReq);
    return newReq;
  }

  updateRequirement(id: string, data: Partial<{ status: string; estimatedBudget: number; internalNotes: string }>) {
    const req = db.custom_requirements.find((r) => r.id === id);
    if (!req) {
      throw new NotFoundException({ code: 'REQUIREMENT_NOT_FOUND', message: 'Custom requirement not found.' });
    }
    if (data.status) req.status = data.status;
    if (data.estimatedBudget !== undefined) req.estimatedBudget = Number(data.estimatedBudget);
    if (data.internalNotes !== undefined) req.internalNotes = data.internalNotes;
    req.updated_at = new Date().toISOString();
    return req;
  }
}


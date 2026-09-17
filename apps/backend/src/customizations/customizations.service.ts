import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDb } from '../common/database/store';

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

  /** Studio Customizer Garments & Color Mockup Configuration */
  getStudioConfig() {
    if (!db.customizer_config) {
      db.customizer_config = {
        garments: [],
        updatedAt: new Date().toISOString(),
      };
    }
    return db.customizer_config;
  }

  updateStudioConfig(data: any) {
    db.customizer_config = {
      ...db.customizer_config,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveDb();
    return db.customizer_config;
  }

  addColorToGarment(
    garmentId: string,
    colorData: {
      id?: string;
      name: string;
      hex: string;
      textContrast?: string;
      frontImageUrl: string;
      backImageUrl?: string;
      isActive?: boolean;
    },
  ) {
    const config = this.getStudioConfig();
    const garment = config.garments.find((g: any) => g.id === garmentId);
    if (!garment) {
      throw new NotFoundException({ code: 'GARMENT_NOT_FOUND', message: `Garment ${garmentId} not found` });
    }

    const colorId =
      colorData.id ||
      colorData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
      `col-${Date.now()}`;

    const hex = colorData.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2) || '0', 16);
    const g = parseInt(hex.substring(2, 4) || '0', 16);
    const b = parseInt(hex.substring(4, 6) || '0', 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const computedContrast = brightness > 140 ? '#171717' : '#FFFFFF';

    const newColor = {
      id: colorId,
      name: colorData.name,
      hex: colorData.hex.startsWith('#') ? colorData.hex : `#${colorData.hex}`,
      textContrast: colorData.textContrast || computedContrast,
      frontImageUrl: colorData.frontImageUrl,
      backImageUrl: colorData.backImageUrl || '',
      isActive: colorData.isActive !== false,
    };

    const existingIndex = garment.colors.findIndex((c: any) => c.id === newColor.id);
    if (existingIndex >= 0) {
      garment.colors[existingIndex] = { ...garment.colors[existingIndex], ...newColor };
    } else {
      garment.colors.push(newColor);
    }

    config.updatedAt = new Date().toISOString();
    saveDb();
    return { garment, color: newColor };
  }

  updateGarmentColor(garmentId: string, colorId: string, colorData: any) {
    const config = this.getStudioConfig();
    const garment = config.garments.find((g: any) => g.id === garmentId);
    if (!garment) {
      throw new NotFoundException({ code: 'GARMENT_NOT_FOUND', message: `Garment ${garmentId} not found` });
    }

    const color = garment.colors.find((c: any) => c.id === colorId);
    if (!color) {
      throw new NotFoundException({ code: 'COLOR_NOT_FOUND', message: `Color ${colorId} not found` });
    }

    Object.assign(color, colorData);
    config.updatedAt = new Date().toISOString();
    saveDb();
    return { garment, color };
  }

  deleteGarmentColor(garmentId: string, colorId: string) {
    const config = this.getStudioConfig();
    const garment = config.garments.find((g: any) => g.id === garmentId);
    if (!garment) {
      throw new NotFoundException({ code: 'GARMENT_NOT_FOUND', message: `Garment ${garmentId} not found` });
    }

    garment.colors = garment.colors.filter((c: any) => c.id !== colorId);
    config.updatedAt = new Date().toISOString();
    saveDb();
    return { success: true, garment };
  }
}


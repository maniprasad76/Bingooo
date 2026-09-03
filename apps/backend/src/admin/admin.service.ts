import { Injectable } from '@nestjs/common';
import { db } from '../common/database/store';

@Injectable()
export class AdminService {
  getDashboardMetrics() {
    const totalOrders = db.orders.length;
    const totalRevenue = db.orders
      .filter((o) => o.payment_status === 'captured' || o.payment_status === 'paid' || o.status === 'processing' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = db.orders.filter((o) => o.status === 'pending_payment' || o.status === 'processing').length;
    const totalProducts = db.products.length;
    const totalCustomizations = db.customizations.length;
    const pendingCustomizations = db.customizations.filter((c) => c.status === 'uploaded' || c.status === 'needs_review').length;

    const lowStockVariants = db.product_variants
      .filter((v) => v.stock_quantity - v.reserved_quantity < 5)
      .map((v) => {
        const product = db.products.find((p) => p.id === v.product_id);
        return {
          id: v.id,
          sku: v.sku,
          productTitle: product?.title,
          size: v.size,
          color: v.color,
          availableStock: v.stock_quantity - v.reserved_quantity,
        };
      });

    const recentOrders = db.orders
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((o) => {
        const items = db.order_items.filter((i) => i.order_id === o.id);
        return {
          id: o.id,
          orderNumber: o.order_number,
          total: o.total,
          status: o.status,
          paymentStatus: o.payment_status,
          paymentMethod: o.payment_method,
          itemCount: items.length,
          createdAt: o.created_at,
        };
      });

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomizations,
      pendingCustomizations,
      lowStockVariants,
      recentOrders,
    };
  }
}

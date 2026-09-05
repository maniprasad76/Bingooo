import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../common/database/store';

export interface CreateReturnDto {
  orderId?: string;
  orderNumber: string;
  garmentTitle: string;
  size: string;
  reason: 'size_fit' | 'print_defect' | 'wrong_item' | 'fabric_feel';
  comments: string;
  refundAmount?: number;
}

@Injectable()
export class ReturnsService {
  /** Create customer return request */
  create(userId: string, dto: CreateReturnDto) {
    const order = db.orders.find(
      (o) => o.order_number === dto.orderNumber || o.id === dto.orderId,
    );

    const user = db.users.find((u) => u.id === userId);

    const newReturn = {
      id: `ret-${Date.now()}`,
      order_id: order ? order.id : (dto.orderId || uuidv4()),
      order_number: dto.orderNumber,
      user_id: userId,
      customer_name: user ? user.full_name : (order?.shipping_address?.name || 'Customer'),
      customer_phone: user ? user.phone : (order?.shipping_address?.phone || ''),
      garment_title: dto.garmentTitle,
      size: dto.size,
      reason: dto.reason,
      comments: dto.comments,
      refund_amount: dto.refundAmount || order?.total || 1299,
      status: 'requested',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.returns.unshift(newReturn);

    // Also push a notification for admin
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      category: 'order',
      severity: 'warning',
      title: `New Return Request (#${dto.orderNumber})`,
      description: `${newReturn.customer_name} requested return for ${dto.garmentTitle} (${dto.reason})`,
      link_href: '/returns',
      link_text: 'Review in Returns Queue →',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return newReturn;
  }

  /** Customer returns */
  findMyReturns(userId: string) {
    return db.returns.filter((r) => r.user_id === userId);
  }

  /** Admin returns list with filtering */
  findAll(query?: { status?: string; search?: string }) {
    let items = [...db.returns];

    if (query?.status && query.status !== 'all') {
      items = items.filter((r) => r.status === query.status);
    }

    if (query?.search) {
      const term = query.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.order_number.toLowerCase().includes(term) ||
          r.customer_name.toLowerCase().includes(term) ||
          r.garment_title.toLowerCase().includes(term),
      );
    }

    return items;
  }

  /** Admin update status */
  updateStatus(id: string, status: string, notes?: string) {
    const ret = db.returns.find((r) => r.id === id);
    if (!ret) {
      throw new NotFoundException({ code: 'RETURN_NOT_FOUND', message: 'Return request not found.' });
    }

    ret.status = status;
    if (notes) ret.admin_notes = notes;
    ret.updated_at = new Date().toISOString();

    // If status is refunded, update associated payment/order if found
    if (status === 'refunded') {
      const order = db.orders.find((o) => o.id === ret.order_id || o.order_number === ret.order_number);
      if (order) {
        order.status = 'refunded';
        order.payment_status = 'refunded';
      }
    }

    return ret;
  }
}

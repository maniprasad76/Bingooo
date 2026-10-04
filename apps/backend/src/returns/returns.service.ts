import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { db, saveDb } from '../common/database/store';
import { PaymentsService } from '../payments/payments.service';

export class CreateReturnDto {
  @IsOptional() @IsString() @MaxLength(100) orderId?: string;
  @IsString() @IsNotEmpty() @MaxLength(50) orderNumber!: string;
  @IsString() @MaxLength(200) garmentTitle!: string;
  @IsString() @MaxLength(20) size!: string;
  @IsIn(['size_fit', 'print_defect', 'wrong_item', 'fabric_feel'])
  reason!: 'size_fit' | 'print_defect' | 'wrong_item' | 'fabric_feel';
  @IsString() @MaxLength(2000) comments!: string;
  /** Accepted for client compatibility but ignored: refunds are derived from the order. */
  @IsOptional() @IsNumber() refundAmount?: number;
}

export class UpdateReturnStatusDto {
  @IsIn(['requested', 'approved', 'received', 'refunded', 'rejected'])
  status!: 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';

  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class RefundReturnDto {
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

@Injectable()
export class ReturnsService {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Create customer return request */
  create(userId: string, dto: CreateReturnDto) {
    // Returns can only be raised against the caller's own orders.
    const orderNumber = dto.orderNumber.trim().toUpperCase();
    const order = db.orders.find(
      (o) =>
        o.user_id === userId &&
        (o.order_number?.toUpperCase() === orderNumber || (!!dto.orderId && o.id === dto.orderId)),
    );
    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found on your account.' });
    }

    const user = db.users.find((u) => u.id === userId);

    const newReturn = {
      id: `ret-${uuidv4()}`,
      order_id: order.id,
      order_number: order.order_number,
      user_id: userId,
      customer_name: user ? user.full_name : (order?.shipping_address?.name || 'Customer'),
      customer_phone: user ? user.phone : (order?.shipping_address?.phone || ''),
      garment_title: dto.garmentTitle,
      size: dto.size,
      reason: dto.reason,
      comments: dto.comments,
      refund_amount: order.total,
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
      title: `New Return Request (#${order.order_number})`,
      description: `${newReturn.customer_name} requested return for ${dto.garmentTitle} (${dto.reason})`,
      link_href: '/returns',
      link_text: 'Review in Returns Queue →',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    saveDb();
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

  private findReturn(id: string) {
    const ret = db.returns.find((r) => r.id === id);
    if (!ret) {
      throw new NotFoundException({ code: 'RETURN_NOT_FOUND', message: 'Return request not found.' });
    }
    return ret;
  }

  /**
   * Admin workflow status (requested → approved → received / rejected).
   * "refunded" moves real money, so it has its own route guarded by
   * refunds.manage (see refund()).
   */
  updateStatus(id: string, dto: UpdateReturnStatusDto) {
    const ret = this.findReturn(id);
    if (dto.status === 'refunded') {
      throw new BadRequestException({
        code: 'USE_REFUND_ACTION',
        message: 'Refunds are issued with POST /returns/:id/refund (requires refund permission).',
      });
    }
    ret.status = dto.status;
    if (dto.notes) ret.admin_notes = dto.notes;
    ret.updated_at = new Date().toISOString();
    saveDb();
    return ret;
  }

  /**
   * Refund a return: issues the real Razorpay refund first; if Razorpay
   * rejects it nothing changes. Idempotent once refunded. Amounts not paid
   * online (cash) are recorded for a manual refund.
   */
  async refund(id: string, notes: string | undefined, actor: { email?: string; ip?: string }) {
    const ret = this.findReturn(id);
    if (ret.status === 'refunded') return ret;

    const order = db.orders.find((o) => o.id === ret.order_id || o.order_number === ret.order_number);
    if (!order) {
      throw new BadRequestException({ code: 'ORDER_NOT_FOUND', message: 'The order for this return no longer exists.' });
    }
    const payment = db.payments.find(
      (p) =>
        p.order_id === order.id &&
        p.provider === 'razorpay' &&
        ['captured', 'partially_refunded'].includes(p.status),
    );

    let onlineAmount = 0;
    if (payment) {
      const alreadyRefunded = db.refunds
        .filter((r) => r.payment_id === payment.id && r.status !== 'failed')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const refundable = Math.round((Number(payment.amount) - alreadyRefunded) * 100) / 100;
      onlineAmount = Math.min(Number(ret.refund_amount) || refundable, refundable);
      if (onlineAmount > 0) {
        const result = await this.paymentsService.issueRefund(
          payment.id,
          { amount: onlineAmount, reason: `Return ${ret.id}: ${ret.reason}` },
          actor,
        );
        ret.provider_refund_id = result.providerRefundId;
      }
    } else {
      order.payment_status = 'refunded';
      order.status = 'refunded';
      order.updated_at = new Date().toISOString();
    }
    ret.refunded_online = onlineAmount;
    ret.refund_manual = Math.max(0, Math.round((Number(ret.refund_amount) - onlineAmount) * 100) / 100);
    ret.status = 'refunded';
    if (notes) ret.admin_notes = notes;
    ret.updated_at = new Date().toISOString();

    saveDb();
    return ret;
  }
}

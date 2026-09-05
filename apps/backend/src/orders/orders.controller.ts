import { Controller, Get, Post, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService, CreateOrderDto } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create and place order' })
  createOrder(@Req() req: any, @Body() body: CreateOrderDto) {
    const activeUserId = req?.user?.id || body.userId || 'usr-cust-1';
    return this.ordersService.createOrder({ ...body, userId: activeUserId });
  }

  @Get()
  @ApiOperation({ summary: 'List orders for customer' })
  getOrders(@Req() req: any, @Query('userId') userId?: string) {
    const activeUserId = req?.user?.id || userId || 'usr-cust-1';
    return this.ordersService.findByUser(activeUserId);
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'List all orders for operations with filters' })
  getAdminOrders(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAllAdmin({ status, search });
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get order details by order number or ID' })
  getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumberOrId(orderNumber);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status and tracking details (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: string;
      paymentStatus?: string;
      trackingNumber?: string;
      carrier?: string;
    },
  ) {
    return this.ordersService.updateStatus(
      id,
      body.status,
      body.paymentStatus,
      body.trackingNumber,
      body.carrier,
    );
  }
}

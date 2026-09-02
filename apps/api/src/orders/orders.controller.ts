import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService, CreateOrderDto } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create and place order' })
  createOrder(@Body() body: CreateOrderDto) {
    return this.ordersService.createOrder(body);
  }

  @Get()
  @ApiOperation({ summary: 'List orders for user or admin' })
  getOrders(@Query('userId') userId?: string, @Query('admin') admin?: boolean) {
    if (admin) return this.ordersService.findAllAdmin();
    return this.ordersService.findByUser(userId || 'mock-user-id');
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get order details by order number' })
  getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; paymentStatus?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.paymentStatus);
  }
}

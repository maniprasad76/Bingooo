import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService, CreateOrderDto } from './orders.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

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
  getOrders(@Query('userId') userId?: string) {
    return this.ordersService.findByUser(userId || 'mock-user-id');
  }

  @Get('admin/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('orders.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders for operations' })
  getAdminOrders() {
    return this.ordersService.findAllAdmin();
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get order details by order number' })
  getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('orders.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; paymentStatus?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.paymentStatus);
  }
}

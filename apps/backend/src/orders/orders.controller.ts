import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create and place order for authenticated user' })
  createOrder(@Req() req: any, @Body() body: CreateOrderDto) {
    // Strictly isolate to authenticated caller's identity
    const activeUserId = req.user.id;
    return this.ordersService.createOrder({ ...body, userId: activeUserId });
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List orders strictly for the authenticated customer' })
  getOrders(@Req() req: any) {
    // Prevent IDOR - always scope to caller's verified subject ID
    return this.ordersService.findByUser(req.user.id);
  }

  @Get('admin/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('orders.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders for operations with filters (Admin/Staff only)' })
  getAdminOrders(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAllAdmin({ status, search });
  }

  @Get(':orderNumber')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details with strict ownership verification' })
  getOrderByNumber(@Req() req: any, @Param('orderNumber') orderNumber: string) {
    const order = this.ordersService.findByOrderNumberOrId(orderNumber);
    const callerId = req.user.id;
    const isPrivileged =
      req.user.roles?.includes('SUPER_ADMIN') ||
      req.user.roles?.includes('ADMIN') ||
      req.user.permissions?.includes('*') ||
      req.user.permissions?.includes('orders.manage');

    // BOLA/IDOR check: verify order belongs to authenticated caller
    if (order.user_id !== callerId && !isPrivileged) {
      throw new ForbiddenException({
        code: 'ORDER_ACCESS_DENIED',
        message: 'You do not have permission to view this order.',
      });
    }

    return order;
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('orders.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status and tracking details (Admin/Staff only)' })
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


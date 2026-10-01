import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  PaymentsService,
  CreateOrderDto,
  RazorpayOrderDto,
  RefundDto,
  VerifyPaymentDto,
} from './payments.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get public payment rules and COD configurations' })
  getPaymentConfig() {
    return this.paymentsService.getPaymentConfig();
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('payments.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all payments ledger entries' })
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.paymentsService.findAll({ status, search });
  }

  @Post(':id/refund')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('refunds.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue a real Razorpay refund for a captured payment (Finance staff only)' })
  refund(@Param('id') id: string, @Body() body: RefundDto, @Req() req: any) {
    return this.paymentsService.issueRefund(id, body, { email: req.user.email, ip: req.ip });
  }

  @Post('create-order')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Create Razorpay order for an order you own (Step 1)' })
  createOrder(@Body() body: CreateOrderDto, @Req() req: any) {
    return this.paymentsService.createRazorpayOrder(body, req.user.id);
  }

  @Post('verify-payment')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify Razorpay payment signature (Step 3)' })
  verifyPaymentSignature(@Body() body: VerifyPaymentDto, @Req() req: any) {
    return this.paymentsService.verifyPayment(body, req.user.id);
  }

  @Post('razorpay/order')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Create Razorpay order for checkout' })
  createRazorpayOrder(@Body() body: RazorpayOrderDto, @Req() req: any) {
    return this.paymentsService.createRazorpayOrder(body, req.user.id);
  }

  @Post('razorpay/verify')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  verifyPayment(@Body() body: VerifyPaymentDto, @Req() req: any) {
    return this.paymentsService.verifyPayment(body, req.user.id);
  }

  @Post('razorpay/webhook')
  @ApiOperation({ summary: 'Razorpay webhook receiver' })
  @ApiHeader({ name: 'x-razorpay-signature', required: false })
  @ApiHeader({ name: 'x-razorpay-event-id', required: false })
  handleWebhook(
    @Body() event: any,
    @Headers('x-razorpay-signature') signature?: string,
    @Headers('x-razorpay-event-id') eventId?: string,
    @Req() req?: any,
  ) {
    return this.paymentsService.handleWebhook(event, signature, req?.rawBody, eventId);
  }
}


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
  @Permissions('payments.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all payments ledger entries' })
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.paymentsService.findAll({ status, search });
  }

  @Post(':id/refund')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('payments.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process refund for payment transaction (Staff/Admin only)' })
  refund(@Param('id') id: string, @Body() body: { amount?: number; reason?: string }) {
    return this.paymentsService.refund(id, body);
  }

  @Post('create-order')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Create Razorpay order (Step 1)' })
  createOrder(@Body() body: CreateOrderDto) {
    return this.paymentsService.createRazorpayOrder(body);
  }

  @Post('verify-payment')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify Razorpay payment signature (Step 3)' })
  verifyPaymentSignature(@Body() body: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(body);
  }

  @Post('razorpay/order')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Create Razorpay order for checkout' })
  createRazorpayOrder(@Body() body: RazorpayOrderDto) {
    return this.paymentsService.createRazorpayOrder(body);
  }

  @Post('razorpay/verify')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  verifyPayment(@Body() body: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(body);
  }

  @Post('razorpay/webhook')
  @ApiOperation({ summary: 'Razorpay webhook receiver' })
  @ApiHeader({ name: 'x-razorpay-signature', required: false })
  handleWebhook(
    @Body() event: any,
    @Headers('x-razorpay-signature') signature?: string,
    @Req() req?: any,
  ) {
    return this.paymentsService.handleWebhook(event, signature, req?.rawBody);
  }
}


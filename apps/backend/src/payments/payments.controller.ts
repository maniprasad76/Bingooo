import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { PaymentsService, CreateOrderDto, RazorpayOrderDto, VerifyPaymentDto } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin list all payments ledger entries' })
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.paymentsService.findAll({ status, search });
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Process refund for payment transaction' })
  refund(@Param('id') id: string, @Body() body: { amount?: number; reason?: string }) {
    return this.paymentsService.refund(id, body);
  }

  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay order (Step 1)' })
  createOrder(@Body() body: CreateOrderDto) {
    return this.paymentsService.createRazorpayOrder(body);
  }

  @Post('verify-payment')
  @ApiOperation({ summary: 'Verify Razorpay payment signature (Step 3)' })
  verifyPaymentSignature(@Body() body: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(body);
  }

  @Post('razorpay/order')
  @ApiOperation({ summary: 'Create Razorpay order for checkout' })
  createRazorpayOrder(@Body() body: RazorpayOrderDto) {
    return this.paymentsService.createRazorpayOrder(body);
  }

  @Post('razorpay/verify')
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  verifyPayment(@Body() body: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(body);
  }

  @Post('razorpay/webhook')
  @ApiOperation({ summary: 'Razorpay webhook receiver' })
  @ApiHeader({ name: 'x-razorpay-signature', required: false })
  handleWebhook(@Body() event: any, @Headers('x-razorpay-signature') signature?: string) {
    return this.paymentsService.handleWebhook(event, signature);
  }
}

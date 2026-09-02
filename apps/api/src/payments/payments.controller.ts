import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { PaymentsService, RazorpayOrderDto, VerifyPaymentDto } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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

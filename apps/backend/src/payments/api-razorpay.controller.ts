import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService, CreateOrderDto, VerifyPaymentDto } from './payments.service';

@ApiTags('Razorpay Standard Checkout API')
@Controller('api')
export class ApiRazorpayController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay order directly (paise, currency, receipt)' })
  createOrder(@Body() body: CreateOrderDto) {
    return this.paymentsService.createRazorpayOrder(body);
  }

  @Post('verify-payment')
  @ApiOperation({ summary: 'Verify Razorpay payment signature directly' })
  verifyPayment(@Body() body: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(body);
  }
}

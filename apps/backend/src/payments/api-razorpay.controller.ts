import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService, CreateOrderDto, VerifyPaymentDto } from './payments.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Razorpay Standard Checkout API')
@Controller('api')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ApiRazorpayController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Create Razorpay order for an order you own' })
  createOrder(@Body() body: CreateOrderDto, @Req() req: any) {
    return this.paymentsService.createRazorpayOrder(body, req.user.id);
  }

  @Post('verify-payment')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify Razorpay payment signature directly' })
  verifyPayment(@Body() body: VerifyPaymentDto, @Req() req: any) {
    return this.paymentsService.verifyPayment(body, req.user.id);
  }
}

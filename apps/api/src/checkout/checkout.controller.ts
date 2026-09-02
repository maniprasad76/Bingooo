import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutService, CheckoutValidationDto } from './checkout.service';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate checkout cart, address, and calculate pricing breakdown' })
  validate(@Body() body: CheckoutValidationDto) {
    return this.checkoutService.validateAndCalculate(body);
  }
}

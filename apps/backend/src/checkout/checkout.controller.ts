import { Controller, Post, Body, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutValidationDto } from './dto/checkout.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('validate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate checkout cart, address, and calculate pricing breakdown' })
  validate(
    @Body() body: CheckoutValidationDto,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.checkoutService.validateAndCalculate(body, { userId: req.user.id, sessionId });
  }
}

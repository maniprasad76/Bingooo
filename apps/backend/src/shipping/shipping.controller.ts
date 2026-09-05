import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('methods')
  @ApiOperation({ summary: 'Get available shipping methods & delivery timeframes' })
  getMethods() {
    return this.shippingService.getMethods();
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate shipping cost based on cart subtotal' })
  calculate(@Body() body: { subtotal: number; methodId?: string }) {
    return this.shippingService.calculate(body.subtotal, body.methodId);
  }

  @Get('track/:awb')
  @ApiOperation({ summary: 'Track parcel by AWB or order number' })
  track(@Param('awb') awb: string) {
    return this.shippingService.track(awb);
  }
}

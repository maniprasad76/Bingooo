import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('track/:awb')
  @ApiOperation({ summary: 'Track parcel by AWB or order number' })
  track(@Param('awb') awb: string) {
    return this.shippingService.track(awb);
  }
}

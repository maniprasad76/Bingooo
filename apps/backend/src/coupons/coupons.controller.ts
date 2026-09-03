import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate coupon and calculate discount' })
  validate(@Body() body: { code: string; orderSubtotal: number }) {
    return this.couponsService.validateCoupon(body.code, body.orderSubtotal);
  }

  @Get()
  @ApiOperation({ summary: 'List all coupons (admin)' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create new coupon (admin)' })
  create(@Body() body: any) {
    return this.couponsService.create(body);
  }
}

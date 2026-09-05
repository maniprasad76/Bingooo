import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
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

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle coupon active status (admin)' })
  toggle(@Param('id') id: string) {
    return this.couponsService.toggleActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete coupon (admin)' })
  delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}

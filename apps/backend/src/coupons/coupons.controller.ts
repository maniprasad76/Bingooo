import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CouponsService } from './coupons.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // Public: checkout needs to validate a coupon a customer typed in.
  @Post('validate')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Validate coupon and calculate discount (Rate limited: 10 req/min)' })
  validate(@Body() body: { code: string; orderSubtotal: number }) {
    return this.couponsService.validateCoupon(body.code, body.orderSubtotal);
  }

  // Everything below manages real discounts/revenue — admin only. Previously
  // unauthenticated: anyone could create a 100%-off coupon and use it at
  // checkout, or disable/delete legitimate ones.
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('coupons.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all coupons (admin)' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('coupons.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new coupon (admin)' })
  create(@Body() body: any) {
    return this.couponsService.create(body);
  }

  @Patch(':id/toggle')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('coupons.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle coupon active status (admin)' })
  toggle(@Param('id') id: string) {
    return this.couponsService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('coupons.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete coupon (admin)' })
  delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }
}

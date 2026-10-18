import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  Headers,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { ShiprocketService } from './shiprocket.service';
import { generateThermalShippingLabelHtml } from './shipping-label.util';
import { db } from '../common/database/store';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
    private readonly shiprocketService: ShiprocketService,
  ) {}

  @Get('track/:awb')
  @ApiOperation({ summary: 'Track parcel by AWB or order number' })
  track(@Param('awb') awb: string) {
    return this.shippingService.track(awb);
  }

  @Get('shiprocket/serviceability')
  @ApiOperation({ summary: 'Check Shiprocket courier serviceability and rates for a pincode' })
  checkServiceability(
    @Query('pincode') pincode: string,
    @Query('weight') weight?: string,
  ) {
    const weightKg = weight ? parseFloat(weight) : 0.5;
    return this.shiprocketService.checkServiceability(pincode || '560001', isNaN(weightKg) ? 0.5 : weightKg);
  }

  @Post('shiprocket/create-shipment/:orderId')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('orders.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Shiprocket shipment order (Admin only)' })
  createShipment(@Param('orderId') orderId: string) {
    return this.shiprocketService.createShipment(orderId);
  }

  @Post('shiprocket/generate-awb/:orderId')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('orders.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate AWB code & dispatch via Shiprocket courier partner (Admin only)' })
  generateAwb(
    @Param('orderId') orderId: string,
    @Body() body?: { courierId?: number },
  ) {
    return this.shiprocketService.generateAWB(orderId, body?.courierId);
  }

  @Get('shiprocket/track/:awb')
  @ApiOperation({ summary: 'Live Shiprocket parcel tracking by AWB number' })
  trackShiprocket(@Param('awb') awb: string) {
    return this.shiprocketService.trackShipment(awb);
  }

  @Post('shiprocket/webhook')
  @ApiOperation({ summary: 'Shiprocket tracking status & delivery webhook' })
  handleWebhook(@Headers('x-api-key') apiKey: string | undefined, @Body() body: any) {
    // Shiprocket sends the token set in its webhook settings as x-api-key; without
    // it anyone could mark orders delivered and message customers.
    const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN || '';
    const given = Buffer.from(apiKey || '');
    if (!expected || given.length !== Buffer.byteLength(expected) || !timingSafeEqual(given, Buffer.from(expected))) {
      throw new UnauthorizedException({ code: 'INVALID_WEBHOOK_TOKEN', message: 'Invalid webhook token.' });
    }
    return this.shiprocketService.handleWebhook(body);
  }

  @Get('label/:orderId')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('orders.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Render 4x6 Thermal Shipping Label HTML for direct thermal printing (Admin/Staff only)' })
  renderShippingLabel(@Param('orderId') orderId: string, @Res() res: Response) {
    const order = db.orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`);
    }

    const html = generateThermalShippingLabelHtml(order, db.order_items.filter((i) => i.order_id === order.id));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}

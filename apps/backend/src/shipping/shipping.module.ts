import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { ShiprocketService } from './shiprocket.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [NotificationsModule, OrdersModule],
  controllers: [ShippingController],
  providers: [ShippingService, ShiprocketService],
  exports: [ShippingService, ShiprocketService],
})
export class ShippingModule {}

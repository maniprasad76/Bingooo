import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CheckoutModule } from '../checkout/checkout.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CheckoutModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

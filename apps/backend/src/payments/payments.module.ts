import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { ApiRazorpayController } from './api-razorpay.controller';
import { PaymentsService } from './payments.service';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [OrdersModule, NotificationsModule],
  controllers: [PaymentsController, ApiRazorpayController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

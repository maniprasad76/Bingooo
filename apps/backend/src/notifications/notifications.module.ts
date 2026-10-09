import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { WhatsAppService } from './whatsapp.service';
import { ReviewRequestService } from './review-request.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, WhatsAppService, ReviewRequestService],
  exports: [NotificationsService, WhatsAppService],
})
export class NotificationsModule {}

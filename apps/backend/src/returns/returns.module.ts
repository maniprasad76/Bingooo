import { Module } from '@nestjs/common';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}

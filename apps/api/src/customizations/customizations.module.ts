import { Module } from '@nestjs/common';
import { CustomizationsController } from './customizations.controller';
import { CustomizationsService } from './customizations.service';

@Module({
  controllers: [CustomizationsController],
  providers: [CustomizationsService],
  exports: [CustomizationsService],
})
export class CustomizationsModule {}

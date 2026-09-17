import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { BackupController } from './backup.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController, BackupController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

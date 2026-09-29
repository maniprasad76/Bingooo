import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Global() // Make EmailService injectable across all modules without repeated imports
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

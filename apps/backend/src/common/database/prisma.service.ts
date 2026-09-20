import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes('[YOUR-PASSWORD]')) {
      try {
        await this.$connect();
        this.logger.log('Connected to Supabase Postgres database via Prisma');
      } catch (err: any) {
        this.logger.warn(`Could not connect to database on startup: ${err.message}`);
      }
    } else {
      this.logger.log('PrismaService initialized (Awaiting DATABASE_URL with configured password)');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

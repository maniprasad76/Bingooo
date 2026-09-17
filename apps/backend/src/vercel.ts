import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';

let cachedServer: Express | null = null;

export async function bootstrapServer(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const server = express();

  // Payload & Body Limits with rawBody capture for webhook signature verification
  server.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  server.use(express.urlencoded({ limit: '10mb', extended: true }));
  server.use(cookieParser());
  server.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn'],
  });

  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://bingooo-frontend.vercel.app',
    'https://bingooo-admin-three.vercel.app',
  ];
  app.enableCors({
    origin: corsOrigins.length === 1 && corsOrigins[0] === '*' ? true : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Idempotency-Key',
      'x-session-id',
      'X-Session-Id',
      'x-razorpay-signature',
      'Accept',
    ],
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['', '/', 'health', 'health/live', 'health/ready', 'api/create-order', 'api/verify-payment'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new LoggingInterceptor(),
    new CacheInterceptor(reflector),
    new ResponseInterceptor(),
    new IdempotencyInterceptor(),
  );

  await app.init();
  cachedServer = server;
  return cachedServer;
}

export default async function handler(req: Request, res: Response) {
  const server = await bootstrapServer();
  return server(req, res);
}

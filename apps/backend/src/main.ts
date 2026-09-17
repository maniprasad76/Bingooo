import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Payload & Body Limits (with rawBody capture for webhook signature verification) ──
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // ── Response Compression (gzip/deflate for responses > 1KB) ──
  app.use(compression({ threshold: 1024 }));

  // ── Server Timeout Protection (30 seconds) ──
  app.use((req: any, res: any, next: any) => {
    req.setTimeout(30000, () => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'Server request timed out after 30 seconds.',
          },
          requestId: req.requestId || 'timeout',
        });
      }
    });
    next();
  });

  // ── Security ──
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());

  // ── CORS ──
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || [
    'http://localhost:5173',
    'http://localhost:5174',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Idempotency-Key',
      'x-session-id',
      'X-Session-Id',
      'Accept',
    ],
  });

  // ── Global prefix ──
  app.setGlobalPrefix('api/v1', {
    exclude: ['api/create-order', 'api/verify-payment'],
  });

  // ── Global pipes ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global filters & interceptors ──
  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new LoggingInterceptor(),
    new CacheInterceptor(reflector),
    new ResponseInterceptor(),
    new IdempotencyInterceptor(),
  );

  // ── Swagger / OpenAPI ──
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bingooo API')
    .setDescription('Bingooo fashion e-commerce REST API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // ── Graceful Shutdown for Cloud Run / Container Lifecycle ──
  app.enableShutdownHooks();

  // ── Start ──
  const port = Number(process.env.PORT) || 8080;
  const host = '0.0.0.0';
  await app.listen(port, host);
  console.log(`🚀 Bingooo API running on http://${host}:${port}`);
  console.log(`📖 Swagger docs at http://${host}:${port}/api/docs`);
}

bootstrap();


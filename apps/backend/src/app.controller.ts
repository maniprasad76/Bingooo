import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Root & Service Information' })
  getRoot() {
    return {
      name: 'Bingooo Fashion API',
      status: 'operational',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      documentation: '/api/docs',
      endpoints: {
        health: '/health',
        liveness: '/health/live',
        readiness: '/health/ready',
        products: '/api/v1/products',
        categories: '/api/v1/categories',
        collections: '/api/v1/collections',
        cart: '/api/v1/cart',
        orders: '/api/v1/orders',
        checkout: '/api/v1/checkout',
        payments: '/api/v1/payments',
        razorpayWebhook: '/api/v1/payments/razorpay/webhook',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

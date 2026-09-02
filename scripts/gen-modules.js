/**
 * Module shell generator - run once to create NestJS module scaffolding
 * node scripts/gen-modules.js
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'apps', 'api', 'src');

const modules = [
  { name: 'auth', tag: 'Auth', routes: ['POST /login', 'POST /signup', 'POST /logout', 'GET /me'] },
  { name: 'users', tag: 'Users', routes: ['GET /profile', 'PATCH /profile'] },
  { name: 'roles', tag: 'Roles', routes: ['GET /roles'] },
  { name: 'products', tag: 'Products', routes: ['GET /', 'GET /:slug'] },
  { name: 'categories', tag: 'Categories', routes: ['GET /'] },
  { name: 'collections', tag: 'Collections', routes: ['GET /'] },
  { name: 'inventory', tag: 'Inventory', routes: [] },
  { name: 'cart', tag: 'Cart', routes: ['POST /', 'GET /', 'POST /items', 'PATCH /items/:id', 'DELETE /items/:id'] },
  { name: 'wishlist', tag: 'Wishlist', routes: ['GET /', 'POST /', 'DELETE /:id'] },
  { name: 'customizations', tag: 'Customizations', routes: ['POST /', 'GET /:id', 'POST /:id/complete'] },
  { name: 'media', tag: 'Media', routes: ['POST /presign'] },
  { name: 'checkout', tag: 'Checkout', routes: ['POST /validate'] },
  { name: 'payments', tag: 'Payments', routes: ['POST /razorpay/order', 'POST /razorpay/verify', 'POST /razorpay/webhook'] },
  { name: 'orders', tag: 'Orders', routes: ['GET /', 'GET /:orderNumber', 'POST /'] },
  { name: 'shipping', tag: 'Shipping', routes: [] },
  { name: 'coupons', tag: 'Coupons', routes: ['POST /validate'] },
  { name: 'reviews', tag: 'Reviews', routes: ['GET /', 'POST /'] },
  { name: 'notifications', tag: 'Notifications', routes: [] },
  { name: 'admin', tag: 'Admin', routes: ['GET /dashboard'] },
  { name: 'audit', tag: 'Audit', routes: ['GET /logs'] },
];

function pascal(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

for (const mod of modules) {
  const dir = path.join(BASE, mod.name);
  const Name = pascal(mod.name);

  // Service
  const service = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${Name}Service {
  // TODO: Implement ${mod.name} business logic
}
`;

  // Controller
  const controller = `import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${Name}Service } from './${mod.name}.service';

@ApiTags('${mod.tag}')
@Controller('${mod.name}')
export class ${Name}Controller {
  constructor(private readonly ${mod.name}Service: ${Name}Service) {}

  // TODO: Implement endpoints: ${mod.routes.join(', ') || 'none yet'}
}
`;

  // Module
  const module = `import { Module } from '@nestjs/common';
import { ${Name}Controller } from './${mod.name}.controller';
import { ${Name}Service } from './${mod.name}.service';

@Module({
  controllers: [${Name}Controller],
  providers: [${Name}Service],
  exports: [${Name}Service],
})
export class ${Name}Module {}
`;

  fs.writeFileSync(path.join(dir, `${mod.name}.service.ts`), service);
  fs.writeFileSync(path.join(dir, `${mod.name}.controller.ts`), controller);
  fs.writeFileSync(path.join(dir, `${mod.name}.module.ts`), module);
  console.log(`✓ ${mod.name}`);
}

console.log('\nAll module shells generated.');

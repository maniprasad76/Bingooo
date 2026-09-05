import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CollectionsModule } from './collections/collections.module';
import { InventoryModule } from './inventory/inventory.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CustomizationsModule } from './customizations/customizations.module';
import { MediaModule } from './media/media.module';
import { CheckoutModule } from './checkout/checkout.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { ShippingModule } from './shipping/shipping.module';
import { CouponsModule } from './coupons/coupons.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReturnsModule } from './returns/returns.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    // ── Config ──
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // ── Core ──
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,

    // ── Catalog ──
    ProductsModule,
    CategoriesModule,
    CollectionsModule,
    InventoryModule,

    // ── Commerce ──
    CartModule,
    WishlistModule,
    CheckoutModule,
    PaymentsModule,
    OrdersModule,
    ShippingModule,
    CouponsModule,
    ReturnsModule,

    // ── Customization ──
    CustomizationsModule,
    MediaModule,

    // ── Engagement ──
    ReviewsModule,
    NotificationsModule,

    // ── Admin ──
    AdminModule,
    AuditModule,
    BannersModule,
  ],
})
export class AppModule {}

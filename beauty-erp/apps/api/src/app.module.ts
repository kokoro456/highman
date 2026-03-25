import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ShopModule } from './shop/shop.module';
import { ServiceModule } from './service/service.module';
import { BookingModule } from './booking/booking.module';
import { CustomerModule } from './customer/customer.module';
import { PaymentModule } from './payment/payment.module';
import { StaffModule } from './staff/staff.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PhotoModule } from './photo/photo.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationModule } from './notification/notification.module';
import { ExportModule } from './export/export.module';
import { CouponModule } from './coupon/coupon.module';
import { PgModule } from './pg/pg.module';
import { AlimtalkModule } from './alimtalk/alimtalk.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { AdminModule } from './admin/admin.module';
import { MembershipModule } from './membership/membership.module';
import { MessageModule } from './message/message.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ShopModule,
    ServiceModule,
    BookingModule,
    CustomerModule,
    PaymentModule,
    StaffModule,
    DashboardModule,
    PhotoModule,
    InventoryModule,
    NotificationModule,
    ExportModule,
    CouponModule,
    PgModule,
    AlimtalkModule,
    SchedulerModule,
    AdminModule,
    MembershipModule,
    MessageModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}

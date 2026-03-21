import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ShopModule } from './shop/shop.module';
import { ServiceModule } from './service/service.module';
import { BookingModule } from './booking/booking.module';
import { CustomerModule } from './customer/customer.module';
import { PaymentModule } from './payment/payment.module';
import { StaffModule } from './staff/staff.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ShopModule,
    ServiceModule,
    BookingModule,
    CustomerModule,
    PaymentModule,
    StaffModule,
    DashboardModule,
  ],
})
export class AppModule {}

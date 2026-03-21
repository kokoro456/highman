import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private prisma: PrismaService) {}

  /** Run every day at 9 AM KST - send reminders for tomorrow's bookings */
  @Cron('0 9 * * *', { timeZone: 'Asia/Seoul' })
  async sendBookingReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        startTime: { gte: tomorrow, lt: dayAfter },
        status: { in: ['CONFIRMED', 'READY'] },
      },
      include: { customer: true, service: true, staff: true, shop: true },
    });

    this.logger.log(`Found ${bookings.length} bookings for tomorrow`);

    for (const booking of bookings) {
      await this.prisma.inAppNotification.create({
        data: {
          shopId: booking.shopId,
          type: 'BOOKING_REMIND',
          title: '내일 예약 알림',
          message: `${booking.customer.name}님 ${booking.service.name} 예약 (${new Date(booking.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`,
          metadata: { bookingId: booking.id },
        },
      });

      this.logger.log(`Reminder created for booking ${booking.id}`);
    }
  }

  /** Run every hour - check for no-shows (bookings past end time still CONFIRMED) */
  @Cron('0 * * * *')
  async checkNoShows() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const noShows = await this.prisma.booking.findMany({
      where: {
        endTime: { lt: oneHourAgo },
        status: 'CONFIRMED',
      },
      include: { customer: true, service: true, shop: true },
    });

    for (const booking of noShows) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'NO_SHOW' },
      });

      await this.prisma.inAppNotification.create({
        data: {
          shopId: booking.shopId,
          type: 'NO_SHOW',
          title: '노쇼 감지',
          message: `${booking.customer.name}님이 ${booking.service.name} 예약에 나타나지 않았습니다`,
          metadata: { bookingId: booking.id },
        },
      });
    }

    if (noShows.length > 0) {
      this.logger.log(`Marked ${noShows.length} bookings as NO_SHOW`);
    }
  }

  /** Run every 6 hours - check low stock inventory */
  @Cron('0 */6 * * *')
  async checkLowStock() {
    const items = await this.prisma.inventoryItem.findMany({
      where: { isActive: true },
      include: { shop: true },
    });

    const lowItems = items.filter((item) => item.quantity <= item.minQuantity);

    for (const item of lowItems) {
      // Check if we already sent a notification in the last 24 hours
      const recentNotif = await this.prisma.inAppNotification.findFirst({
        where: {
          shopId: item.shopId,
          type: 'LOW_STOCK',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          metadata: { path: ['itemId'], equals: item.id },
        },
      });

      if (!recentNotif) {
        await this.prisma.inAppNotification.create({
          data: {
            shopId: item.shopId,
            type: 'LOW_STOCK',
            title: '재고 부족 알림',
            message: `${item.name}의 재고가 ${item.quantity}${item.unit}으로 최소 수량(${item.minQuantity}${item.unit}) 이하입니다`,
            metadata: { itemId: item.id },
          },
        });
      }
    }

    if (lowItems.length > 0) {
      this.logger.log(`Found ${lowItems.length} low stock items`);
    }
  }
}

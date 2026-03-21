import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(shopId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      todayPayments,
      todayBookings,
      todayNewCustomers,
      todayNoShows,
      weekPayments,
      totalCustomers,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { shopId, paidAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' },
        _sum: { finalAmount: true }, _count: true,
      }),
      this.prisma.booking.count({
        where: { shopId, startTime: { gte: today, lt: tomorrow } },
      }),
      this.prisma.customer.count({
        where: { shopId, firstVisitDate: { gte: today, lt: tomorrow } },
      }),
      this.prisma.booking.count({
        where: { shopId, startTime: { gte: today, lt: tomorrow }, status: 'NO_SHOW' },
      }),
      this.prisma.payment.aggregate({
        where: { shopId, paidAt: { gte: weekAgo, lt: tomorrow }, status: 'COMPLETED' },
        _sum: { finalAmount: true },
      }),
      this.prisma.customer.count({ where: { shopId } }),
    ]);

    return {
      todayRevenue: Number(todayPayments._sum.finalAmount) || 0,
      todayTransactions: todayPayments._count,
      todayBookings,
      todayNewCustomers,
      todayNoShows,
      weekRevenue: Number(weekPayments._sum.finalAmount) || 0,
      totalCustomers,
    };
  }

  async getRevenueChart(shopId: string, days: number = 7) {
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const payments = await this.prisma.payment.aggregate({
        where: { shopId, paidAt: { gte: date, lt: nextDate }, status: 'COMPLETED' },
        _sum: { finalAmount: true }, _count: true,
      });

      results.push({
        date: date.toISOString().split('T')[0],
        revenue: Number(payments._sum.finalAmount) || 0,
        transactions: payments._count,
      });
    }
    return results;
  }

  async getUpcomingBookings(shopId: string, limit: number = 10) {
    return this.prisma.booking.findMany({
      where: {
        shopId,
        startTime: { gte: new Date() },
        status: { in: ['READY', 'CONFIRMED'] },
      },
      include: { customer: true, staff: true, service: true },
      orderBy: { startTime: 'asc' },
      take: limit,
    });
  }

  async getStaffPerformance(shopId: string, startDate: string, endDate: string) {
    const staff = await this.prisma.staff.findMany({
      where: { shopId, isActive: true },
    });

    const results = await Promise.all(
      staff.map(async (s) => {
        const [bookings, revenue] = await Promise.all([
          this.prisma.booking.count({
            where: { shopId, staffId: s.id, startTime: { gte: new Date(startDate), lte: new Date(endDate) } },
          }),
          this.prisma.payment.aggregate({
            where: { shopId, staffId: s.id, paidAt: { gte: new Date(startDate), lte: new Date(endDate) }, status: 'COMPLETED' },
            _sum: { finalAmount: true },
          }),
        ]);

        return {
          staffId: s.id, staffName: s.name, color: s.color,
          bookingCount: bookings,
          revenue: Number(revenue._sum.finalAmount) || 0,
        };
      }),
    );

    return results;
  }
}

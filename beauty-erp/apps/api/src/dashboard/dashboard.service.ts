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

  // ==================== REPORTS ====================

  async getRevenueReport(shopId: string, period: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = endDate.getDate();

    // Get all services for color assignment
    const services = await this.prisma.service.findMany({
      where: { shopId, isActive: true },
      select: { id: true, name: true },
    });

    const results = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month - 1, day);
      const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

      const [paymentAgg, bookingCount, dayPayments] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            shopId,
            paidAt: { gte: dayStart, lte: dayEnd },
            status: 'COMPLETED',
          },
          _sum: { finalAmount: true },
        }),
        this.prisma.booking.count({
          where: {
            shopId,
            startTime: { gte: dayStart, lte: dayEnd },
            status: { in: ['COMPLETED', 'CONFIRMED', 'READY', 'IN_PROGRESS'] },
          },
        }),
        this.prisma.payment.findMany({
          where: {
            shopId,
            paidAt: { gte: dayStart, lte: dayEnd },
            status: 'COMPLETED',
          },
          include: { booking: { include: { service: true } } },
        }),
      ]);

      // Group revenue by service
      const serviceBreakdown: Record<string, { name: string; amount: number }> = {};
      for (const p of dayPayments) {
        const svcName = p.booking?.service?.name || '직접 결제';
        const svcId = p.booking?.serviceId || 'direct';
        if (!serviceBreakdown[svcId]) {
          serviceBreakdown[svcId] = { name: svcName, amount: 0 };
        }
        serviceBreakdown[svcId].amount += Number(p.finalAmount);
      }

      results.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: Number(paymentAgg._sum.finalAmount) || 0,
        bookingCount,
        serviceBreakdown: Object.entries(serviceBreakdown).map(([id, v]) => ({
          serviceId: id,
          serviceName: v.name,
          amount: v.amount,
        })),
      });
    }

    // Collect all unique service names across the month
    const allServiceNames = new Set<string>();
    for (const r of results) {
      for (const s of r.serviceBreakdown) {
        allServiceNames.add(s.serviceName);
      }
    }

    return { days: results, serviceNames: Array.from(allServiceNames) };
  }

  async getServiceReport(shopId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        shopId,
        startTime: { gte: start, lte: end },
        status: { in: ['COMPLETED', 'CONFIRMED', 'READY', 'IN_PROGRESS'] },
      },
      include: {
        service: { include: { category: true } },
        payments: { where: { status: 'COMPLETED' } },
      },
    });

    const serviceMap = new Map<string, {
      serviceId: string;
      serviceName: string;
      categoryName: string;
      bookingCount: number;
      revenue: number;
    }>();

    for (const booking of bookings) {
      const existing = serviceMap.get(booking.serviceId);
      const bookingRevenue = booking.payments.reduce(
        (sum, p) => sum + Number(p.finalAmount),
        0,
      );

      if (existing) {
        existing.bookingCount += 1;
        existing.revenue += bookingRevenue;
      } else {
        serviceMap.set(booking.serviceId, {
          serviceId: booking.serviceId,
          serviceName: booking.service.name,
          categoryName: booking.service.category.name,
          bookingCount: 1,
          revenue: bookingRevenue,
        });
      }
    }

    const services = Array.from(serviceMap.values()).sort(
      (a, b) => b.bookingCount - a.bookingCount,
    );

    const totalBookings = services.reduce((sum, s) => sum + s.bookingCount, 0);
    return services.map((s) => ({
      ...s,
      percentage: totalBookings > 0
        ? Math.round((s.bookingCount / totalBookings) * 100)
        : 0,
    }));
  }

  async getCustomerReport(shopId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [newCustomers, totalCustomersInPeriod, payments, topCustomersRaw] =
      await Promise.all([
        this.prisma.customer.count({
          where: {
            shopId,
            firstVisitDate: { gte: start, lte: end },
          },
        }),
        this.prisma.customer.count({
          where: {
            shopId,
            bookings: {
              some: {
                startTime: { gte: start, lte: end },
              },
            },
          },
        }),
        this.prisma.payment.aggregate({
          where: {
            shopId,
            paidAt: { gte: start, lte: end },
            status: 'COMPLETED',
          },
          _sum: { finalAmount: true },
          _count: true,
        }),
        this.prisma.customer.findMany({
          where: {
            shopId,
            payments: {
              some: {
                paidAt: { gte: start, lte: end },
                status: 'COMPLETED',
              },
            },
          },
          include: {
            payments: {
              where: {
                paidAt: { gte: start, lte: end },
                status: 'COMPLETED',
              },
              select: { finalAmount: true },
            },
            _count: {
              select: {
                bookings: {
                  where: {
                    startTime: { gte: start, lte: end },
                  },
                },
              },
            },
          },
        }),
      ]);

    const returningCustomers = totalCustomersInPeriod - newCustomers;
    const totalRevenue = Number(payments._sum.finalAmount) || 0;
    const averageSpend =
      payments._count > 0 ? Math.round(totalRevenue / payments._count) : 0;
    const retentionRate =
      totalCustomersInPeriod > 0
        ? Math.round((returningCustomers / totalCustomersInPeriod) * 100)
        : 0;

    const topCustomers = topCustomersRaw
      .map((c) => ({
        customerId: c.id,
        customerName: c.name,
        phone: c.phone,
        visitCount: c._count.bookings,
        totalSpent: c.payments.reduce(
          (sum, p) => sum + Number(p.finalAmount),
          0,
        ),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      newCustomers,
      returningCustomers: Math.max(returningCustomers, 0),
      retentionRate,
      averageSpend,
      topCustomers,
    };
  }

  async getHourlyReport(shopId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        shopId,
        startTime: { gte: start, lte: end },
        status: { in: ['COMPLETED', 'CONFIRMED', 'READY', 'IN_PROGRESS'] },
      },
      select: { startTime: true },
    });

    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      bookingCount: 0,
    }));

    for (const booking of bookings) {
      const hour = booking.startTime.getHours();
      hourlyData[hour].bookingCount += 1;
    }

    return hourlyData;
  }
}

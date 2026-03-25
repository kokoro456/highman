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
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Single query for entire range
    const payments = await this.prisma.payment.findMany({
      where: { shopId, paidAt: { gte: startDate, lte: endDate }, status: 'COMPLETED' },
      select: { finalAmount: true, paidAt: true },
    });

    // Group by day in JS
    const byDay: Record<string, { revenue: number; count: number }> = {};
    for (const p of payments) {
      const key = new Date(p.paidAt!).toISOString().split('T')[0];
      if (!byDay[key]) byDay[key] = { revenue: 0, count: 0 };
      byDay[key].revenue += Number(p.finalAmount);
      byDay[key].count++;
    }

    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      results.push({
        date: key,
        revenue: byDay[key]?.revenue || 0,
        transactions: byDay[key]?.count || 0,
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

    // Single bulk query: all payments for the month with service info
    const [allPayments, allBookings] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          shopId,
          paidAt: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
        select: {
          finalAmount: true,
          paidAt: true,
          booking: { select: { serviceId: true, service: { select: { name: true } } } },
        },
      }),
      this.prisma.booking.findMany({
        where: {
          shopId,
          startTime: { gte: startDate, lte: endDate },
          status: { in: ['COMPLETED', 'CONFIRMED', 'READY', 'IN_PROGRESS'] },
        },
        select: { startTime: true },
      }),
    ]);

    // Group payments by day
    const paymentsByDay: Record<number, typeof allPayments> = {};
    for (const p of allPayments) {
      const day = new Date(p.paidAt!).getDate();
      if (!paymentsByDay[day]) paymentsByDay[day] = [];
      paymentsByDay[day].push(p);
    }

    // Group bookings by day
    const bookingsByDay: Record<number, number> = {};
    for (const b of allBookings) {
      const day = new Date(b.startTime).getDate();
      bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
    }

    const allServiceNames = new Set<string>();
    const results = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayPayments = paymentsByDay[day] || [];
      const revenue = dayPayments.reduce((sum, p) => sum + Number(p.finalAmount), 0);

      const serviceBreakdown: Record<string, { name: string; amount: number }> = {};
      for (const p of dayPayments) {
        const svcName = p.booking?.service?.name || '직접 결제';
        const svcId = p.booking?.serviceId || 'direct';
        if (!serviceBreakdown[svcId]) {
          serviceBreakdown[svcId] = { name: svcName, amount: 0 };
        }
        serviceBreakdown[svcId].amount += Number(p.finalAmount);
      }

      for (const s of Object.values(serviceBreakdown)) {
        allServiceNames.add(s.name);
      }

      results.push({
        date: new Date(year, month - 1, day).toISOString().split('T')[0],
        revenue,
        bookingCount: bookingsByDay[day] || 0,
        serviceBreakdown: Object.entries(serviceBreakdown).map(([id, v]) => ({
          serviceId: id,
          serviceName: v.name,
          amount: v.amount,
        })),
      });
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

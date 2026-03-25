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

  async getComprehensiveReport(shopId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Calculate previous period (same duration before start)
    const durationMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    const prevStart = new Date(prevEnd.getTime() - durationMs);
    prevStart.setHours(0, 0, 0, 0);

    // Bulk queries: current period + previous period in parallel
    const [
      allPayments,
      allBookings,
      activeStaff,
      newCustomers,
      prevPayments,
      prevBookings,
      prevNewCustomers,
    ] = await Promise.all([
      this.prisma.payment.findMany({
        where: { shopId, paidAt: { gte: start, lte: end }, status: 'COMPLETED' },
        select: { finalAmount: true, paidAt: true, customerId: true, staffId: true, passAmount: true, passId: true },
      }),
      this.prisma.booking.findMany({
        where: { shopId, startTime: { gte: start, lte: end } },
        select: { id: true, startTime: true, endTime: true, status: true, customerId: true, staffId: true },
      }),
      this.prisma.staff.findMany({
        where: { shopId, isActive: true },
        select: { id: true, name: true },
      }),
      this.prisma.customer.findMany({
        where: { shopId, firstVisitDate: { gte: start, lte: end } },
        select: { id: true },
      }),
      this.prisma.payment.findMany({
        where: { shopId, paidAt: { gte: prevStart, lte: prevEnd }, status: 'COMPLETED' },
        select: { finalAmount: true, customerId: true },
      }),
      this.prisma.booking.findMany({
        where: { shopId, startTime: { gte: prevStart, lte: prevEnd } },
        select: { status: true, customerId: true, startTime: true, endTime: true },
      }),
      this.prisma.customer.findMany({
        where: { shopId, firstVisitDate: { gte: prevStart, lte: prevEnd } },
        select: { id: true },
      }),
    ]);

    // ---- Revenue breakdown ----
    const totalRevenue = allPayments.reduce((s, p) => s + Number(p.finalAmount), 0);
    const byPass = allPayments
      .filter((p) => p.passId)
      .reduce((s, p) => s + Number(p.passAmount || p.finalAmount), 0);
    const byTreatment = totalRevenue - byPass;
    const uniqueCustomerIds = new Set(allPayments.map((p) => p.customerId));
    const revenuePerCustomer = uniqueCustomerIds.size > 0 ? Math.round(totalRevenue / uniqueCustomerIds.size) : 0;

    // ---- Booking stats ----
    const totalBookingsCount = allBookings.length;
    const completedBookings = allBookings.filter((b) => b.status === 'COMPLETED').length;
    const noShowBookings = allBookings.filter((b) => b.status === 'NO_SHOW').length;
    const cancelledBookings = allBookings.filter((b) => b.status === 'CANCELLED').length;
    const noShowRate = totalBookingsCount > 0 ? Math.round((noShowBookings / totalBookingsCount) * 1000) / 10 : 0;
    const cancelRate = totalBookingsCount > 0 ? Math.round((cancelledBookings / totalBookingsCount) * 1000) / 10 : 0;

    // ---- Time utilization ----
    // Count working days (exclude Sundays) in period
    let workingDays = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      if (cursor.getDay() !== 0) workingDays++; // 0 = Sunday
      cursor.setDate(cursor.getDate() + 1);
    }
    const hoursPerDay = 10; // 10:00-20:00
    const totalAvailableHours = activeStaff.length * hoursPerDay * workingDays;
    const bookedHours = allBookings
      .filter((b) => b.status !== 'CANCELLED' && b.status !== 'NO_SHOW')
      .reduce((sum, b) => sum + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 3600000, 0);
    const utilizationRate = totalAvailableHours > 0 ? Math.round((bookedHours / totalAvailableHours) * 1000) / 10 : 0;

    // ---- Customer metrics ----
    const newCustomerIds = new Set(newCustomers.map((c) => c.id));
    const visitedCustomerIds = new Set(allBookings.filter((b) => b.status !== 'CANCELLED').map((b) => b.customerId));
    const totalVisited = visitedCustomerIds.size;
    const newCustomerCount = [...visitedCustomerIds].filter((id) => newCustomerIds.has(id)).length;
    const returningCustomerCount = totalVisited - newCustomerCount;
    const returnRate = totalVisited > 0 ? Math.round((returningCustomerCount / totalVisited) * 1000) / 10 : 0;

    // ---- Daily breakdowns ----
    const dayMap = new Map<string, {
      revenue: number;
      totalBookings: number;
      noShow: number;
      cancelled: number;
      bookedHours: number;
      newCustomers: Set<string>;
      returningCustomers: Set<string>;
    }>();

    // Initialize all days
    const initCursor = new Date(start);
    while (initCursor <= end) {
      const key = initCursor.toISOString().split('T')[0];
      dayMap.set(key, { revenue: 0, totalBookings: 0, noShow: 0, cancelled: 0, bookedHours: 0, newCustomers: new Set(), returningCustomers: new Set() });
      initCursor.setDate(initCursor.getDate() + 1);
    }

    for (const p of allPayments) {
      const key = new Date(p.paidAt!).toISOString().split('T')[0];
      const day = dayMap.get(key);
      if (day) day.revenue += Number(p.finalAmount);
    }

    for (const b of allBookings) {
      const key = new Date(b.startTime).toISOString().split('T')[0];
      const day = dayMap.get(key);
      if (!day) continue;
      day.totalBookings++;
      if (b.status === 'NO_SHOW') day.noShow++;
      if (b.status === 'CANCELLED') day.cancelled++;
      if (b.status !== 'CANCELLED' && b.status !== 'NO_SHOW') {
        day.bookedHours += (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 3600000;
      }
      if (b.status !== 'CANCELLED') {
        if (newCustomerIds.has(b.customerId)) {
          day.newCustomers.add(b.customerId);
        } else {
          day.returningCustomers.add(b.customerId);
        }
      }
    }

    const dailyRevenue: { date: string; revenue: number }[] = [];
    const dailyBookings: { date: string; total: number; noShow: number; cancelled: number }[] = [];
    const dailyUtilization: { date: string; rate: number }[] = [];
    const dailyCustomers: { date: string; new: number; returning: number }[] = [];

    const staffCount = activeStaff.length;
    for (const [date, d] of dayMap.entries()) {
      dailyRevenue.push({ date, revenue: d.revenue });
      dailyBookings.push({ date, total: d.totalBookings, noShow: d.noShow, cancelled: d.cancelled });
      const dayOfWeek = new Date(date).getDay();
      const dayAvail = dayOfWeek !== 0 ? staffCount * hoursPerDay : 0;
      const dayRate = dayAvail > 0 ? Math.round((d.bookedHours / dayAvail) * 1000) / 10 : 0;
      dailyUtilization.push({ date, rate: dayRate });
      dailyCustomers.push({ date, new: d.newCustomers.size, returning: d.returningCustomers.size });
    }

    // ---- Revenue by staff ----
    const staffRevenueMap = new Map<string, number>();
    for (const p of allPayments) {
      staffRevenueMap.set(p.staffId, (staffRevenueMap.get(p.staffId) || 0) + Number(p.finalAmount));
    }
    const revenueByStaff = activeStaff
      .map((s) => ({ staffId: s.id, staffName: s.name, revenue: staffRevenueMap.get(s.id) || 0 }))
      .sort((a, b) => b.revenue - a.revenue);

    // ---- Previous period comparison ----
    const prevTotalRevenue = prevPayments.reduce((s, p) => s + Number(p.finalAmount), 0);
    const prevUniqueCustomers = new Set(prevPayments.map((p) => p.customerId));
    const prevRevenuePerCustomer = prevUniqueCustomers.size > 0 ? Math.round(prevTotalRevenue / prevUniqueCustomers.size) : 0;
    const prevTotalBookings = prevBookings.length;

    // Prev utilization
    let prevWorkingDays = 0;
    const prevCursor = new Date(prevStart);
    while (prevCursor <= prevEnd) {
      if (prevCursor.getDay() !== 0) prevWorkingDays++;
      prevCursor.setDate(prevCursor.getDate() + 1);
    }
    const prevAvailHours = activeStaff.length * hoursPerDay * prevWorkingDays;
    const prevBookedHours = prevBookings
      .filter((b) => b.status !== 'CANCELLED' && b.status !== 'NO_SHOW')
      .reduce((sum, b) => sum + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 3600000, 0);
    const prevUtilization = prevAvailHours > 0 ? Math.round((prevBookedHours / prevAvailHours) * 1000) / 10 : 0;

    // Prev return rate
    const prevNewCustomerIds = new Set(prevNewCustomers.map((c) => c.id));
    const prevVisitedIds = new Set(prevBookings.filter((b) => b.status !== 'CANCELLED').map((b) => b.customerId));
    const prevVisitedCount = prevVisitedIds.size;
    const prevNewCount = [...prevVisitedIds].filter((id) => prevNewCustomerIds.has(id)).length;
    const prevReturningCount = prevVisitedCount - prevNewCount;
    const prevReturnRate = prevVisitedCount > 0 ? Math.round((prevReturningCount / prevVisitedCount) * 1000) / 10 : 0;

    const pctDiff = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 1000) / 10;

    return {
      revenue: {
        total: totalRevenue,
        byTreatment,
        byPass,
        revenuePerCustomer,
      },
      bookings: {
        total: totalBookingsCount,
        completed: completedBookings,
        noShow: noShowBookings,
        cancelled: cancelledBookings,
        noShowRate,
        cancelRate,
      },
      timeUtilization: {
        totalAvailableHours: Math.round(totalAvailableHours * 10) / 10,
        bookedHours: Math.round(bookedHours * 10) / 10,
        utilizationRate,
      },
      customers: {
        totalVisited,
        newCustomers: newCustomerCount,
        returningCustomers: returningCustomerCount,
        returnRate,
      },
      dailyRevenue,
      dailyBookings,
      dailyUtilization,
      dailyCustomers,
      revenueByStaff,
      comparison: {
        revenueDiff: pctDiff(totalRevenue, prevTotalRevenue),
        bookingsDiff: pctDiff(totalBookingsCount, prevTotalBookings),
        utilizationDiff: pctDiff(utilizationRate, prevUtilization),
        returnRateDiff: pctDiff(returnRate, prevReturnRate),
        revenuePerCustomerDiff: pctDiff(revenuePerCustomer, prevRevenuePerCustomer),
      },
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

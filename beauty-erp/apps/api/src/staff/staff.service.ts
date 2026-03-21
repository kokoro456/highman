import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(shopId: string, data: {
    name: string; phone: string; email?: string; role: string;
    specialties?: string[]; color: string; sortOrder?: number; hiredAt: string;
  }) {
    return this.prisma.staff.create({
      data: {
        shopId, name: data.name, phone: data.phone, email: data.email,
        role: data.role as any, specialties: data.specialties || [],
        color: data.color, sortOrder: data.sortOrder ?? 0,
        hiredAt: new Date(data.hiredAt),
      },
    });
  }

  async findAll(shopId: string) {
    return this.prisma.staff.findMany({
      where: { shopId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string, shopId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, shopId },
      include: {
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        incentives: { where: { isActive: true }, include: { service: true } },
      },
    });
    if (!staff) throw new NotFoundException('직원을 찾을 수 없습니다');
    return staff;
  }

  async update(id: string, shopId: string, data: any) {
    const staff = await this.prisma.staff.findFirst({ where: { id, shopId } });
    if (!staff) throw new NotFoundException('직원을 찾을 수 없습니다');
    if (data.hiredAt) data.hiredAt = new Date(data.hiredAt);
    return this.prisma.staff.update({ where: { id }, data });
  }

  async delete(id: string, shopId: string) {
    const staff = await this.prisma.staff.findFirst({ where: { id, shopId } });
    if (!staff) throw new NotFoundException('직원을 찾을 수 없습니다');
    return this.prisma.staff.update({ where: { id }, data: { isActive: false } });
  }

  async upsertSchedule(shopId: string, data: {
    staffId: string; dayOfWeek: number; startTime: string; endTime: string;
    breakStartTime?: string; breakEndTime?: string; isActive?: boolean;
  }) {
    return this.prisma.schedule.upsert({
      where: { shopId_staffId_dayOfWeek: { shopId, staffId: data.staffId, dayOfWeek: data.dayOfWeek } },
      create: { shopId, ...data },
      update: data,
    });
  }

  async createIncentive(shopId: string, data: {
    staffId: string; type: string; serviceId?: string; rate: number;
  }) {
    return this.prisma.staffIncentive.create({
      data: { shopId, staffId: data.staffId, type: data.type as any, serviceId: data.serviceId, rate: data.rate },
    });
  }

  async getStaffStats(shopId: string, staffId: string, startDate: string, endDate: string) {
    const [bookings, payments] = await Promise.all([
      this.prisma.booking.count({
        where: { shopId, staffId, startTime: { gte: new Date(startDate), lte: new Date(endDate) } },
      }),
      this.prisma.payment.aggregate({
        where: { shopId, staffId, paidAt: { gte: new Date(startDate), lte: new Date(endDate) }, status: 'COMPLETED' },
        _sum: { finalAmount: true },
        _count: true,
      }),
    ]);

    return {
      bookingCount: bookings,
      paymentCount: payments._count,
      totalRevenue: Number(payments._sum.finalAmount) || 0,
    };
  }

  async getMonthlySettlement(shopId: string, month: string) {
    const startDate = new Date(`${month}-01T00:00:00`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const staffList = await this.prisma.staff.findMany({
      where: { shopId, isActive: true },
      include: {
        incentives: { where: { isActive: true }, include: { service: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const settlements = await Promise.all(
      staffList.map(async (staff) => {
        const [completedBookings, revenue] = await Promise.all([
          this.prisma.booking.count({
            where: {
              shopId, staffId: staff.id, status: 'COMPLETED',
              startTime: { gte: startDate, lt: endDate },
            },
          }),
          this.prisma.payment.aggregate({
            where: {
              shopId, staffId: staff.id, status: 'COMPLETED',
              paidAt: { gte: startDate, lt: endDate },
            },
            _sum: { finalAmount: true },
          }),
        ]);

        const totalRevenue = Number(revenue._sum.finalAmount) || 0;
        let incentiveAmount = 0;

        for (const rule of staff.incentives) {
          const rate = Number(rule.rate);
          if (rule.type === 'FIXED') {
            incentiveAmount += rate;
          } else if (rule.type === 'PERCENTAGE') {
            if (rule.serviceId) {
              const serviceRevenue = await this.prisma.payment.aggregate({
                where: {
                  shopId, staffId: staff.id, status: 'COMPLETED',
                  paidAt: { gte: startDate, lt: endDate },
                  booking: { serviceId: rule.serviceId },
                },
                _sum: { finalAmount: true },
              });
              incentiveAmount += (Number(serviceRevenue._sum.finalAmount) || 0) * rate / 100;
            } else {
              incentiveAmount += totalRevenue * rate / 100;
            }
          }
        }

        return {
          staffId: staff.id,
          name: staff.name,
          role: staff.role,
          totalBookings: completedBookings,
          totalRevenue,
          incentiveAmount: Math.round(incentiveAmount),
          baseSalary: 0,
          totalPay: Math.round(incentiveAmount),
        };
      }),
    );

    return settlements;
  }

  async getStaffSettlementDetail(shopId: string, staffId: string, month: string) {
    const startDate = new Date(`${month}-01T00:00:00`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, shopId },
      include: {
        incentives: { where: { isActive: true }, include: { service: true } },
      },
    });
    if (!staff) throw new NotFoundException('직원을 찾을 수 없습니다');

    // Service breakdown
    const bookingsWithPayments = await this.prisma.booking.findMany({
      where: {
        shopId, staffId, status: 'COMPLETED',
        startTime: { gte: startDate, lt: endDate },
      },
      include: {
        service: true,
        payments: { where: { status: 'COMPLETED' } },
      },
    });

    const serviceMap = new Map<string, { serviceName: string; bookingCount: number; revenue: number }>();
    for (const booking of bookingsWithPayments) {
      const serviceId = booking.serviceId;
      const existing = serviceMap.get(serviceId) || {
        serviceName: booking.service.name,
        bookingCount: 0,
        revenue: 0,
      };
      existing.bookingCount += 1;
      existing.revenue += booking.payments.reduce((sum, p) => sum + Number(p.finalAmount), 0);
      serviceMap.set(serviceId, existing);
    }
    const serviceBreakdown = Array.from(serviceMap.entries()).map(([serviceId, data]) => ({
      serviceId, ...data,
    }));

    // Daily revenue
    const dailyMap = new Map<string, number>();
    const daysInMonth = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = 0; i < daysInMonth; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailyMap.set(key, 0);
    }

    const dailyPayments = await this.prisma.payment.findMany({
      where: {
        shopId, staffId, status: 'COMPLETED',
        paidAt: { gte: startDate, lt: endDate },
      },
      select: { paidAt: true, finalAmount: true },
    });
    for (const p of dailyPayments) {
      const d = p.paidAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailyMap.set(key, (dailyMap.get(key) || 0) + Number(p.finalAmount));
    }

    const dailyRevenue = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));

    // Incentive calculation
    const totalRevenue = dailyPayments.reduce((sum, p) => sum + Number(p.finalAmount), 0);
    let incentiveAmount = 0;
    const incentiveBreakdown: { type: string; serviceName: string | null; rate: number; amount: number }[] = [];

    for (const rule of staff.incentives) {
      const rate = Number(rule.rate);
      let amount = 0;
      if (rule.type === 'FIXED') {
        amount = rate;
      } else if (rule.type === 'PERCENTAGE') {
        if (rule.serviceId) {
          const svc = serviceBreakdown.find((s) => s.serviceId === rule.serviceId);
          amount = Math.round((svc?.revenue || 0) * rate / 100);
        } else {
          amount = Math.round(totalRevenue * rate / 100);
        }
      }
      incentiveAmount += amount;
      incentiveBreakdown.push({
        type: rule.type,
        serviceName: rule.service?.name || null,
        rate,
        amount,
      });
    }

    return {
      staffId: staff.id,
      name: staff.name,
      role: staff.role,
      totalBookings: bookingsWithPayments.length,
      totalRevenue,
      incentiveAmount: Math.round(incentiveAmount),
      baseSalary: 0,
      totalPay: Math.round(incentiveAmount),
      serviceBreakdown,
      dailyRevenue,
      incentiveBreakdown,
    };
  }
}

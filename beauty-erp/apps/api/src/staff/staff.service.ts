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
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async update(id: string, shopId: string, data: any) {
    const staff = await this.prisma.staff.findFirst({ where: { id, shopId } });
    if (!staff) throw new NotFoundException('Staff not found');
    if (data.hiredAt) data.hiredAt = new Date(data.hiredAt);
    return this.prisma.staff.update({ where: { id }, data });
  }

  async delete(id: string, shopId: string) {
    const staff = await this.prisma.staff.findFirst({ where: { id, shopId } });
    if (!staff) throw new NotFoundException('Staff not found');
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
}

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(shopId: string, data: {
    customerId: string; staffId: string; serviceId: string;
    startTime: string; memo?: string; source?: string;
  }) {
    if (!data.customerId || !data.staffId || !data.serviceId || !data.startTime) {
      throw new BadRequestException('customerId, staffId, serviceId, startTime are required');
    }

    const service = await this.prisma.service.findFirst({ where: { id: data.serviceId, shopId } });
    if (!service) throw new NotFoundException(`Service not found (id: ${data.serviceId}, shopId: ${shopId})`);

    const customer = await this.prisma.customer.findFirst({ where: { id: data.customerId, shopId } });
    if (!customer) throw new NotFoundException(`Customer not found (id: ${data.customerId})`);

    const staff = await this.prisma.staff.findFirst({ where: { id: data.staffId, shopId } });
    if (!staff) throw new NotFoundException(`Staff not found (id: ${data.staffId})`);

    const startTime = new Date(data.startTime);
    if (isNaN(startTime.getTime())) throw new BadRequestException('Invalid startTime format');
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Check for conflicts
    const conflict = await this.prisma.booking.findFirst({
      where: {
        shopId, staffId: data.staffId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });
    if (conflict) throw new ConflictException('Time slot is already booked');

    return this.prisma.booking.create({
      data: {
        shopId, customerId: data.customerId, staffId: data.staffId,
        serviceId: data.serviceId, startTime, endTime,
        memo: data.memo, source: (data.source as any) || 'DIRECT',
      },
      include: { customer: true, staff: true, service: true },
    });
  }

  async findByDate(shopId: string, date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.prisma.booking.findMany({
      where: { shopId, startTime: { gte: start, lte: end } },
      include: { customer: true, staff: true, service: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async findByDateRange(shopId: string, startDate: string, endDate: string) {
    return this.prisma.booking.findMany({
      where: {
        shopId,
        startTime: { gte: new Date(startDate) },
        endTime: { lte: new Date(endDate) },
      },
      include: { customer: true, staff: true, service: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async updateStatus(id: string, shopId: string, status: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id, shopId } });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: { customer: true, staff: true, service: true },
    });
  }

  async update(id: string, shopId: string, data: any) {
    const booking = await this.prisma.booking.findFirst({ where: { id, shopId } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (data.startTime && data.serviceId) {
      const service = await this.prisma.service.findUnique({ where: { id: data.serviceId } });
      if (service) {
        data.endTime = new Date(new Date(data.startTime).getTime() + service.duration * 60000);
      }
    }

    return this.prisma.booking.update({
      where: { id }, data,
      include: { customer: true, staff: true, service: true },
    });
  }
}

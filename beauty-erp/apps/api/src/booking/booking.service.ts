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
      throw new BadRequestException('고객, 담당자, 서비스, 시작 시간은 필수 항목입니다');
    }

    const service = await this.prisma.service.findFirst({ where: { id: data.serviceId, shopId } });
    if (!service) throw new NotFoundException(`서비스를 찾을 수 없습니다 (id: ${data.serviceId})`);

    const customer = await this.prisma.customer.findFirst({ where: { id: data.customerId, shopId } });
    if (!customer) throw new NotFoundException(`고객을 찾을 수 없습니다 (id: ${data.customerId})`);

    const staff = await this.prisma.staff.findFirst({ where: { id: data.staffId, shopId } });
    if (!staff) throw new NotFoundException(`담당 직원을 찾을 수 없습니다 (id: ${data.staffId})`);

    const startTime = new Date(data.startTime);
    if (isNaN(startTime.getTime())) throw new BadRequestException('시작 시간 형식이 올바르지 않습니다');
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
    if (conflict) throw new ConflictException('해당 시간에 이미 예약이 있습니다');

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
    if (!booking) throw new NotFoundException('예약을 찾을 수 없습니다');
    return this.prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: { customer: true, staff: true, service: true },
    });
  }

  async update(id: string, shopId: string, data: any) {
    const booking = await this.prisma.booking.findFirst({ where: { id, shopId } });
    if (!booking) throw new NotFoundException('예약을 찾을 수 없습니다');

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

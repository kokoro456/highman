import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlimtalkService } from '../alimtalk/alimtalk.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private prisma: PrismaService,
    private alimtalkService: AlimtalkService,
  ) {}

  async create(shopId: string, data: {
    customerId: string; staffId: string; serviceId: string;
    startTime: string; memo?: string; source?: string;
    depositAmount?: number; depositStatus?: string;
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

    const booking = await this.prisma.booking.create({
      data: {
        shopId, customerId: data.customerId, staffId: data.staffId,
        serviceId: data.serviceId, startTime, endTime,
        memo: data.memo, source: (data.source as any) || 'DIRECT',
        depositAmount: data.depositAmount ?? 0,
        depositStatus: (data.depositStatus as any) ?? 'NONE',
      },
      include: { customer: true, staff: true, service: true },
    });

    // Send Alimtalk confirmation (non-blocking)
    try {
      const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
      if (customer.phone) {
        await this.alimtalkService.sendBookingConfirmation(customer.phone, {
          customerName: customer.name,
          shopName: shop?.name || '',
          serviceName: service.name,
          dateTime: startTime.toLocaleString('ko-KR'),
          staffName: staff.name,
        });
      }
    } catch (error: any) {
      this.logger.warn(`Alimtalk booking confirmation failed: ${error.message}`);
    }

    // Check no-show history and add warning flag
    const noShowStats = await this.getNoShowStats(data.customerId);
    const result: any = { ...booking, noShowWarning: false, noShowCount: noShowStats.count };
    if (noShowStats.count >= 3) {
      result.noShowWarning = true;
    }

    return result;
  }

  async getNoShowStats(customerId: string) {
    const count = await this.prisma.booking.count({
      where: {
        customerId,
        status: 'NO_SHOW',
      },
    });
    return { customerId, count };
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
    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: { customer: true, staff: true, service: true },
    });

    // Send Alimtalk cancellation notification (non-blocking)
    if (status === 'CANCELLED') {
      try {
        const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
        const customer = updated.customer as any;
        const service = updated.service as any;
        if (customer?.phone) {
          await this.alimtalkService.sendBookingCancellation(customer.phone, {
            customerName: customer.name,
            shopName: shop?.name || '',
            serviceName: service?.name || '',
            dateTime: updated.startTime.toLocaleString('ko-KR'),
          });
        }
      } catch (error: any) {
        this.logger.warn(`Alimtalk booking cancellation failed: ${error.message}`);
      }
    }

    return updated;
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

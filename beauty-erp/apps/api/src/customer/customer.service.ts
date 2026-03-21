import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(shopId: string, data: {
    name: string; phone: string; email?: string;
    gender?: string; birthDate?: string; memo?: string;
    tags?: string[]; consentMarketing?: boolean;
  }) {
    return this.prisma.customer.create({
      data: {
        shopId, name: data.name, phone: data.phone,
        email: data.email, gender: data.gender as any,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        memo: data.memo, tags: data.tags || [],
        consentMarketing: data.consentMarketing ?? false,
      },
    });
  }

  async findAll(shopId: string, query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { shopId };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, shopId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, shopId },
      include: {
        treatmentHistories: {
          orderBy: { treatmentDate: 'desc' },
          take: 20,
          include: { staff: true, photos: true },
        },
        passes: { where: { status: 'ACTIVE' } },
        bookings: { orderBy: { startTime: 'desc' }, take: 10, include: { service: true, staff: true } },
      },
    });
    if (!customer) throw new NotFoundException('고객을 찾을 수 없습니다');
    return customer;
  }

  async update(id: string, shopId: string, data: any) {
    const customer = await this.prisma.customer.findFirst({ where: { id, shopId } });
    if (!customer) throw new NotFoundException('고객을 찾을 수 없습니다');
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    return this.prisma.customer.update({ where: { id }, data });
  }

  async addTreatmentHistory(shopId: string, data: {
    customerId: string; bookingId?: string; staffId: string;
    serviceId: string; serviceName: string; price: number;
    notes?: string; treatmentDate: string;
  }) {
    const history = await this.prisma.treatmentHistory.create({
      data: {
        shopId, customerId: data.customerId, bookingId: data.bookingId,
        staffId: data.staffId, serviceId: data.serviceId,
        serviceName: data.serviceName, price: data.price,
        notes: data.notes, treatmentDate: new Date(data.treatmentDate),
      },
    });

    // Update customer visit count and last visit
    await this.prisma.customer.update({
      where: { id: data.customerId },
      data: {
        visitCount: { increment: 1 },
        lastVisitDate: new Date(data.treatmentDate),
        totalSpent: { increment: data.price },
      },
    });

    return history;
  }
}

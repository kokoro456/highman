import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(shopId: string, data: {
    customerId: string; bookingId?: string; staffId: string;
    amount: number; discount?: number; method: string;
    passId?: string; passAmount?: number; memo?: string;
  }) {
    const discount = data.discount || 0;
    const finalAmount = data.amount - discount;

    // Handle pass payment
    if (data.passId && data.passAmount) {
      const pass = await this.prisma.pass.findFirst({
        where: { id: data.passId, shopId, status: 'ACTIVE' },
      });
      if (!pass) throw new NotFoundException('Pass not found or inactive');

      if (pass.type === 'TICKET' && (pass.remainingCount ?? 0) < 1) {
        throw new BadRequestException('No remaining count on pass');
      }
      if (pass.type === 'MEMBERSHIP' && (Number(pass.remainingAmount) ?? 0) < data.passAmount) {
        throw new BadRequestException('Insufficient pass balance');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          shopId, customerId: data.customerId, bookingId: data.bookingId,
          staffId: data.staffId, amount: data.amount, discount,
          finalAmount, method: data.method as any, status: 'COMPLETED',
          passId: data.passId, passAmount: data.passAmount,
          memo: data.memo, paidAt: new Date(),
        },
        include: { customer: true, staff: true },
      });

      // Deduct from pass if used
      if (data.passId && data.passAmount) {
        const pass = await tx.pass.findUnique({ where: { id: data.passId } });
        if (pass) {
          const updateData: any = {};
          if (pass.type === 'TICKET') {
            updateData.remainingCount = (pass.remainingCount ?? 0) - 1;
            if (updateData.remainingCount <= 0) updateData.status = 'EXHAUSTED';
          } else {
            updateData.remainingAmount = Number(pass.remainingAmount ?? 0) - data.passAmount;
            if (updateData.remainingAmount <= 0) updateData.status = 'EXHAUSTED';
          }
          await tx.pass.update({ where: { id: data.passId }, data: updateData });

          await tx.passUsage.create({
            data: {
              passId: data.passId, paymentId: payment.id, shopId,
              type: 'USE',
              countUsed: pass.type === 'TICKET' ? 1 : null,
              amountUsed: pass.type === 'MEMBERSHIP' ? data.passAmount : null,
              remainingCount: updateData.remainingCount ?? pass.remainingCount,
              remainingAmount: updateData.remainingAmount ?? Number(pass.remainingAmount),
              usedAt: new Date(),
            },
          });
        }
      }

      // Update customer totalSpent
      await tx.customer.update({
        where: { id: data.customerId },
        data: { totalSpent: { increment: finalAmount } },
      });

      // Update booking status if linked
      if (data.bookingId) {
        await tx.booking.update({
          where: { id: data.bookingId },
          data: { status: 'COMPLETED' },
        });
      }

      return payment;
    });
  }

  async findAll(shopId: string, query: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { shopId };
    if (query.startDate && query.endDate) {
      where.paidAt = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where, skip, take: limit,
        include: { customer: true, staff: true },
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createPass(shopId: string, data: {
    customerId: string; type: string; name: string;
    totalCount?: number; totalAmount?: number; price: number;
    startDate: string; expiryDate?: string;
  }) {
    return this.prisma.pass.create({
      data: {
        shopId, customerId: data.customerId, type: data.type as any,
        name: data.name, totalCount: data.totalCount,
        remainingCount: data.totalCount, totalAmount: data.totalAmount,
        remainingAmount: data.totalAmount, price: data.price,
        startDate: new Date(data.startDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
  }

  async findPasses(shopId: string, customerId?: string) {
    const where: any = { shopId };
    if (customerId) where.customerId = customerId;
    return this.prisma.pass.findMany({
      where, include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDailySummary(shopId: string, date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const payments = await this.prisma.payment.findMany({
      where: { shopId, paidAt: { gte: start, lte: end }, status: 'COMPLETED' },
    });

    return {
      totalRevenue: payments.reduce((sum, p) => sum + Number(p.finalAmount), 0),
      cardRevenue: payments.filter(p => p.method === 'CARD').reduce((sum, p) => sum + Number(p.finalAmount), 0),
      cashRevenue: payments.filter(p => p.method === 'CASH').reduce((sum, p) => sum + Number(p.finalAmount), 0),
      transferRevenue: payments.filter(p => p.method === 'TRANSFER').reduce((sum, p) => sum + Number(p.finalAmount), 0),
      passRevenue: payments.filter(p => p.method === 'PASS').reduce((sum, p) => sum + Number(p.finalAmount), 0),
      transactionCount: payments.length,
    };
  }
}

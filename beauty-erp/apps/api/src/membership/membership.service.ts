import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  // ==================== MEMBERSHIP CARDS ====================

  async createCard(shopId: string, data: {
    customerId: string;
    name: string;
    type: 'AMOUNT' | 'DISCOUNT' | 'COUNT';
    totalAmount?: number;
    discountRate?: number;
    totalCount?: number;
    validFrom: string;
    validUntil?: string;
  }) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: data.customerId, shopId },
    });
    if (!customer) throw new NotFoundException('고객을 찾을 수 없습니다');

    if (data.type === 'AMOUNT' && (!data.totalAmount || data.totalAmount <= 0)) {
      throw new BadRequestException('금액권은 충전 금액이 필요합니다');
    }
    if (data.type === 'DISCOUNT' && (!data.discountRate || data.discountRate <= 0 || data.discountRate > 100)) {
      throw new BadRequestException('할인권은 1~100 사이의 할인율이 필요합니다');
    }
    if (data.type === 'COUNT' && (!data.totalCount || data.totalCount <= 0)) {
      throw new BadRequestException('횟수권은 총 횟수가 필요합니다');
    }

    return this.prisma.membershipCard.create({
      data: {
        shopId,
        customerId: data.customerId,
        name: data.name,
        type: data.type,
        totalAmount: data.type === 'AMOUNT' ? data.totalAmount : null,
        remainingAmount: data.type === 'AMOUNT' ? data.totalAmount : null,
        discountRate: data.type === 'DISCOUNT' ? data.discountRate : null,
        totalCount: data.type === 'COUNT' ? data.totalCount : null,
        remainingCount: data.type === 'COUNT' ? data.totalCount : null,
        validFrom: new Date(data.validFrom),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
      include: { customer: true },
    });
  }

  async findCards(shopId: string, customerId: string) {
    return this.prisma.membershipCard.findMany({
      where: { shopId, customerId },
      include: { customer: true, usages: { orderBy: { createdAt: 'desc' }, take: 10 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async useCard(id: string, shopId: string, data: { amount: number; description: string }) {
    const card = await this.prisma.membershipCard.findFirst({
      where: { id, shopId, isActive: true },
    });
    if (!card) throw new NotFoundException('유효한 회원권을 찾을 수 없습니다');

    // Check expiry
    if (card.validUntil && new Date() > card.validUntil) {
      throw new BadRequestException('만료된 회원권입니다');
    }

    if (card.type === 'AMOUNT') {
      const remaining = Number(card.remainingAmount ?? 0);
      if (data.amount > remaining) {
        throw new BadRequestException(`잔액이 부족합니다 (잔액: ${remaining}원)`);
      }
      const newRemaining = remaining - data.amount;
      await this.prisma.membershipCard.update({
        where: { id },
        data: {
          remainingAmount: newRemaining,
          isActive: newRemaining > 0,
        },
      });
    } else if (card.type === 'COUNT') {
      const remaining = card.remainingCount ?? 0;
      if (remaining <= 0) {
        throw new BadRequestException('남은 횟수가 없습니다');
      }
      const newRemaining = remaining - 1;
      await this.prisma.membershipCard.update({
        where: { id },
        data: {
          remainingCount: newRemaining,
          isActive: newRemaining > 0,
        },
      });
    } else if (card.type === 'DISCOUNT') {
      // Discount cards don't deplete, just log usage
    }

    return this.prisma.membershipUsage.create({
      data: {
        membershipCardId: id,
        amount: data.amount,
        description: data.description,
      },
    });
  }

  async chargeCard(id: string, shopId: string, data: { amount?: number; count?: number }) {
    const card = await this.prisma.membershipCard.findFirst({
      where: { id, shopId },
    });
    if (!card) throw new NotFoundException('회원권을 찾을 수 없습니다');

    if (card.type === 'AMOUNT') {
      if (!data.amount || data.amount <= 0) throw new BadRequestException('충전 금액이 필요합니다');
      const current = Number(card.remainingAmount ?? 0);
      return this.prisma.membershipCard.update({
        where: { id },
        data: {
          remainingAmount: current + data.amount,
          totalAmount: Number(card.totalAmount ?? 0) + data.amount,
          isActive: true,
        },
        include: { customer: true },
      });
    } else if (card.type === 'COUNT') {
      if (!data.count || data.count <= 0) throw new BadRequestException('충전 횟수가 필요합니다');
      return this.prisma.membershipCard.update({
        where: { id },
        data: {
          remainingCount: (card.remainingCount ?? 0) + data.count,
          totalCount: (card.totalCount ?? 0) + data.count,
          isActive: true,
        },
        include: { customer: true },
      });
    }

    throw new BadRequestException('할인권은 충전할 수 없습니다');
  }

  // ==================== POINTS ====================

  async earnPoints(shopId: string, data: { customerId: string; points: number; description: string }) {
    if (data.points <= 0) throw new BadRequestException('포인트는 양수여야 합니다');

    const customer = await this.prisma.customer.findFirst({
      where: { id: data.customerId, shopId },
    });
    if (!customer) throw new NotFoundException('고객을 찾을 수 없습니다');

    const [transaction] = await this.prisma.$transaction([
      this.prisma.pointTransaction.create({
        data: {
          shopId,
          customerId: data.customerId,
          points: data.points,
          type: 'EARN',
          description: data.description,
        },
      }),
      this.prisma.customer.update({
        where: { id: data.customerId },
        data: { points: { increment: data.points } },
      }),
    ]);

    return transaction;
  }

  async spendPoints(shopId: string, data: { customerId: string; points: number; description: string }) {
    if (data.points <= 0) throw new BadRequestException('포인트는 양수여야 합니다');

    const customer = await this.prisma.customer.findFirst({
      where: { id: data.customerId, shopId },
    });
    if (!customer) throw new NotFoundException('고객을 찾을 수 없습니다');

    if (customer.points < data.points) {
      throw new BadRequestException(`포인트가 부족합니다 (보유: ${customer.points}P)`);
    }

    const [transaction] = await this.prisma.$transaction([
      this.prisma.pointTransaction.create({
        data: {
          shopId,
          customerId: data.customerId,
          points: -data.points,
          type: 'SPEND',
          description: data.description,
        },
      }),
      this.prisma.customer.update({
        where: { id: data.customerId },
        data: { points: { decrement: data.points } },
      }),
    ]);

    return transaction;
  }

  async getPointHistory(shopId: string, customerId: string) {
    return this.prisma.pointTransaction.findMany({
      where: { shopId, customerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getPointBalance(shopId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, shopId },
    });
    if (!customer) throw new NotFoundException('고객을 찾을 수 없습니다');
    return { balance: customer.points };
  }
}

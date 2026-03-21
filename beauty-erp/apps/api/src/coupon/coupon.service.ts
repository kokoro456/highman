import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async create(shopId: string, data: {
    code: string;
    name: string;
    type: 'FIXED' | 'PERCENTAGE';
    value: number;
    minAmount?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    maxUsage?: number;
  }) {
    // Check for duplicate code within shop
    const existing = await this.prisma.coupon.findUnique({
      where: { shopId_code: { shopId, code: data.code } },
    });
    if (existing) {
      throw new BadRequestException('이미 존재하는 쿠폰 코드입니다');
    }

    if (data.type === 'PERCENTAGE' && (data.value < 0 || data.value > 100)) {
      throw new BadRequestException('비율 할인은 0~100 사이여야 합니다');
    }

    return this.prisma.coupon.create({
      data: {
        shopId,
        code: data.code.toUpperCase(),
        name: data.name,
        type: data.type,
        value: data.value,
        minAmount: data.minAmount ?? null,
        maxDiscount: data.maxDiscount ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxUsage: data.maxUsage ?? null,
      },
    });
  }

  async findAll(shopId: string, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = { shopId };

    if (query.status === 'active') {
      where.isActive = true;
      where.endDate = { gte: now };
    } else if (query.status === 'expired') {
      where.OR = [
        { isActive: false },
        { endDate: { lt: now } },
      ];
    }

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { usages: true } } },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    const data = coupons.map((coupon) => ({
      ...coupon,
      isExpired: coupon.endDate < now,
      usageCount: coupon._count.usages,
    }));

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, shopId: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, shopId },
      include: {
        _count: { select: { usages: true } },
        usages: {
          take: 20,
          orderBy: { usedAt: 'desc' },
        },
      },
    });
    if (!coupon) throw new NotFoundException('쿠폰을 찾을 수 없습니다');
    return coupon;
  }

  async update(id: string, shopId: string, data: {
    name?: string;
    value?: number;
    minAmount?: number | null;
    maxDiscount?: number | null;
    startDate?: string;
    endDate?: string;
    maxUsage?: number | null;
    isActive?: boolean;
  }) {
    const coupon = await this.prisma.coupon.findFirst({ where: { id, shopId } });
    if (!coupon) throw new NotFoundException('쿠폰을 찾을 수 없습니다');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.minAmount !== undefined) updateData.minAmount = data.minAmount;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.maxUsage !== undefined) updateData.maxUsage = data.maxUsage;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.coupon.update({ where: { id }, data: updateData });
  }

  async deactivate(id: string, shopId: string) {
    const coupon = await this.prisma.coupon.findFirst({ where: { id, shopId } });
    if (!coupon) throw new NotFoundException('쿠폰을 찾을 수 없습니다');
    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async validate(shopId: string, data: { code: string; amount?: number }) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { shopId_code: { shopId, code: data.code.toUpperCase() } },
    });

    if (!coupon) {
      throw new BadRequestException('존재하지 않는 쿠폰 코드입니다');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('비활성화된 쿠폰입니다');
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestException('아직 사용 기간이 아닙니다');
    }
    if (now > coupon.endDate) {
      throw new BadRequestException('만료된 쿠폰입니다');
    }
    if (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage) {
      throw new BadRequestException('사용 횟수가 초과된 쿠폰입니다');
    }
    if (coupon.minAmount && data.amount !== undefined) {
      if (data.amount < Number(coupon.minAmount)) {
        throw new BadRequestException(`최소 주문 금액은 ${coupon.minAmount}원입니다`);
      }
    }

    // Calculate discount
    let discount: number;
    if (coupon.type === 'FIXED') {
      discount = Number(coupon.value);
    } else {
      discount = Math.round((data.amount || 0) * Number(coupon.value) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    }

    return {
      coupon,
      discount,
    };
  }

  async apply(shopId: string, data: { code: string; customerId: string; paymentId?: string; amount: number }) {
    const { coupon, discount } = await this.validate(shopId, { code: data.code, amount: data.amount });

    const [usage] = await this.prisma.$transaction([
      this.prisma.couponUsage.create({
        data: {
          couponId: coupon.id,
          customerId: data.customerId,
          paymentId: data.paymentId ?? null,
          discount,
        },
      }),
      this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    return { usage, discount };
  }
}

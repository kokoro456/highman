import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPlatformStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalShops, totalUsers, todayBookings, todayRevenue] =
      await Promise.all([
        this.prisma.shop.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.booking.count({
          where: { startTime: { gte: today, lt: tomorrow } },
        }),
        this.prisma.payment.aggregate({
          where: {
            paidAt: { gte: today, lt: tomorrow },
            status: 'COMPLETED',
          },
          _sum: { finalAmount: true },
        }),
      ]);

    return {
      totalShops,
      totalUsers,
      todayBookings,
      todayRevenue: Number(todayRevenue._sum.finalAmount) || 0,
    };
  }

  async getShopList(search?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = { isActive: true };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const shops = await this.prisma.shop.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            bookings: true,
            customers: true,
            staff: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get today's booking/revenue counts per shop
    const shopIds = shops.map((s) => s.id);

    const todayBookings = await this.prisma.booking.groupBy({
      by: ['shopId'],
      where: {
        shopId: { in: shopIds },
        startTime: { gte: today, lt: tomorrow },
      },
      _count: true,
    });

    const todayRevenue = await this.prisma.payment.groupBy({
      by: ['shopId'],
      where: {
        shopId: { in: shopIds },
        paidAt: { gte: today, lt: tomorrow },
        status: 'COMPLETED',
      },
      _sum: { finalAmount: true },
    });

    const bookingMap = new Map(
      todayBookings.map((b) => [b.shopId, b._count]),
    );
    const revenueMap = new Map(
      todayRevenue.map((r) => [r.shopId, Number(r._sum.finalAmount) || 0]),
    );

    return shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      businessType: shop.businessType,
      subscriptionTier: shop.subscriptionTier,
      owner: shop.owner,
      totalBookings: shop._count.bookings,
      totalCustomers: shop._count.customers,
      totalStaff: shop._count.staff,
      todayBookings: bookingMap.get(shop.id) || 0,
      todayRevenue: revenueMap.get(shop.id) || 0,
      createdAt: shop.createdAt,
    }));
  }

  async getShopDetail(shopId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [shop, todayBookings, monthRevenue, monthBookings] =
      await Promise.all([
        this.prisma.shop.findUnique({
          where: { id: shopId },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: {
              select: { bookings: true, customers: true, staff: true, services: true },
            },
          },
        }),
        this.prisma.booking.count({
          where: { shopId, startTime: { gte: today, lt: tomorrow } },
        }),
        this.prisma.payment.aggregate({
          where: {
            shopId,
            paidAt: { gte: monthAgo, lt: tomorrow },
            status: 'COMPLETED',
          },
          _sum: { finalAmount: true },
        }),
        this.prisma.booking.count({
          where: { shopId, startTime: { gte: monthAgo, lt: tomorrow } },
        }),
      ]);

    if (!shop) return null;

    return {
      ...shop,
      todayBookings,
      monthRevenue: Number(monthRevenue._sum.finalAmount) || 0,
      monthBookings,
    };
  }
}

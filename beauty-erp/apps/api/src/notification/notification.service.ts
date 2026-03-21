import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(shopId: string, query: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { shopId };
    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.inAppNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inAppNotification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(shopId: string) {
    const count = await this.prisma.inAppNotification.count({
      where: { shopId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string, shopId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: { id, shopId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(shopId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: { shopId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(shopId: string, data: {
    type: string;
    title: string;
    message: string;
    userId?: string;
    metadata?: any;
  }) {
    return this.prisma.inAppNotification.create({
      data: {
        shopId,
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        metadata: data.metadata,
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, data: Record<string, any>) {
    const { ownerId: _, ...shopData } = data;
    return this.prisma.shop.create({
      data: { ...shopData, ownerId } as any,
    });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId, isActive: true },
    });
  }

  async findById(id: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) throw new NotFoundException('매장을 찾을 수 없습니다');
    return shop;
  }

  async update(id: string, data: Prisma.ShopUpdateInput) {
    return this.prisma.shop.update({ where: { id }, data });
  }
}

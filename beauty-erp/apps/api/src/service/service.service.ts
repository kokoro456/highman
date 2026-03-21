import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async createCategory(shopId: string, data: { name: string; sortOrder?: number }) {
    return this.prisma.serviceCategory.create({
      data: { shopId, name: data.name, sortOrder: data.sortOrder ?? 0 },
    });
  }

  async findCategories(shopId: string) {
    return this.prisma.serviceCategory.findMany({
      where: { shopId, isActive: true },
      include: { services: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createService(shopId: string, data: {
    categoryId: string; name: string; description?: string;
    duration: number; price: number; b2cPrice?: number;
    isLinkedB2c?: boolean; sortOrder?: number;
  }) {
    return this.prisma.service.create({
      data: { shopId, ...data, sortOrder: data.sortOrder ?? 0 },
    });
  }

  async findServices(shopId: string) {
    return this.prisma.service.findMany({
      where: { shopId, isActive: true },
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateService(id: string, shopId: string, data: any) {
    const service = await this.prisma.service.findFirst({ where: { id, shopId } });
    if (!service) throw new NotFoundException('서비스를 찾을 수 없습니다');
    return this.prisma.service.update({ where: { id }, data });
  }

  async deleteService(id: string, shopId: string) {
    const service = await this.prisma.service.findFirst({ where: { id, shopId } });
    if (!service) throw new NotFoundException('서비스를 찾을 수 없습니다');
    return this.prisma.service.update({ where: { id }, data: { isActive: false } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(shopId: string, query: { page?: number; limit?: number; search?: string; lowStockOnly?: boolean }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { shopId, isActive: true };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    // Mark low stock items
    const data = items.map((item) => ({
      ...item,
      isLowStock: item.quantity <= item.minQuantity,
    }));

    // Filter to low stock only if requested
    const filteredData = query.lowStockOnly
      ? data.filter((item) => item.isLowStock)
      : data;

    return {
      data: filteredData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      lowStockCount: data.filter((item) => item.isLowStock).length,
    };
  }

  async create(shopId: string, data: {
    name: string;
    category?: string;
    unit?: string;
    quantity?: number;
    minQuantity?: number;
    price?: number;
  }) {
    return this.prisma.inventoryItem.create({
      data: {
        shopId,
        name: data.name,
        category: data.category,
        unit: data.unit ?? '개',
        quantity: data.quantity ?? 0,
        minQuantity: data.minQuantity ?? 5,
        price: data.price ?? 0,
      },
    });
  }

  async update(id: string, shopId: string, data: any) {
    const item = await this.prisma.inventoryItem.findFirst({ where: { id, shopId } });
    if (!item) throw new NotFoundException('재고 항목을 찾을 수 없습니다');
    return this.prisma.inventoryItem.update({ where: { id }, data });
  }

  async addLog(id: string, shopId: string, data: { type: string; quantity: number; memo?: string }) {
    const item = await this.prisma.inventoryItem.findFirst({ where: { id, shopId } });
    if (!item) throw new NotFoundException('재고 항목을 찾을 수 없습니다');

    // Calculate new quantity
    let newQuantity = item.quantity;
    if (data.type === 'IN') {
      newQuantity += data.quantity;
    } else if (data.type === 'OUT') {
      newQuantity = Math.max(0, newQuantity - data.quantity);
    } else if (data.type === 'ADJUST') {
      newQuantity = data.quantity;
    }

    // Create log and update quantity in transaction
    const [log] = await this.prisma.$transaction([
      this.prisma.inventoryLog.create({
        data: {
          itemId: id,
          type: data.type,
          quantity: data.quantity,
          memo: data.memo,
        },
      }),
      this.prisma.inventoryItem.update({
        where: { id },
        data: { quantity: newQuantity },
      }),
    ]);

    return log;
  }

  async getLogs(id: string, shopId: string, query: { page?: number; limit?: number }) {
    const item = await this.prisma.inventoryItem.findFirst({ where: { id, shopId } });
    if (!item) throw new NotFoundException('재고 항목을 찾을 수 없습니다');

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.inventoryLog.findMany({
        where: { itemId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryLog.count({ where: { itemId: id } }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // ~5MB base64

@Injectable()
export class PhotoService {
  constructor(private prisma: PrismaService) {}

  async create(shopId: string, data: {
    customerId: string;
    type?: string;
    caption?: string;
    imageUrl: string;
    treatmentId?: string;
  }) {
    // Validate base64 size
    if (data.imageUrl && data.imageUrl.length > MAX_IMAGE_SIZE) {
      throw new BadRequestException('이미지 크기가 너무 큽니다 (최대 5MB)');
    }

    // Verify customer belongs to this shop
    const customer = await this.prisma.customer.findFirst({
      where: { id: data.customerId, shopId },
    });
    if (!customer) {
      throw new NotFoundException('고객을 찾을 수 없습니다');
    }

    return this.prisma.customerPhoto.create({
      data: {
        shopId,
        customerId: data.customerId,
        type: (data.type as any) || 'AFTER',
        caption: data.caption,
        imageUrl: data.imageUrl,
        treatmentId: data.treatmentId,
      },
    });
  }

  async findByCustomer(shopId: string, customerId: string, type?: string) {
    const where: any = { shopId, customerId };
    if (type) {
      where.type = type;
    }

    return this.prisma.customerPhoto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string, shopId: string) {
    const photo = await this.prisma.customerPhoto.findFirst({
      where: { id, shopId },
    });
    if (!photo) {
      throw new NotFoundException('사진을 찾을 수 없습니다');
    }

    await this.prisma.customerPhoto.delete({ where: { id } });
    return { id };
  }
}

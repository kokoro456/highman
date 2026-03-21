import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShopAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const shopId = request.params.shopId || request.body?.shopId || request.headers['x-shop-id'];

    if (!shopId) {
      throw new ForbiddenException('Shop ID is required');
    }

    if (user.role === 'ADMIN') {
      request.shopId = shopId;
      return true;
    }

    const shop = await this.prisma.shop.findFirst({
      where: { id: shopId, ownerId: user.sub },
    });

    if (!shop) {
      const staff = await this.prisma.staff.findFirst({
        where: { shopId, userId: user.sub, isActive: true },
      });
      if (!staff) {
        throw new ForbiddenException('Access denied to this shop');
      }
    }

    request.shopId = shopId;
    return true;
  }
}

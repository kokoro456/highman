import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PgService {
  private secretKey: string;
  private clientKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.secretKey = this.config.get('TOSS_SECRET_KEY', '');
    this.clientKey = this.config.get('TOSS_CLIENT_KEY', '');
  }

  getClientKey() {
    return this.clientKey;
  }

  async createOrder(
    shopId: string,
    data: {
      amount: number;
      productName: string;
      customerName?: string;
      customerPhone?: string;
    },
  ) {
    const orderId = `ORDER-${shopId.slice(0, 8)}-${Date.now()}`;

    const order = await this.prisma.onlinePayment.create({
      data: {
        shopId,
        orderId,
        amount: data.amount,
        productName: data.productName,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
      },
    });

    return {
      orderId: order.orderId,
      amount: order.amount,
      clientKey: this.clientKey,
    };
  }

  async confirmPayment(orderId: string, paymentKey: string, amount: number) {
    const order = await this.prisma.onlinePayment.findUnique({
      where: { orderId },
    });
    if (!order) {
      throw new BadRequestException('주문을 찾을 수 없습니다');
    }
    if (Number(order.amount) !== amount) {
      throw new BadRequestException('결제 금액이 일치하지 않습니다');
    }

    try {
      const response = await fetch(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        await this.prisma.onlinePayment.update({
          where: { orderId },
          data: {
            status: 'FAILED',
            failReason: result.message || '결제 승인 실패',
          },
        });
        throw new BadRequestException(
          result.message || '결제 승인에 실패했습니다',
        );
      }

      const updated = await this.prisma.onlinePayment.update({
        where: { orderId },
        data: {
          paymentKey,
          status: 'APPROVED',
          method: result.method,
          approvedAt: new Date(result.approvedAt),
        },
      });

      return updated;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('결제 처리 중 오류가 발생했습니다');
    }
  }

  async getPaymentHistory(shopId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.onlinePayment.findMany({
        where: { shopId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.onlinePayment.count({ where: { shopId } }),
    ]);
    return {
      data,
      meta: { total, page, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.onlinePayment.findUnique({
      where: { orderId },
      include: { shop: { select: { name: true } } },
    });
    if (!order) {
      throw new BadRequestException('주문을 찾을 수 없습니다');
    }
    return order;
  }
}

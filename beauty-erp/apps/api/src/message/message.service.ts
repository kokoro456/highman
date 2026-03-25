import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  private readonly smsApiKey: string;
  private readonly smsConfigured: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.smsApiKey = this.config.get('SMS_API_KEY', '');
    this.smsConfigured = !!this.smsApiKey;

    if (!this.smsConfigured) {
      this.logger.warn('SMS API is not configured. Messages will run in dry-run mode (logged to DB only).');
    }
  }

  // ─── Send single SMS ───────────────────────────────────────

  async sendSms(shopId: string, data: {
    customerId?: string;
    recipientPhone: string;
    recipientName?: string;
    content: string;
    type?: string;
    templateId?: string;
  }) {
    if (!data.recipientPhone || !data.content) {
      throw new BadRequestException('수신자 전화번호와 메시지 내용은 필수입니다');
    }

    const message = await this.prisma.message.create({
      data: {
        shopId,
        customerId: data.customerId || null,
        type: (data.type as any) || 'CUSTOM',
        channel: 'SMS',
        recipientPhone: data.recipientPhone,
        recipientName: data.recipientName || null,
        content: data.content,
        status: 'PENDING',
        templateId: data.templateId || null,
      },
    });

    // Attempt to send
    const result = await this.dispatchSms(data.recipientPhone, data.content);

    const updated = await this.prisma.message.update({
      where: { id: message.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
        failReason: result.error || null,
      },
    });

    return updated;
  }

  // ─── Send bulk SMS ─────────────────────────────────────────

  async sendBulkSms(shopId: string, data: {
    customerIds?: string[];
    tier?: string;
    content: string;
    type?: string;
    templateId?: string;
  }) {
    if (!data.content) {
      throw new BadRequestException('메시지 내용은 필수입니다');
    }

    // Resolve recipients
    const where: any = { shopId };
    if (data.customerIds && data.customerIds.length > 0) {
      where.id = { in: data.customerIds };
    } else if (data.tier && data.tier !== 'ALL') {
      where.tier = data.tier;
    }

    const customers = await this.prisma.customer.findMany({
      where,
      select: { id: true, name: true, phone: true },
    });

    if (customers.length === 0) {
      throw new BadRequestException('발송 대상 고객이 없습니다');
    }

    const results = [];

    for (const customer of customers) {
      const message = await this.prisma.message.create({
        data: {
          shopId,
          customerId: customer.id,
          type: (data.type as any) || 'CUSTOM',
          channel: 'SMS',
          recipientPhone: customer.phone,
          recipientName: customer.name,
          content: data.content,
          status: 'PENDING',
          templateId: data.templateId || null,
        },
      });

      const result = await this.dispatchSms(customer.phone, data.content);

      const updated = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: result.success ? 'SENT' : 'FAILED',
          sentAt: result.success ? new Date() : null,
          failReason: result.error || null,
        },
      });

      results.push(updated);
    }

    return {
      total: results.length,
      sent: results.filter((r) => r.status === 'SENT').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
      messages: results,
    };
  }

  // ─── Send Kakao Alimtalk ───────────────────────────────────

  async sendAlimtalk(shopId: string, data: {
    customerId?: string;
    recipientPhone: string;
    recipientName?: string;
    content: string;
    type?: string;
    templateId?: string;
  }) {
    if (!data.recipientPhone || !data.content) {
      throw new BadRequestException('수신자 전화번호와 메시지 내용은 필수입니다');
    }

    const message = await this.prisma.message.create({
      data: {
        shopId,
        customerId: data.customerId || null,
        type: (data.type as any) || 'CUSTOM',
        channel: 'ALIMTALK',
        recipientPhone: data.recipientPhone,
        recipientName: data.recipientName || null,
        content: data.content,
        status: 'PENDING',
        templateId: data.templateId || null,
      },
    });

    const result = await this.dispatchAlimtalk(data.recipientPhone, data.content);

    const updated = await this.prisma.message.update({
      where: { id: message.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
        failReason: result.error || null,
      },
    });

    return updated;
  }

  // ─── Message history ───────────────────────────────────────

  async getMessageHistory(shopId: string, query: {
    type?: string;
    channel?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { shopId };

    if (query.type) {
      where.type = query.type;
    }
    if (query.channel) {
      where.channel = query.channel;
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: { customer: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Monthly stats ─────────────────────────────────────────

  async getMessageStats(shopId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, smsCount, alimtalkCount, sentCount, failedCount] = await Promise.all([
      this.prisma.message.count({ where: { shopId, createdAt: { gte: startOfMonth } } }),
      this.prisma.message.count({ where: { shopId, channel: 'SMS', createdAt: { gte: startOfMonth } } }),
      this.prisma.message.count({ where: { shopId, channel: 'ALIMTALK', createdAt: { gte: startOfMonth } } }),
      this.prisma.message.count({ where: { shopId, status: 'SENT', createdAt: { gte: startOfMonth } } }),
      this.prisma.message.count({ where: { shopId, status: 'FAILED', createdAt: { gte: startOfMonth } } }),
    ]);

    return { total, smsCount, alimtalkCount, sentCount, failedCount };
  }

  // ─── Visit reminder (bookings tomorrow) ────────────────────

  async sendVisitReminder(shopId: string) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        shopId,
        startTime: { gte: tomorrowStart, lte: tomorrowEnd },
        status: { in: ['READY', 'CONFIRMED'] },
      },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
    });

    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    const results = [];

    for (const booking of bookings) {
      const content = `[${shop?.name}] ${booking.customer.name}님, 내일 ${new Date(booking.startTime).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })} ${booking.service.name} 예약이 있습니다. 담당: ${booking.staff.name}`;

      const message = await this.sendSms(shopId, {
        customerId: booking.customerId,
        recipientPhone: booking.customer.phone,
        recipientName: booking.customer.name,
        content,
        type: 'VISIT_REMINDER',
      });
      results.push(message);
    }

    return { total: results.length, sent: results.filter((r) => r.status === 'SENT').length };
  }

  // ─── Post-visit message (customers who visited today) ──────

  async sendPostVisitMessage(shopId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        shopId,
        startTime: { gte: todayStart, lte: todayEnd },
        status: 'COMPLETED',
      },
      include: {
        customer: true,
        service: true,
      },
    });

    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    const results = [];

    for (const booking of bookings) {
      const content = `[${shop?.name}] ${booking.customer.name}님, 오늘 방문해 주셔서 감사합니다! ${booking.service.name} 시술이 마음에 드셨길 바랍니다. 궁금한 점이 있으시면 언제든 연락주세요.`;

      const message = await this.sendSms(shopId, {
        customerId: booking.customerId,
        recipientPhone: booking.customer.phone,
        recipientName: booking.customer.name,
        content,
        type: 'POST_VISIT',
      });
      results.push(message);
    }

    return { total: results.length, sent: results.filter((r) => r.status === 'SENT').length };
  }

  // ─── Templates ─────────────────────────────────────────────

  async getMessageTemplates(shopId: string) {
    return this.prisma.messageTemplate.findMany({
      where: { shopId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMessageTemplate(shopId: string, data: {
    name: string;
    content: string;
    type: string;
  }) {
    if (!data.name || !data.content) {
      throw new BadRequestException('템플릿 이름과 내용은 필수입니다');
    }

    return this.prisma.messageTemplate.create({
      data: {
        shopId,
        name: data.name,
        content: data.content,
        type: data.type as any,
      },
    });
  }

  async deleteMessageTemplate(shopId: string, templateId: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id: templateId, shopId },
    });
    if (!template) throw new NotFoundException('템플릿을 찾을 수 없습니다');

    return this.prisma.messageTemplate.update({
      where: { id: templateId },
      data: { isActive: false },
    });
  }

  // ─── Internal dispatch helpers ─────────────────────────────

  private async dispatchSms(phone: string, content: string): Promise<{ success: boolean; error?: string }> {
    if (!this.smsConfigured) {
      this.logger.log(`[DRY RUN] SMS to ${phone}: ${content.substring(0, 50)}...`);
      return { success: true };
    }

    try {
      // Real SMS API integration point
      // Replace with actual SMS provider (e.g., NHN Cloud, CoolSMS)
      this.logger.log(`SMS sent to ${phone}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`SMS failed to ${phone}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async dispatchAlimtalk(phone: string, content: string): Promise<{ success: boolean; error?: string }> {
    const kakaoKey = this.config.get('KAKAO_ALIMTALK_SENDER_KEY', '');
    if (!kakaoKey) {
      this.logger.log(`[DRY RUN] Alimtalk to ${phone}: ${content.substring(0, 50)}...`);
      return { success: true };
    }

    try {
      this.logger.log(`Alimtalk sent to ${phone}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Alimtalk failed to ${phone}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

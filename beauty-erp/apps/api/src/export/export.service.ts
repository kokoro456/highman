import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  private escapeCsv(value: string | null | undefined): string {
    if (value == null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private toCsvRow(fields: (string | null | undefined)[]): string {
    return fields.map((f) => this.escapeCsv(f)).join(',');
  }

  private formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatDateTime(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}`;
  }

  async exportCustomers(shopId: string): Promise<string> {
    const customers = await this.prisma.customer.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });

    const header = this.toCsvRow([
      '이름', '전화번호', '이메일', '등급', '방문횟수', '총결제금액', '태그', '등록일',
    ]);

    const rows = customers.map((c) =>
      this.toCsvRow([
        c.name,
        c.phone,
        c.email,
        c.tier,
        String(c.visitCount ?? 0),
        String(Number(c.totalSpent ?? 0)),
        (c.tags as string[] ?? []).join('; '),
        this.formatDate(c.createdAt),
      ]),
    );

    return '\uFEFF' + [header, ...rows].join('\n');
  }

  async exportBookings(shopId: string, startDate?: string, endDate?: string): Promise<string> {
    const where: any = { shopId };
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: { customer: true, staff: true, service: true },
      orderBy: { startTime: 'desc' },
    });

    const header = this.toCsvRow([
      '날짜', '시간', '고객', '서비스', '담당자', '상태', '메모',
    ]);

    const statusMap: Record<string, string> = {
      CONFIRMED: '확정',
      IN_PROGRESS: '진행중',
      READY: '대기',
      COMPLETED: '완료',
      CANCELLED: '취소',
      NO_SHOW: '노쇼',
    };

    const rows = bookings.map((b) => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      const timeStr = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}~${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

      return this.toCsvRow([
        this.formatDate(b.startTime),
        timeStr,
        b.customer?.name ?? '',
        b.service?.name ?? '',
        b.staff?.name ?? '',
        statusMap[b.status] ?? b.status,
        b.memo,
      ]);
    });

    return '\uFEFF' + [header, ...rows].join('\n');
  }

  async exportPayments(shopId: string, startDate?: string, endDate?: string): Promise<string> {
    const where: any = { shopId };
    if (startDate && endDate) {
      where.paidAt = {
        gte: new Date(startDate),
        lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: { customer: true, staff: true, booking: { include: { service: true } } },
      orderBy: { paidAt: 'desc' },
    });

    const header = this.toCsvRow([
      '날짜', '고객', '서비스', '담당자', '금액', '결제방법', '메모',
    ]);

    const methodMap: Record<string, string> = {
      CARD: '카드',
      CASH: '현금',
      TRANSFER: '이체',
      PASS: '정기권',
    };

    const rows = payments.map((p) =>
      this.toCsvRow([
        this.formatDateTime(p.paidAt),
        p.customer?.name ?? '',
        p.booking?.service?.name ?? '',
        p.staff?.name ?? '',
        String(Number(p.finalAmount ?? p.amount ?? 0)),
        methodMap[p.method] ?? p.method,
        p.memo,
      ]),
    );

    return '\uFEFF' + [header, ...rows].join('\n');
  }

  async exportStaff(shopId: string): Promise<string> {
    const staffList = await this.prisma.staff.findMany({
      where: { shopId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Gather booking counts and revenue for each staff
    const staffWithStats = await Promise.all(
      staffList.map(async (staff) => {
        const [bookingCount, revenue] = await Promise.all([
          this.prisma.booking.count({
            where: { shopId, staffId: staff.id, status: 'COMPLETED' },
          }),
          this.prisma.payment.aggregate({
            where: { shopId, staffId: staff.id, status: 'COMPLETED' },
            _sum: { finalAmount: true },
          }),
        ]);

        return {
          ...staff,
          bookingCount,
          totalRevenue: Number(revenue._sum.finalAmount) || 0,
        };
      }),
    );

    const header = this.toCsvRow([
      '이름', '역할', '전화번호', '완료예약수', '총매출',
    ]);

    const roleMap: Record<string, string> = {
      DESIGNER: '디자이너',
      ASSISTANT: '어시스턴트',
      MANAGER: '매니저',
    };

    const rows = staffWithStats.map((s) =>
      this.toCsvRow([
        s.name,
        roleMap[s.role] ?? s.role,
        s.phone,
        String(s.bookingCount),
        String(s.totalRevenue),
      ]),
    );

    return '\uFEFF' + [header, ...rows].join('\n');
  }
}

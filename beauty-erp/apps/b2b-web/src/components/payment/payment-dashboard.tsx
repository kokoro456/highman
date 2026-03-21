'use client';

import {
  CreditCard,
  Money,
  Bank,
  Ticket,
  CaretLeft,
  CaretRight,
  Plus,
  Receipt,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';

const mockPayments = [
  {
    id: '1',
    customer: '정민서',
    service: '속눈썹 연장',
    staff: '박서연',
    amount: 89000,
    method: 'CARD' as const,
    time: '10:30',
  },
  {
    id: '2',
    customer: '최유진',
    service: '젤네일 풀세트',
    staff: '이하은',
    amount: 75000,
    method: 'CASH' as const,
    time: '11:00',
  },
  {
    id: '3',
    customer: '한소희',
    service: '브라질리언 왁싱',
    staff: '박서연',
    amount: 65000,
    method: 'CARD' as const,
    time: '13:00',
  },
  {
    id: '4',
    customer: '오서윤',
    service: '속눈썹 리터치',
    staff: '김도윤',
    amount: 45000,
    method: 'TRANSFER' as const,
    time: '14:00',
  },
  {
    id: '5',
    customer: '윤채원',
    service: '아트네일',
    staff: '이하은',
    amount: 95000,
    method: 'PASS' as const,
    time: '15:30',
  },
  {
    id: '6',
    customer: '김나연',
    service: '자연 속눈썹',
    staff: '박서연',
    amount: 79000,
    method: 'CARD' as const,
    time: '16:00',
  },
];

type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER' | 'PASS';

const methodConfig: Record<
  PaymentMethod,
  { label: string; bg: string; text: string; icon: typeof CreditCard }
> = {
  CARD: { label: '카드', bg: 'bg-blue-50', text: 'text-blue-700', icon: CreditCard },
  CASH: { label: '현금', bg: 'bg-brand-50', text: 'text-brand-700', icon: Money },
  TRANSFER: { label: '이체', bg: 'bg-amber-50', text: 'text-amber-700', icon: Bank },
  PASS: { label: '정기권', bg: 'bg-violet-50', text: 'text-violet-700', icon: Ticket },
};

const totalRevenue = mockPayments.reduce((sum, p) => sum + p.amount, 0);
const cardTotal = mockPayments
  .filter((p) => p.method === 'CARD')
  .reduce((sum, p) => sum + p.amount, 0);
const cashTotal = mockPayments
  .filter((p) => p.method === 'CASH')
  .reduce((sum, p) => sum + p.amount, 0);
const transferTotal = mockPayments
  .filter((p) => p.method === 'TRANSFER')
  .reduce((sum, p) => sum + p.amount, 0);

const summaryCards = [
  {
    label: '총 매출',
    value: totalRevenue,
    icon: Receipt,
    accent: 'from-zinc-800 to-zinc-900',
    iconBg: 'bg-zinc-100',
    iconColor: 'text-zinc-600',
  },
  {
    label: '카드',
    value: cardTotal,
    icon: CreditCard,
    accent: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: '현금',
    value: cashTotal,
    icon: Money,
    accent: 'from-brand-500 to-brand-600',
    iconBg: 'bg-brand-50',
    iconColor: 'text-brand-600',
  },
  {
    label: '이체',
    value: transferTotal,
    icon: Bank,
    accent: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export function PaymentDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            매출/결제
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            오늘의 매출 현황을 확인하세요
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date picker */}
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]">
              <CaretLeft size={14} className="text-zinc-600" />
            </button>
            <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200/50 shadow-soft font-mono tabular-nums">
              2026.03.21
            </span>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]">
              <CaretRight size={14} className="text-zinc-600" />
            </button>
          </div>

          {/* Add button */}
          <button className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] whitespace-nowrap">
            <Plus size={16} weight="bold" />
            결제 등록
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200/50 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    card.iconBg,
                  )}
                >
                  <Icon size={16} className={card.iconColor} />
                </div>
              </div>
              <p className="text-xl font-semibold font-mono text-zinc-900 tabular-nums tracking-tight">
                {formatCurrency(card.value)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Payment list */}
      <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_100px_120px_80px_60px] gap-4 px-6 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            고객
          </span>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            서비스
          </span>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            담당
          </span>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">
            금액
          </span>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-center">
            결제
          </span>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">
            시간
          </span>
        </div>

        {/* Rows */}
        {mockPayments.map((payment) => {
          const method = methodConfig[payment.method];
          return (
            <div
              key={payment.id}
              className="grid grid-cols-[1fr_1fr_100px_120px_80px_60px] gap-4 px-6 py-4 items-center border-b border-zinc-50 last:border-b-0 transition-colors duration-200 hover:bg-zinc-50/60"
            >
              {/* Customer */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 flex-shrink-0">
                  {payment.customer[0]}
                </div>
                <span className="text-sm font-medium text-zinc-800 truncate">
                  {payment.customer}
                </span>
              </div>

              {/* Service */}
              <span className="text-sm text-zinc-600 truncate">
                {payment.service}
              </span>

              {/* Staff */}
              <span className="text-sm text-zinc-600">
                {payment.staff}
              </span>

              {/* Amount */}
              <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums text-right">
                {formatCurrency(payment.amount)}
              </span>

              {/* Method badge */}
              <div className="flex justify-center">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                    method.bg,
                    method.text,
                  )}
                >
                  {method.label}
                </span>
              </div>

              {/* Time */}
              <span className="text-sm font-mono text-zinc-500 tabular-nums text-right">
                {payment.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

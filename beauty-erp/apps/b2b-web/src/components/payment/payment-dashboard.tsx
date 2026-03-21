'use client';

import { useState, useMemo } from 'react';
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
import { usePayments, usePaymentSummary } from '@/hooks/use-payments';
import { PaymentFormModal } from './payment-form-modal';

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

function formatDateDisplay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function PaymentDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dateString = formatDateISO(selectedDate);

  const { data: summaryData, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = usePaymentSummary(dateString);
  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = usePayments({ page: 1, startDate: dateString, endDate: dateString });

  const isLoading = summaryLoading || paymentsLoading;
  const error = summaryError || paymentsError;
  const payments = paymentsData?.data ?? [];

  const summaryCards = useMemo(() => [
    {
      label: '총 매출',
      value: Number(summaryData?.totalRevenue ?? 0),
      icon: Receipt,
      accent: 'from-zinc-800 to-zinc-900',
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-600',
    },
    {
      label: '카드',
      value: Number(summaryData?.cardRevenue ?? 0),
      icon: CreditCard,
      accent: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '현금',
      value: Number(summaryData?.cashRevenue ?? 0),
      icon: Money,
      accent: 'from-brand-500 to-brand-600',
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand-600',
    },
    {
      label: '이체',
      value: Number(summaryData?.transferRevenue ?? 0),
      icon: Bank,
      accent: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ], [summaryData]);

  const goPrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };
  const goNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">매출/결제</h1>
          <p className="mt-1 text-sm text-zinc-500">오늘의 매출 현황을 확인하세요</p>
        </div>
        <div className="animate-fade-in space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">매출/결제</h1>
        </div>
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">데이터를 불러오는데 실패했습니다</p>
          <button onClick={() => { refetchSummary(); refetchPayments(); }} className="mt-2 text-xs text-red-500 underline">다시 시도</button>
        </div>
      </div>
    );
  }

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
            <button onClick={goPrev} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]">
              <CaretLeft size={14} className="text-zinc-600" />
            </button>
            <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200/50 shadow-soft font-mono tabular-nums">
              {formatDateDisplay(selectedDate)}
            </span>
            <button onClick={goNext} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]">
              <CaretRight size={14} className="text-zinc-600" />
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] whitespace-nowrap"
          >
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
      {payments.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft p-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 mb-6">
            <CreditCard size={32} weight="regular" className="text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            결제 내역이 없습니다
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">
            선택한 날짜에 결제 내역이 없습니다
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" />
            결제 등록
          </button>
        </div>
      ) : (
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
        {payments.map((payment: any) => {
          const method = methodConfig[(payment.method as PaymentMethod)] ?? methodConfig.CARD;
          const customerName = payment.customer?.name ?? '고객';
          const serviceName = payment.booking?.service?.name ?? payment.serviceName ?? '직접 결제';
          const staffName = payment.staff?.name ?? '-';
          const amount = Number(payment.finalAmount ?? payment.amount ?? 0);
          const time = payment.paidAt ? formatTime(payment.paidAt) : '-';
          return (
            <div
              key={payment.id}
              className="grid grid-cols-[1fr_1fr_100px_120px_80px_60px] gap-4 px-6 py-4 items-center border-b border-zinc-50 last:border-b-0 transition-colors duration-200 hover:bg-zinc-50/60"
            >
              {/* Customer */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 flex-shrink-0">
                  {customerName[0]}
                </div>
                <span className="text-sm font-medium text-zinc-800 truncate">
                  {customerName}
                </span>
              </div>

              {/* Service */}
              <span className="text-sm text-zinc-600 truncate">
                {serviceName}
              </span>

              {/* Staff */}
              <span className="text-sm text-zinc-600">
                {staffName}
              </span>

              {/* Amount */}
              <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums text-right">
                {formatCurrency(amount)}
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
                {time}
              </span>
            </div>
          );
        })}
      </div>
      )}

      {/* Payment create modal */}
      <PaymentFormModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}

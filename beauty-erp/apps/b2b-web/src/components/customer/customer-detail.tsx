'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Envelope,
  CalendarDots,
  CurrencyCircleDollar,
  Star,
  NotePencil,
  Clock,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import { useCustomer } from '@/hooks/use-customers';

const tierConfig = {
  NORMAL: { label: '일반', bg: 'bg-zinc-100', text: 'text-zinc-600' },
  VIP: { label: 'VIP', bg: 'bg-brand-50', text: 'text-brand-700' },
  VVIP: { label: 'VVIP', bg: 'bg-amber-50', text: 'text-amber-700' },
};

const tagStyles: Record<string, string> = {
  VVIP: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  VIP: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200/50',
  '신규': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50',
};

function formatDateKr(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function CustomerDetail({ customerId }: { customerId: string }) {
  const { data: customer, isLoading, error, refetch } = useCustomer(customerId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft"
          >
            <ArrowLeft size={16} className="text-zinc-600" />
          </Link>
          <div className="h-8 w-32 rounded-xl bg-zinc-100 animate-pulse" />
        </div>
        <div className="animate-fade-in space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft"
          >
            <ArrowLeft size={16} className="text-zinc-600" />
          </Link>
        </div>
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">데이터를 불러오는데 실패했습니다</p>
          <button onClick={() => refetch()} className="mt-2 text-xs text-red-500 underline">다시 시도</button>
        </div>
      </div>
    );
  }

  const tier = tierConfig[(customer.tier as keyof typeof tierConfig) ?? 'NORMAL'] ?? tierConfig.NORMAL;
  const visits = customer.treatmentHistories ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link
          href="/customers"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <ArrowLeft size={16} className="text-zinc-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-base font-semibold text-zinc-700">
            {customer.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {customer.name}
              </h1>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-semibold',
                  tier.bg,
                  tier.text,
                )}
              >
                {tier.label}
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              {customer.createdAt ? formatDateKr(customer.createdAt) : ''} 등록
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Visit timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">
              시술 내역
            </h2>
            <span className="text-xs font-mono text-zinc-400 tabular-nums">
              총 {visits.length}건
            </span>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden">
            {visits.map((visit: any, idx: number) => (
              <div
                key={visit.id}
                className={cn(
                  'flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-zinc-50/60',
                  idx < visits.length - 1 && 'border-b border-zinc-50',
                )}
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center self-stretch">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-400 ring-4 ring-brand-50 flex-shrink-0" />
                  {idx < visits.length - 1 && (
                    <div className="w-px flex-1 bg-zinc-200/60 mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">
                        {visit.service?.name ?? visit.serviceName ?? '서비스'}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        담당: {visit.staff?.name ?? visit.staffName ?? '-'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-mono font-medium text-zinc-800 tabular-nums">
                        {formatCurrency(Number(visit.price ?? visit.amount ?? 0))}
                      </p>
                      <p className="mt-0.5 text-xs font-mono text-zinc-400 tabular-nums">
                        {formatDateKr(visit.treatmentDate ?? visit.date ?? visit.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Customer info card */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-800">
            고객 정보
          </h2>

          <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft p-6 space-y-5">
            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                  <Phone size={14} className="text-zinc-500" />
                </div>
                <span className="text-sm font-mono text-zinc-700 tabular-nums">
                  {customer.phone ?? '-'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                  <Envelope size={14} className="text-zinc-500" />
                </div>
                <span className="text-sm text-zinc-700">
                  {customer.email ?? '-'}
                </span>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-zinc-50/80 p-3 ring-1 ring-zinc-200/40">
                <div className="flex items-center gap-1.5 mb-1">
                  <CalendarDots size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    총 방문
                  </span>
                </div>
                <p className="text-lg font-semibold font-mono text-zinc-900 tabular-nums">
                  {customer.visitCount ?? 0}
                  <span className="text-xs font-sans text-zinc-400 ml-0.5">
                    회
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50/80 p-3 ring-1 ring-zinc-200/40">
                <div className="flex items-center gap-1.5 mb-1">
                  <CurrencyCircleDollar size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    총 결제
                  </span>
                </div>
                <p className="text-lg font-semibold font-mono text-zinc-900 tabular-nums">
                  {formatCurrency(Number(customer.totalSpent ?? 0))}
                </p>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Tags */}
            <div>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                태그
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(customer.tags ?? []).map((tag: string) => (
                  <span
                    key={tag}
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                      tagStyles[tag] || 'bg-zinc-100 text-zinc-600',
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Memo */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  메모
                </span>
                <button className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors duration-200">
                  <NotePencil size={12} className="text-zinc-400" />
                </button>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {customer.memo ?? '메모가 없습니다'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

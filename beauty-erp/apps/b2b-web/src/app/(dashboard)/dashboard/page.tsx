'use client';

import Link from 'next/link';
import { useDashboardOverview, useUpcomingBookings } from '@/hooks/use-dashboard';
import { usePayments } from '@/hooks/use-payments';
import { useAuthStore } from '@/lib/auth-store';
import { cn, formatCurrency } from '@/lib/utils';
import {
  CalendarDots,
  CreditCard,
  UserPlus,
  WarningCircle,
  ArrowRight,
  Receipt,
  Clock,
  User,
} from '@phosphor-icons/react';

const METHOD_LABEL: Record<string, string> = {
  CARD: '카드',
  CASH: '현금',
  TRANSFER: '이체',
  PASS: '정기권',
};

const METHOD_DOT: Record<string, string> = {
  CARD: 'bg-blue-400',
  CASH: 'bg-[#4ECDC4]',
  TRANSFER: 'bg-amber-400',
  PASS: 'bg-purple-400',
};

const STATUS_STYLE: Record<string, { dot: string; label: string }> = {
  CONFIRMED: { dot: 'bg-[#FF6B6B]', label: '확정' },
  IN_PROGRESS: { dot: 'bg-amber-400', label: '진행중' },
  COMPLETED: { dot: 'bg-[#4ECDC4]', label: '완료' },
  CANCELLED: { dot: 'bg-zinc-300', label: '취소' },
  NO_SHOW: { dot: 'bg-red-400', label: '노쇼' },
};

export default function DashboardPage() {
  const { shopId } = useAuthStore();
  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useDashboardOverview();
  const { data: upcomingBookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useUpcomingBookings(8);

  const todayISO = new Date().toISOString().split('T')[0];
  const { data: recentPaymentsData, isLoading: paymentsLoading } = usePayments({ page: 1, startDate: todayISO, endDate: todayISO });

  const isLoading = overviewLoading || bookingsLoading || paymentsLoading;
  const error = overviewError || bookingsError;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#FFE4E0]/50 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="h-64 rounded-2xl bg-[#FFE4E0]/50 animate-pulse" />
          <div className="h-64 rounded-2xl bg-[#FFE4E0]/50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">데이터를 불러오는데 실패했습니다</p>
          <button onClick={() => { refetchOverview(); refetchBookings(); }} className="mt-2 text-xs text-red-500 underline">다시 시도</button>
        </div>
      </div>
    );
  }

  const todayBookings = Number(overview?.todayBookings ?? 0);
  const todayNoShows = Number(overview?.todayNoShows ?? 0);
  const noShowRate = todayBookings > 0 ? ((todayNoShows / todayBookings) * 100).toFixed(1) : '0.0';

  const stats = [
    {
      label: '오늘 매출',
      value: formatCurrency(Number(overview?.todayRevenue ?? 0)),
      icon: Receipt,
      color: '#FF6B6B',
      bg: 'from-[#FF6B6B10] to-[#FFA07A10]',
    },
    {
      label: '예약 건수',
      value: `${todayBookings}건`,
      icon: CalendarDots,
      color: '#FFA07A',
      bg: 'from-[#FFA07A10] to-[#FFD93D10]',
      href: '/bookings',
    },
    {
      label: '신규 고객',
      value: `${overview?.todayNewCustomers ?? 0}명`,
      icon: UserPlus,
      color: '#E0B520',
      bg: 'from-[#FFD93D10] to-[#FFA07A10]',
    },
    {
      label: '노쇼율',
      value: `${noShowRate}%`,
      icon: WarningCircle,
      color: '#4ECDC4',
      bg: 'from-[#4ECDC410] to-[#4ECDC415]',
    },
  ];

  const upcoming = upcomingBookings ?? [];
  const recentPayments = (recentPaymentsData?.data ?? []).slice(0, 6);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats - compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const Wrapper = stat.href ? Link : 'div';
          const wrapperProps = stat.href ? { href: stat.href } : {};
          return (
            <Wrapper
              key={stat.label}
              {...(wrapperProps as any)}
              className={cn(
                'rounded-2xl bg-gradient-to-br p-4 ring-1 ring-[#FFE4E0]/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                stat.bg
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} style={{ color: stat.color }} />
                <span className="text-[11px] font-medium text-zinc-500">{stat.label}</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 font-mono tabular-nums">
                {stat.value}
              </span>
            </Wrapper>
          );
        })}
      </div>

      {/* Two column: Today Bookings + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 오늘의 예약 미리보기 */}
        <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0]/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#FFE4E0]/40">
            <div className="flex items-center gap-2">
              <CalendarDots size={16} className="text-[#FF6B6B]" />
              <h2 className="text-sm font-semibold text-zinc-800">오늘의 예약</h2>
              <span className="text-[10px] font-mono font-bold text-[#FF6B6B] bg-[#FF6B6B10] rounded-full px-2 py-0.5">{todayBookings}</span>
            </div>
            <Link href="/bookings" className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-[#FF6B6B] transition-colors">
              전체 보기 <ArrowRight size={10} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-50 max-h-[260px] overflow-y-auto">
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDots size={28} className="text-zinc-300 mb-2" />
                <p className="text-sm text-zinc-400">예정된 예약이 없습니다</p>
              </div>
            ) : (
              upcoming.map((booking: any) => {
                const startTime = new Date(booking.startTime);
                const timeStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
                const status = STATUS_STYLE[booking.status] ?? STATUS_STYLE.CONFIRMED;
                return (
                  <div key={booking.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF8F6] transition-colors">
                    <span className="text-xs font-mono font-medium text-zinc-500 tabular-nums w-10 flex-shrink-0">{timeStr}</span>
                    <div className={cn('w-1 h-8 rounded-full flex-shrink-0', status.dot)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-800 truncate">
                        {booking.customer?.name ?? '고객'}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {booking.service?.name ?? '서비스'} · {booking.staff?.name ?? '-'}
                      </p>
                    </div>
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                      booking.status === 'COMPLETED' ? 'bg-[#4ECDC415] text-[#20877F]' :
                      booking.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' :
                      booking.status === 'CANCELLED' ? 'bg-zinc-100 text-zinc-400' :
                      'bg-[#FF6B6B10] text-[#FF6B6B]'
                    )}>
                      {status.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 최근 결제 미리보기 */}
        <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0]/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#FFE4E0]/40">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-[#FFA07A]" />
              <h2 className="text-sm font-semibold text-zinc-800">최근 결제</h2>
              <span className="text-[10px] font-mono font-bold text-[#FFA07A] bg-[#FFA07A10] rounded-full px-2 py-0.5">{recentPayments.length}</span>
            </div>
            <Link href="/payments" className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-[#FF6B6B] transition-colors">
              전체 보기 <ArrowRight size={10} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-50 max-h-[260px] overflow-y-auto">
            {recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CreditCard size={28} className="text-zinc-300 mb-2" />
                <p className="text-sm text-zinc-400">오늘 결제 내역이 없습니다</p>
              </div>
            ) : (
              recentPayments.map((payment: any) => {
                const customerName = payment.customer?.name ?? '고객';
                const amount = Number(payment.finalAmount ?? payment.amount ?? 0);
                const method = payment.paymentMethod ?? 'CARD';
                const time = payment.paidAt
                  ? `${String(new Date(payment.paidAt).getHours()).padStart(2, '0')}:${String(new Date(payment.paidAt).getMinutes()).padStart(2, '0')}`
                  : '-';
                return (
                  <div key={payment.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF8F6] transition-colors">
                    <span className="text-xs font-mono font-medium text-zinc-500 tabular-nums w-10 flex-shrink-0">{time}</span>
                    <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', METHOD_DOT[method] ?? 'bg-zinc-300')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-800 truncate">{customerName}</p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {payment.booking?.service?.name ?? '직접 결제'} · {METHOD_LABEL[method] ?? method}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-semibold text-zinc-900 tabular-nums flex-shrink-0">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

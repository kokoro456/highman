'use client';

import Link from 'next/link';
import { useDashboardOverview, useUpcomingBookings } from '@/hooks/use-dashboard';
import { usePayments } from '@/hooks/use-payments';
import { useShop } from '@/hooks/use-shop';
import { useAuthStore } from '@/lib/auth-store';
import { formatCurrency } from '@/lib/utils';
import {
  CalendarDots,
  CreditCard,
  UserPlus,
  WarningCircle,
  ArrowRight,
  Receipt,
  Link as LinkIcon,
  CheckCircle,
} from '@phosphor-icons/react';

export default function DashboardPage() {
  const { shopId } = useAuthStore();
  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useDashboardOverview();
  const { data: upcomingBookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useUpcomingBookings(5);
  const { data: shopData } = useShop(shopId ?? '');

  const todayISO = new Date().toISOString().split('T')[0];
  const { data: recentPaymentsData, isLoading: paymentsLoading } = usePayments({ page: 1, startDate: todayISO, endDate: todayISO });

  const isLoading = overviewLoading || bookingsLoading || paymentsLoading;
  const error = overviewError || bookingsError;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">매장 운영 현황을 한눈에 확인하세요</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-zinc-100 animate-pulse" />
          <div className="h-72 rounded-2xl bg-zinc-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        </div>
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
      unit: '',
      sub: overview?.weekRevenue ? `이번 주 ${formatCurrency(Number(overview.weekRevenue))}` : '',
      icon: Receipt,
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-600',
    },
    {
      label: '예약 건수',
      value: String(todayBookings),
      unit: '건',
      sub: '',
      icon: CalendarDots,
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand-600',
      href: '/bookings',
    },
    {
      label: '신규 고객',
      value: String(overview?.todayNewCustomers ?? 0),
      unit: '명',
      sub: '',
      icon: UserPlus,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '노쇼율',
      value: `${noShowRate}`,
      unit: '%',
      sub: `${todayNoShows}건 / ${todayBookings}건`,
      icon: WarningCircle,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const upcoming = upcomingBookings ?? [];
  const recentPayments = (recentPaymentsData?.data ?? []).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          매장 운영 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Stats Grid - Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const Wrapper = stat.href ? Link : 'div';
          const wrapperProps = stat.href ? { href: stat.href } : {};
          return (
            <Wrapper
              key={stat.label}
              {...(wrapperProps as any)}
              className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
                  <Icon size={16} className={stat.iconColor} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight text-zinc-900 font-mono">
                  {stat.value}
                </span>
                {stat.unit && <span className="text-sm text-zinc-400">{stat.unit}</span>}
              </div>
              {stat.sub && (
                <p className="mt-2 text-xs text-zinc-400">
                  {stat.sub}
                </p>
              )}
            </Wrapper>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 오늘의 예약 */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-4 md:p-6 ring-1 ring-zinc-200/50 shadow-soft min-h-[200px] md:min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-700">오늘의 예약</h2>
            <Link
              href="/bookings"
              className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors duration-200"
            >
              전체 보기
              <ArrowRight size={12} />
            </Link>
          </div>
          {todayBookings === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-4">
                <CalendarDots size={28} weight="regular" className="text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600">오늘 예약이 없습니다</p>
              <p className="mt-1 text-xs text-zinc-400">예약을 등록해보세요</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl font-semibold font-mono text-zinc-900 tabular-nums">{todayBookings}</span>
              <p className="mt-2 text-sm text-zinc-500">건의 예약이 있습니다</p>
              <Link
                href="/bookings"
                className="mt-4 flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98]"
              >
                <CalendarDots size={16} weight="bold" />
                예약 확인하기
              </Link>
            </div>
          )}
        </div>

        {/* 다가오는 예약 */}
        <div className="rounded-2xl bg-white p-4 md:p-6 ring-1 ring-zinc-200/50 shadow-soft min-h-[200px] md:min-h-[300px]">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">다가오는 예약</h2>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 mb-3">
                <CalendarDots size={24} weight="regular" className="text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-400">예정된 예약이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {upcoming.map((booking: any) => {
                const startTime = new Date(booking.startTime);
                const timeStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
                return (
                  <div key={booking.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-b-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">
                        {booking.customer?.name ?? '고객'}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {booking.service?.name ?? '서비스'} · {booking.staff?.name ?? '-'}
                      </p>
                    </div>
                    <span className="text-sm font-mono text-zinc-500 tabular-nums flex-shrink-0 ml-3">
                      {timeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 최근 결제 */}
      <div className="rounded-2xl bg-white p-4 md:p-6 ring-1 ring-zinc-200/50 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-700">최근 결제</h2>
          <Link
            href="/payments"
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors duration-200"
          >
            전체 보기
            <ArrowRight size={12} />
          </Link>
        </div>
        {recentPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 mb-3">
              <CreditCard size={24} weight="regular" className="text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400">오늘 결제 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPayments.map((payment: any) => {
              const customerName = payment.customer?.name ?? '고객';
              const amount = Number(payment.finalAmount ?? payment.amount ?? 0);
              const time = payment.paidAt
                ? `${String(new Date(payment.paidAt).getHours()).padStart(2, '0')}:${String(new Date(payment.paidAt).getMinutes()).padStart(2, '0')}`
                : '-';
              return (
                <div key={payment.id} className="flex items-center justify-between py-2.5 border-b border-zinc-50 last:border-b-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 flex-shrink-0">
                      {customerName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">{customerName}</p>
                      <p className="text-xs text-zinc-500">{payment.booking?.service?.name ?? payment.serviceName ?? '직접 결제'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                    <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">
                      {formatCurrency(amount)}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 tabular-nums">
                      {time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* External integration status */}
      <div className="rounded-2xl bg-white p-4 md:p-6 ring-1 ring-zinc-200/50 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
              <LinkIcon size={14} className="text-zinc-600" />
            </div>
            <h2 className="text-sm font-medium text-zinc-700">외부 연동</h2>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors duration-200"
          >
            설정에서 연동하기
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {shopData?.naverBookingUrl ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200/60">
              <CheckCircle size={14} weight="fill" className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">네이버 예약</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1.5 ring-1 ring-zinc-200/60">
              <span className="text-xs text-zinc-400">네이버 예약 - 미연동</span>
            </div>
          )}
          {shopData?.kakaoChannelUrl ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200/60">
              <CheckCircle size={14} weight="fill" className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">카카오톡</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1.5 ring-1 ring-zinc-200/60">
              <span className="text-xs text-zinc-400">카카오톡 - 미연동</span>
            </div>
          )}
          {shopData?.instagramUrl ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200/60">
              <CheckCircle size={14} weight="fill" className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">인스타그램</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1.5 ring-1 ring-zinc-200/60">
              <span className="text-xs text-zinc-400">인스타그램 - 미연동</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useDashboardOverview, useUpcomingBookings } from '@/hooks/use-dashboard';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useDashboardOverview();
  const { data: upcomingBookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useUpcomingBookings(5);

  const isLoading = overviewLoading || bookingsLoading;
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

  const stats = [
    { label: '오늘 매출', value: formatCurrency(Number(overview?.todayRevenue ?? 0)), unit: '', change: '' },
    { label: '예약 건수', value: String(overview?.todayBookings ?? 0), unit: '건', change: '' },
    { label: '신규 고객', value: String(overview?.todayNewCustomers ?? 0), unit: '명', change: '' },
    { label: '노쇼율', value: String(overview?.todayNoShows ?? 0), unit: '건', change: '' },
  ];

  const upcoming = upcomingBookings ?? [];

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
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5"
          >
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight text-zinc-900 font-mono">
                {stat.value}
              </span>
              {stat.unit && <span className="text-sm text-zinc-400">{stat.unit}</span>}
            </div>
            {stat.change && (
              <p className="mt-2 text-xs font-medium text-brand-600">
                {stat.change} vs yesterday
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft min-h-[300px]">
          <h2 className="text-sm font-medium text-zinc-700">오늘의 예약</h2>
          <p className="mt-4 text-sm text-zinc-400">예약 캘린더가 여기에 표시됩니다</p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft min-h-[300px]">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">다가오는 예약</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-zinc-400">예정된 예약이 없습니다</p>
          ) : (
            <div className="space-y-3">
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
    </div>
  );
}

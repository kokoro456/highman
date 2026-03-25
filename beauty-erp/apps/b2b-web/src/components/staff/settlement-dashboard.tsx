'use client';

import { useState, useMemo } from 'react';
import {
  CaretLeft,
  CaretRight,
  Wallet,
  ChartBar,
  TrendUp,
  UserCircle,
  X,
  Briefcase,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  useSettlement,
  useStaffSettlement,
  type StaffSettlement,
} from '@/hooks/use-settlement';

const roleLabels: Record<string, string> = {
  OWNER: '대표',
  MANAGER: '매니저',
  DESIGNER: '디자이너',
  ASSISTANT: '어시스턴트',
  INTERN: '인턴',
};

function formatMonth(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

function formatMonthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function SettlementDashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedStaff, setSelectedStaff] = useState<StaffSettlement | null>(null);

  const monthParam = formatMonthParam(year, month);
  const { data: settlements, isLoading, error, refetch } = useSettlement(monthParam);

  const goPrev = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else { setMonth(month - 1); }
  };
  const goNext = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else { setMonth(month + 1); }
  };

  const summary = useMemo(() => {
    if (!settlements || settlements.length === 0) {
      return { totalPayroll: 0, totalRevenue: 0, avgIncentiveRate: 0 };
    }
    const totalPayroll = settlements.reduce((s, v) => s + v.totalPay, 0);
    const totalRevenue = settlements.reduce((s, v) => s + v.totalRevenue, 0);
    const avgIncentiveRate = totalRevenue > 0
      ? Math.round((totalPayroll / totalRevenue) * 100 * 10) / 10
      : 0;
    return { totalPayroll, totalRevenue, avgIncentiveRate };
  }, [settlements]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">정산 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">직원별 급여 및 인센티브를 확인하세요</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-[#FFE4E0] animate-pulse" />
            ))}
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#FFE4E0] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">정산 관리</h1>
        </div>
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">데이터를 불러오는데 실패했습니다</p>
          <button onClick={() => refetch()} className="mt-2 text-xs text-red-500 underline">다시 시도</button>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: '총 급여',
      value: formatCurrency(summary.totalPayroll),
      icon: Wallet,
      iconBg: 'bg-[#FF6B6B15]',
      iconColor: 'text-[#FF6B6B]',
    },
    {
      label: '총 매출',
      value: formatCurrency(summary.totalRevenue),
      icon: ChartBar,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '평균 인센티브율',
      value: `${summary.avgIncentiveRate}%`,
      icon: TrendUp,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">정산 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">직원별 급여 및 인센티브를 확인하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CaretLeft size={14} className="text-zinc-600" />
          </button>
          <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-[#FFE4E0] shadow-soft min-w-[120px] text-center">
            {formatMonth(year, month)}
          </span>
          <button
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CaretRight size={14} className="text-zinc-600" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl bg-white p-5 ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', card.iconBg)}>
                  <Icon size={16} className={card.iconColor} />
                </div>
              </div>
              <p className="text-xl font-semibold font-mono text-zinc-900 tabular-nums tracking-tight">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Staff settlement table */}
      {!settlements || settlements.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6B6B10] mb-6">
            <Wallet size={32} weight="regular" className="text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            정산 데이터가 없습니다
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">
            해당 월에 완료된 예약이 없거나 직원이 등록되지 않았습니다
          </p>
        </div>
      ) : (
        <>
          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {settlements.map((s) => (
              <button
                key={s.staffId}
                onClick={() => setSelectedStaff(s)}
                className="w-full text-left rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-4 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 flex-shrink-0">
                      {s.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">{s.name}</p>
                      <p className="text-xs text-zinc-500">{roleLabels[s.role] || s.role}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FF6B6B15] px-2.5 py-0.5 text-[10px] font-medium text-[#FF6B6B] flex-shrink-0">
                    {s.totalBookings}건
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-zinc-400">매출</p>
                    <p className="text-xs font-mono font-medium text-zinc-700 tabular-nums">{formatCurrency(s.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">인센티브</p>
                    <p className="text-xs font-mono font-medium text-zinc-700 tabular-nums">{formatCurrency(s.incentiveAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">총 급여</p>
                    <p className="text-xs font-mono font-semibold text-zinc-900 tabular-nums">{formatCurrency(s.totalPay)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden md:block rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_80px_120px_120px_120px] gap-4 px-6 py-3.5 border-b border-[#FFE4E0] bg-[#FFF8F6]">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">이름</span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-center">직급</span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">예약</span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">매출</span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">인센티브</span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">총 급여</span>
            </div>
            {settlements.map((s) => (
              <button
                key={s.staffId}
                onClick={() => setSelectedStaff(s)}
                className="w-full grid grid-cols-[1fr_100px_80px_120px_120px_120px] gap-4 px-6 py-4 items-center border-b border-zinc-50 last:border-b-0 transition-colors duration-200 hover:bg-[#FFF5F5] text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 flex-shrink-0">
                    {s.name[0]}
                  </div>
                  <span className="text-sm font-medium text-zinc-800 truncate">{s.name}</span>
                </div>
                <span className="text-sm text-zinc-600 text-center">{roleLabels[s.role] || s.role}</span>
                <span className="text-sm font-mono text-zinc-600 tabular-nums text-right">{s.totalBookings}건</span>
                <span className="text-sm font-mono text-zinc-700 tabular-nums text-right">{formatCurrency(s.totalRevenue)}</span>
                <span className="text-sm font-mono text-zinc-700 tabular-nums text-right">{formatCurrency(s.incentiveAmount)}</span>
                <span className="text-sm font-mono font-semibold text-zinc-900 tabular-nums text-right">{formatCurrency(s.totalPay)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Staff detail modal */}
      {selectedStaff && (
        <StaffSettlementModal
          staffId={selectedStaff.staffId}
          staffName={selectedStaff.name}
          month={monthParam}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
}

function StaffSettlementModal({
  staffId,
  staffName,
  month,
  onClose,
}: {
  staffId: string;
  staffName: string;
  month: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useStaffSettlement(staffId, month);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#2D3436]/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl ring-1 ring-[#FFE4E0] shadow-xl animate-fade-in">
        {/* Modal header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#FFE4E0] rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{staffName}</h2>
            <p className="text-xs text-zinc-500">정산 상세</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X size={18} className="text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-[#FFE4E0] animate-pulse" />
              ))}
            </div>
          ) : data ? (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#FFF8F6] p-4 ring-1 ring-[#FFE4E0]">
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">총 매출</p>
                  <p className="text-lg font-mono font-semibold text-zinc-900 tabular-nums">{formatCurrency(data.totalRevenue)}</p>
                </div>
                <div className="rounded-xl bg-[#FF6B6B15] p-4 ring-1 ring-[#FF6B6B30]/40">
                  <p className="text-[10px] font-medium text-[#FF6B6B] uppercase tracking-wider mb-1">총 급여</p>
                  <p className="text-lg font-mono font-semibold text-[#FF6B6B] tabular-nums">{formatCurrency(data.totalPay)}</p>
                </div>
              </div>

              {/* Incentive breakdown */}
              {data.incentiveBreakdown.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Briefcase size={14} className="text-zinc-400" />
                    인센티브 내역
                  </h3>
                  <div className="space-y-2">
                    {data.incentiveBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl bg-[#FFF8F6] px-4 py-3 ring-1 ring-[#FFE4E0]">
                        <div>
                          <p className="text-sm text-zinc-700">
                            {item.type === 'FIXED' ? '고정' : '비율'}
                            {item.serviceName ? ` - ${item.serviceName}` : ' - 전체'}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {item.type === 'FIXED' ? formatCurrency(item.rate) : `${item.rate}%`}
                          </p>
                        </div>
                        <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service breakdown */}
              {data.serviceBreakdown.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <UserCircle size={14} className="text-zinc-400" />
                    서비스별 매출
                  </h3>
                  <div className="space-y-2">
                    {data.serviceBreakdown.map((svc) => (
                      <div key={svc.serviceId} className="flex items-center justify-between rounded-xl bg-[#FFF8F6] px-4 py-3 ring-1 ring-[#FFE4E0]">
                        <div>
                          <p className="text-sm text-zinc-700">{svc.serviceName}</p>
                          <p className="text-xs text-zinc-400">{svc.bookingCount}건</p>
                        </div>
                        <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">
                          {formatCurrency(svc.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily revenue chart */}
              {data.dailyRevenue.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ChartBar size={14} className="text-zinc-400" />
                    일별 매출
                  </h3>
                  <DailyRevenueChart data={data.dailyRevenue} />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-8">데이터를 불러올 수 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DailyRevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="rounded-xl bg-[#FFF8F6] p-4 ring-1 ring-[#FFE4E0]">
      <div className="flex items-end gap-[2px] h-32">
        {data.map((d) => {
          const heightPct = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
          const day = parseInt(d.date.split('-')[2], 10);
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              <div
                className={cn(
                  'w-full rounded-t-sm transition-all duration-300',
                  d.revenue > 0
                    ? 'bg-[#FF8080] group-hover:bg-[#FF6B6B]'
                    : 'bg-zinc-200',
                )}
                style={{ height: `${Math.max(heightPct, 2)}%`, minHeight: '2px' }}
              />
              {/* Tooltip */}
              {d.revenue > 0 && (
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="rounded-lg bg-zinc-800 px-2 py-1 text-[10px] text-white whitespace-nowrap shadow-lg">
                    {day}일: {formatCurrency(d.revenue)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-zinc-400">1일</span>
        <span className="text-[10px] text-zinc-400">{data.length}일</span>
      </div>
    </div>
  );
}

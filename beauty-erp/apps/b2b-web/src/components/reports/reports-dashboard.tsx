'use client';

import { useState, useMemo } from 'react';
import {
  ChartLine,
  Scissors,
  UsersThree,
  Clock,
  CaretLeft,
  CaretRight,
  TrendUp,
  TrendDown,
  Crown,
  User,
  UserPlus,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  useRevenueReport,
  useComprehensiveReport,
  useServiceReport,
  useCustomerReport,
  useHourlyReport,
} from '@/hooks/use-reports';

// ==================== TYPES ====================

interface ServiceBreakdown {
  serviceId: string;
  serviceName: string;
  amount: number;
}

interface RevenueDay {
  date: string;
  revenue: number;
  bookingCount: number;
  serviceBreakdown: ServiceBreakdown[];
}

interface RevenueReportData {
  days: RevenueDay[];
  serviceNames: string[];
}

interface ServiceRank {
  serviceId: string;
  serviceName: string;
  categoryName: string;
  bookingCount: number;
  revenue: number;
  percentage: number;
}

interface CustomerData {
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  averageSpend: number;
  topCustomers: {
    customerId: string;
    customerName: string;
    phone: string;
    visitCount: number;
    totalSpent: number;
  }[];
}

interface HourlyData {
  hour: number;
  bookingCount: number;
}

// ==================== TABS ====================

type TabKey = 'revenue' | 'services' | 'customers' | 'hourly';

const tabs: { key: TabKey; label: string; icon: typeof ChartLine }[] = [
  { key: 'revenue', label: '매출 분석', icon: ChartLine },
  { key: 'services', label: '서비스 분석', icon: Scissors },
  { key: 'customers', label: '고객 분석', icon: UsersThree },
  { key: 'hourly', label: '시간대 분석', icon: Clock },
];

// ==================== HELPERS ====================

function getMonthDateRange(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ==================== MAIN COMPONENT ====================

export function ReportsDashboard() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<TabKey>('revenue');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { startDate, endDate } = useMemo(
    () => getMonthDateRange(year, month),
    [year, month],
  );

  const goPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            보고서
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            매장 운영 데이터를 분석하세요
          </p>
        </div>

        {/* Month picker */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CaretLeft size={14} className="text-zinc-600" />
          </button>
          <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-[#FFE4E0] shadow-soft font-mono tabular-nums min-w-[120px] text-center">
            {year}년 {month}월
          </span>
          <button
            onClick={goNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CaretRight size={14} className="text-zinc-600" />
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-2xl bg-zinc-100/80 p-1 ring-1 ring-[#FFE4E0] overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap',
                'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                isActive
                  ? 'bg-white text-zinc-900 shadow-soft ring-1 ring-[#FFE4E0]'
                  : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'revenue' && (
        <RevenueTab year={year} month={month} startDate={startDate} endDate={endDate} />
      )}
      {activeTab === 'services' && (
        <ServicesTab startDate={startDate} endDate={endDate} />
      )}
      {activeTab === 'customers' && (
        <CustomersTab startDate={startDate} endDate={endDate} />
      )}
      {activeTab === 'hourly' && (
        <HourlyTab startDate={startDate} endDate={endDate} />
      )}
    </div>
  );
}

// ==================== CHART COLORS ====================

const SERVICE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F0B27A', '#82E0AA', '#F1948A', '#AED6F1', '#D7BDE2',
];

function getServiceColor(index: number): string {
  return SERVICE_COLORS[index % SERVICE_COLORS.length];
}

// ==================== COMPREHENSIVE REPORT TYPES ====================

interface ComprehensiveReport {
  revenue: { total: number; byTreatment: number; byPass: number; revenuePerCustomer: number };
  bookings: { total: number; completed: number; noShow: number; cancelled: number; noShowRate: number; cancelRate: number };
  timeUtilization: { totalAvailableHours: number; bookedHours: number; utilizationRate: number };
  customers: { totalVisited: number; newCustomers: number; returningCustomers: number; returnRate: number };
  dailyRevenue: { date: string; revenue: number }[];
  dailyBookings: { date: string; total: number; noShow: number; cancelled: number }[];
  dailyUtilization: { date: string; rate: number }[];
  dailyCustomers: { date: string; new: number; returning: number }[];
  revenueByStaff: { staffId: string; staffName: string; revenue: number }[];
  comparison: { revenueDiff: number; bookingsDiff: number; utilizationDiff: number; returnRateDiff: number; revenuePerCustomerDiff: number };
}

// ==================== CHANGE BADGE ====================

function ChangeBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums',
        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
      )}
    >
      {isPositive ? (
        <TrendUp size={12} weight="bold" />
      ) : (
        <TrendDown size={12} weight="bold" />
      )}
      {isPositive ? '+' : ''}{value}%
    </span>
  );
}

// ==================== REVENUE TAB (COMPREHENSIVE) ====================

function RevenueTab({ year, month, startDate, endDate }: { year: number; month: number; startDate: string; endDate: string }) {
  const { data, isLoading, error } = useComprehensiveReport(startDate, endDate);

  if (isLoading) return <TabSkeleton />;
  if (error) return <TabError />;

  const report: ComprehensiveReport | null = data ?? null;
  if (!report) return <TabError />;

  const { revenue, bookings, timeUtilization, customers, comparison, dailyRevenue, dailyBookings, dailyUtilization, dailyCustomers, revenueByStaff } = report;

  const maxDailyRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 1);
  const maxDailyBookings = Math.max(...dailyBookings.map((d) => d.total), 1);
  const maxDailyUtil = Math.max(...dailyUtilization.map((d) => d.rate), 1);
  const maxDailyCustomers = Math.max(...dailyCustomers.map((d) => d.new + d.returning), 1);
  const maxStaffRevenue = Math.max(...revenueByStaff.map((s) => s.revenue), 1);
  const emptyHours = Math.max(0, Math.round((timeUtilization.totalAvailableHours - timeUtilization.bookedHours) * 10) / 10);

  return (
    <div className="space-y-6">
      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="실 매출 합계"
          value={formatCurrency(revenue.total)}
          badge={<ChangeBadge value={comparison.revenueDiff} />}
          icon={<TrendUp size={18} className="text-[#FF6B6B]" />}
          iconBg="bg-[#FF6B6B15]"
        />
        <MetricCard
          label="객단가"
          value={formatCurrency(revenue.revenuePerCustomer)}
          badge={<ChangeBadge value={comparison.revenuePerCustomerDiff} />}
          icon={<User size={18} className="text-violet-600" />}
          iconBg="bg-violet-50"
        />
        <MetricCard
          label="총 예약 건수"
          value={`${bookings.total}건`}
          badge={<ChangeBadge value={comparison.bookingsDiff} />}
          icon={<ChartLine size={18} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <MetricCard
          label="재방문 고객 비율"
          value={`${customers.returnRate}%`}
          badge={<ChangeBadge value={comparison.returnRateDiff} />}
          icon={<ArrowClockwise size={18} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Row 2: Daily Revenue Chart (full width) */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">일별 매출 추이</h3>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-[3px]" style={{ height: '180px', minWidth: `${dailyRevenue.length * 28}px` }}>
            {dailyRevenue.map((d) => {
              const barH = maxDailyRevenue > 0 ? (d.revenue / maxDailyRevenue) * 160 : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative" style={{ height: '100%' }}>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-lg bg-zinc-800 px-2.5 py-1.5 text-[10px] text-white whitespace-nowrap z-20 shadow-lg">
                    {formatShortDate(d.date)}: {formatCurrency(d.revenue)}
                  </div>
                  <div
                    className="w-full max-w-[20px] rounded-t-md bg-[#FF6B6B] transition-all duration-500 group-hover:bg-[#FF5252]"
                    style={{ height: `${Math.max(barH, d.revenue > 0 ? 4 : 0)}px` }}
                  />
                  <span className="text-[8px] text-zinc-400 font-mono tabular-nums mt-1">
                    {new Date(d.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Booking Stats */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">예약 현황</h3>
          <div className="text-2xl font-semibold font-mono text-zinc-900 tabular-nums mb-1">
            {bookings.total}건
          </div>
          <div className="flex items-center gap-2 mb-5">
            <ChangeBadge value={comparison.bookingsDiff} />
            <span className="text-xs text-zinc-400">전 기간 대비</span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">완료</span>
              <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">{bookings.completed}건</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">노쇼</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">{bookings.noShow}건</span>
                <span className="text-[11px] text-red-500 tabular-nums">({bookings.noShowRate}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">취소</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">{bookings.cancelled}건</span>
                <span className="text-[11px] text-zinc-400 tabular-nums">({bookings.cancelRate}%)</span>
              </div>
            </div>
          </div>

          {/* Daily bookings stacked bar chart */}
          <div className="overflow-x-auto">
            <div className="flex items-end gap-[2px]" style={{ height: '100px', minWidth: `${dailyBookings.length * 20}px` }}>
              {dailyBookings.map((d) => {
                const totalH = maxDailyBookings > 0 ? (d.total / maxDailyBookings) * 80 : 0;
                const noShowH = d.total > 0 ? (d.noShow / d.total) * totalH : 0;
                const cancelH = d.total > 0 ? (d.cancelled / d.total) * totalH : 0;
                const completedH = totalH - noShowH - cancelH;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end group" style={{ height: '100%' }}>
                    <div className="w-full max-w-[14px] rounded-t-sm overflow-hidden" style={{ height: `${Math.max(totalH, d.total > 0 ? 3 : 0)}px` }}>
                      {completedH > 0 && <div className="bg-blue-400" style={{ height: `${completedH}px` }} />}
                      {cancelH > 0 && <div className="bg-zinc-300" style={{ height: `${cancelH}px` }} />}
                      {noShowH > 0 && <div className="bg-red-400" style={{ height: `${noShowH}px` }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-400" /><span className="text-[10px] text-zinc-400">완료</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-zinc-300" /><span className="text-[10px] text-zinc-400">취소</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-400" /><span className="text-[10px] text-zinc-400">노쇼</span></div>
          </div>
        </div>

        {/* Right: Time Utilization */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">시간 활용 비율</h3>

          {/* Utilization gauge */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#FFE4E0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#FF6B6B" strokeWidth="10"
                  strokeDasharray={`${(timeUtilization.utilizationRate / 100) * 327} 327`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-zinc-900 tabular-nums">
                  {timeUtilization.utilizationRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center mb-5">
            <ChangeBadge value={comparison.utilizationDiff} />
            <span className="text-xs text-zinc-400">전 기간 대비</span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">총 가능시간</span>
              <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">{timeUtilization.totalAvailableHours}시간</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">예약시간</span>
              <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">{timeUtilization.bookedHours}시간</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">빈 시간</span>
              <span className="text-sm font-mono font-medium text-zinc-400 tabular-nums">{emptyHours}시간</span>
            </div>
          </div>

          {/* Daily utilization line chart */}
          <div className="overflow-x-auto">
            <div className="relative" style={{ height: '80px', minWidth: `${dailyUtilization.length * 20}px` }}>
              <svg width="100%" height="80" viewBox={`0 0 ${dailyUtilization.length * 20} 80`} preserveAspectRatio="none">
                <polyline
                  points={dailyUtilization.map((d, i) => {
                    const x = (i / Math.max(dailyUtilization.length - 1, 1)) * (dailyUtilization.length * 20 - 10) + 5;
                    const y = 75 - (maxDailyUtil > 0 ? (d.rate / maxDailyUtil) * 65 : 0);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Customer return rate */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">재방문 고객 비율</h3>
          <div className="text-2xl font-semibold font-mono text-zinc-900 tabular-nums mb-1">
            {customers.returnRate}%
          </div>
          <div className="flex items-center gap-2 mb-5">
            <ChangeBadge value={comparison.returnRateDiff} />
            <span className="text-xs text-zinc-400">전 기간 대비</span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                <span className="text-sm text-zinc-600">재방문</span>
              </div>
              <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">{customers.returningCustomers}명</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#FF8080]" />
                <span className="text-sm text-zinc-600">신규</span>
              </div>
              <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">{customers.newCustomers}명</span>
            </div>
          </div>

          {/* Ratio bar */}
          {customers.totalVisited > 0 && (
            <div className="h-4 rounded-full bg-zinc-100 overflow-hidden flex mb-4">
              <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${customers.returnRate}%` }} />
              <div className="h-full bg-[#FF8080] transition-all duration-700" style={{ width: `${100 - customers.returnRate}%` }} />
            </div>
          )}

          {/* Daily customer chart */}
          <div className="overflow-x-auto">
            <div className="flex items-end gap-[2px]" style={{ height: '80px', minWidth: `${dailyCustomers.length * 20}px` }}>
              {dailyCustomers.map((d) => {
                const total = d.new + d.returning;
                const totalH = maxDailyCustomers > 0 ? (total / maxDailyCustomers) * 65 : 0;
                const retH = total > 0 ? (d.returning / total) * totalH : 0;
                const newH = totalH - retH;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                    <div className="w-full max-w-[14px] rounded-t-sm overflow-hidden" style={{ height: `${Math.max(totalH, total > 0 ? 3 : 0)}px` }}>
                      {retH > 0 && <div className="bg-blue-400" style={{ height: `${retH}px` }} />}
                      {newH > 0 && <div className="bg-[#FF8080]" style={{ height: `${newH}px` }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Staff Revenue Ranking */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">직원별 매출</h3>
          {revenueByStaff.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">데이터가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {revenueByStaff.map((staff, i) => {
                const barWidth = maxStaffRevenue > 0 ? (staff.revenue / maxStaffRevenue) * 100 : 0;
                return (
                  <div key={staff.staffId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-600">
                          {i + 1}
                        </span>
                        <span className="text-sm text-zinc-700">{staff.staffName}</span>
                      </div>
                      <span className="text-sm font-mono font-medium text-zinc-900 tabular-nums">
                        {formatCurrency(staff.revenue)}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF6B6B] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
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

// ==================== METRIC CARD (with badge) ====================

function MetricCard({
  label,
  value,
  badge,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-semibold font-mono text-zinc-900 tabular-nums tracking-tight">
        {value}
      </p>
      {badge && <div className="mt-2">{badge}</div>}
    </div>
  );
}

// ==================== SERVICES TAB ====================

function ServicesTab({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const { data, isLoading, error } = useServiceReport(startDate, endDate);

  if (isLoading) return <TabSkeleton />;
  if (error) return <TabError />;

  const services: ServiceRank[] = data ?? [];
  const totalRevenue = services.reduce((sum, s) => sum + s.revenue, 0);

  if (services.length === 0) {
    return (
      <EmptyState
        icon={<Scissors size={32} className="text-zinc-400" />}
        title="서비스 데이터가 없습니다"
        description="선택한 기간에 예약된 서비스가 없습니다"
      />
    );
  }

  // CSS-based pie chart approximation using conic gradient
  const conicSegments = services.reduce<string[]>((acc, service, i) => {
    const colors = [
      '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
    ];
    const color = colors[i % colors.length];
    const prevEnd = i === 0 ? 0 : services.slice(0, i).reduce((s, sv) => s + sv.percentage, 0);
    const end = prevEnd + service.percentage;
    acc.push(`${color} ${prevEnd}% ${end}%`);
    return acc;
  }, []);

  const conicGradient = `conic-gradient(${conicSegments.join(', ')})`;

  const pieColors = [
    'bg-[#4ECDC415]0', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-violet-500',
    'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500', 'bg-lime-500',
  ];

  return (
    <div className="space-y-6">
      {/* Pie chart + legend */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
        <h3 className="text-sm font-semibold text-zinc-900 mb-6">
          서비스별 예약 비율
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Pie chart */}
          <div className="flex-shrink-0">
            <div
              className="w-44 h-44 rounded-full shadow-inner"
              style={{ background: conicGradient }}
            />
          </div>
          {/* Legend */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            {services.slice(0, 10).map((service, i) => (
              <div key={service.serviceId} className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-3 w-3 rounded-sm flex-shrink-0',
                    pieColors[i % pieColors.length],
                  )}
                />
                <span className="text-sm text-zinc-700 truncate">
                  {service.serviceName}
                </span>
                <span className="text-xs text-zinc-400 ml-auto flex-shrink-0 tabular-nums">
                  {service.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service ranking */}
      <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-[#FFE4E0]">
          <h3 className="text-sm font-semibold text-zinc-900">
            서비스 순위
          </h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {services.map((service, i) => (
            <div key={service.serviceId} className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-600 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {service.serviceName}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {service.categoryName}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-mono font-semibold text-zinc-900 tabular-nums">
                    {formatCurrency(service.revenue)}
                  </p>
                  <p className="text-xs text-zinc-400 tabular-nums">
                    {service.bookingCount}건
                  </p>
                </div>
              </div>
              {/* Percentage bar */}
              <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    pieColors[i % pieColors.length],
                  )}
                  style={{ width: `${service.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== CUSTOMERS TAB ====================

function CustomersTab({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const { data, isLoading, error } = useCustomerReport(startDate, endDate);

  if (isLoading) return <TabSkeleton />;
  if (error) return <TabError />;

  const customerData: CustomerData | null = data ?? null;
  if (!customerData) return <TabError />;

  const totalCustomers =
    customerData.newCustomers + customerData.returningCustomers;
  const newPercent =
    totalCustomers > 0
      ? Math.round((customerData.newCustomers / totalCustomers) * 100)
      : 0;
  const returningPercent = 100 - newPercent;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="신규 고객"
          value={`${customerData.newCustomers}명`}
          icon={<UserPlus size={18} className="text-[#FF6B6B]" />}
          iconBg="bg-[#FF6B6B15]"
        />
        <SummaryCard
          label="재방문 고객"
          value={`${customerData.returningCustomers}명`}
          icon={<ArrowClockwise size={18} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <SummaryCard
          label="재방문율"
          value={`${customerData.retentionRate}%`}
          icon={<TrendUp size={18} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <SummaryCard
          label="건당 평균 결제"
          value={formatCurrency(customerData.averageSpend)}
          icon={<ChartLine size={18} className="text-violet-600" />}
          iconBg="bg-violet-50"
        />
      </div>

      {/* New vs Returning ratio bar */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">
          신규 vs 재방문 비율
        </h3>
        {totalCustomers > 0 ? (
          <>
            <div className="h-6 rounded-full bg-zinc-100 overflow-hidden flex">
              <div
                className="h-full bg-[#FF8080] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ width: `${newPercent}%` }}
              />
              <div
                className="h-full bg-blue-400 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ width: `${returningPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-[#FF8080]" />
                <span className="text-sm text-zinc-600">
                  신규 {newPercent}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-blue-400" />
                <span className="text-sm text-zinc-600">
                  재방문 {returningPercent}%
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-400 text-center py-4">
            데이터가 없습니다
          </p>
        )}
      </div>

      {/* Top customers */}
      <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-[#FFE4E0]">
          <h3 className="text-sm font-semibold text-zinc-900">
            상위 고객 TOP 10
          </h3>
        </div>
        {customerData.topCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-400">데이터가 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {customerData.topCustomers.map((customer, i) => (
              <div
                key={customer.customerId}
                className="px-6 py-3.5 flex items-center gap-4 hover:bg-[#FFF5F5] transition-colors duration-200"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0',
                    i < 3
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-zinc-100 text-zinc-600',
                  )}
                >
                  {i < 3 ? (
                    <Crown size={16} weight="fill" />
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">
                    {customer.customerName}
                  </p>
                  <p className="text-xs text-zinc-400 tabular-nums">
                    {customer.visitCount}회 방문
                  </p>
                </div>
                <span className="text-sm font-mono font-semibold text-zinc-900 tabular-nums flex-shrink-0">
                  {formatCurrency(customer.totalSpent)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== HOURLY TAB ====================

function HourlyTab({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const { data, isLoading, error } = useHourlyReport(startDate, endDate);

  if (isLoading) return <TabSkeleton />;
  if (error) return <TabError />;

  const hourlyData: HourlyData[] = data ?? [];
  const maxCount = Math.max(...hourlyData.map((d) => d.bookingCount), 1);
  const totalBookings = hourlyData.reduce((sum, d) => sum + d.bookingCount, 0);
  const peakHour = hourlyData.reduce(
    (peak, d) => (d.bookingCount > peak.bookingCount ? d : peak),
    hourlyData[0] ?? { hour: 0, bookingCount: 0 },
  );

  // Only show relevant business hours (8-22)
  const businessHours = hourlyData.filter((d) => d.hour >= 8 && d.hour <= 22);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          label="총 예약 건수"
          value={`${totalBookings}건`}
          icon={<Clock size={18} className="text-[#FF6B6B]" />}
          iconBg="bg-[#FF6B6B15]"
        />
        <SummaryCard
          label="피크 시간대"
          value={
            peakHour.bookingCount > 0
              ? `${String(peakHour.hour).padStart(2, '0')}:00 (${peakHour.bookingCount}건)`
              : '-'
          }
          icon={<TrendUp size={18} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Heatmap grid */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
        <h3 className="text-sm font-semibold text-zinc-900 mb-6">
          시간대별 예약 분포
        </h3>

        {/* Bar chart style */}
        <div className="space-y-2">
          {businessHours.map((d) => {
            const intensity =
              maxCount > 0 ? d.bookingCount / maxCount : 0;
            return (
              <div key={d.hour} className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-mono tabular-nums w-12 text-right flex-shrink-0">
                  {String(d.hour).padStart(2, '0')}:00
                </span>
                <div className="flex-1 h-7 rounded-lg bg-[#FFF8F6] overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full rounded-lg transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
                      intensity === 0
                        ? 'bg-zinc-100'
                        : intensity < 0.25
                          ? 'bg-[#FF6B6B20]'
                          : intensity < 0.5
                            ? 'bg-[#FF6B6B30]'
                            : intensity < 0.75
                              ? 'bg-[#FF6B6B]'
                              : 'bg-[#FF5252]',
                    )}
                    style={{
                      width: `${Math.max(intensity * 100, d.bookingCount > 0 ? 4 : 0)}%`,
                    }}
                  />
                  {d.bookingCount > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-zinc-600 tabular-nums">
                      {d.bookingCount}건
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Intensity legend */}
        <div className="flex items-center justify-end gap-1 mt-6">
          <span className="text-[10px] text-zinc-400 mr-1">적음</span>
          <div className="h-3 w-5 rounded-sm bg-[#FF6B6B20]" />
          <div className="h-3 w-5 rounded-sm bg-[#FF6B6B30]" />
          <div className="h-3 w-5 rounded-sm bg-[#FF6B6B]" />
          <div className="h-3 w-5 rounded-sm bg-[#FF5252]" />
          <span className="text-[10px] text-zinc-400 ml-1">많음</span>
        </div>
      </div>

      {/* Heatmap grid view */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">
          전체 시간대 히트맵
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
          {hourlyData.map((d) => {
            const intensity =
              maxCount > 0 ? d.bookingCount / maxCount : 0;
            return (
              <div
                key={d.hour}
                className={cn(
                  'aspect-square rounded-lg flex flex-col items-center justify-center',
                  'transition-all duration-300 group cursor-default',
                  intensity === 0
                    ? 'bg-zinc-50 ring-1 ring-zinc-100'
                    : intensity < 0.25
                      ? 'bg-[#4ECDC415] ring-1 ring-[#FF6B6B20]'
                      : intensity < 0.5
                        ? 'bg-[#FF6B6B30] ring-1 ring-[#FF6B6B40]'
                        : intensity < 0.75
                          ? 'bg-[#FF6B6B] ring-1 ring-[#FF6B6B]'
                          : 'bg-[#FF5252] ring-1 ring-[#E04848]',
                )}
                title={`${String(d.hour).padStart(2, '0')}:00 - ${d.bookingCount}건`}
              >
                <span
                  className={cn(
                    'text-[10px] font-mono font-medium',
                    intensity >= 0.5 ? 'text-white' : 'text-zinc-500',
                  )}
                >
                  {String(d.hour).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'text-[9px] font-mono',
                    intensity >= 0.5 ? 'text-white/80' : 'text-zinc-400',
                  )}
                >
                  {d.bookingCount > 0 ? d.bookingCount : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================

function SummaryCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            iconBg,
          )}
        >
          {icon}
        </div>
      </div>
      <p className="text-xl font-semibold font-mono text-zinc-900 tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#FFE4E0] animate-pulse" />
        ))}
      </div>
      <div className="h-56 rounded-2xl bg-[#FFE4E0] animate-pulse" />
      <div className="h-40 rounded-2xl bg-[#FFE4E0] animate-pulse" />
    </div>
  );
}

function TabError() {
  return (
    <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
      <p className="text-sm text-red-600">
        데이터를 불러오는데 실패했습니다
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-16 flex flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6B6B10] mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
        {title}
      </h3>
      <p className="mt-2 text-sm text-zinc-500 max-w-xs">{description}</p>
    </div>
  );
}

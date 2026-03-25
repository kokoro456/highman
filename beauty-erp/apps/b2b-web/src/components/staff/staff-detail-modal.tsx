'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import {
  CalendarDots,
  CurrencyCircleDollar,
  Sparkle,
  Wallet,
  Phone,
  EnvelopeSimple,
  PencilSimple,
  ChartBar,
  SpinnerGap,
  User,
} from '@phosphor-icons/react';
import { cn, formatCurrency, formatPhone } from '@/lib/utils';
import { useStaffSettlement, type StaffSettlementDetail } from '@/hooks/use-settlement';
import { StaffFormModal } from './staff-form-modal';

interface StaffDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: any;
  currentMonth: string;
  /** Pre-fetched summary settlement data from the list endpoint */
  summarySettlement?: {
    totalBookings: number;
    totalRevenue: number;
    incentiveAmount: number;
    baseSalary: number;
    totalPay: number;
  };
}

const roleLabels: Record<string, string> = {
  OWNER: '원장',
  MANAGER: '매니저',
  DESIGNER: '디자이너',
  ASSISTANT: '어시스턴트',
  INTERN: '인턴',
};

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

export function StaffDetailModal({
  open,
  onOpenChange,
  staff,
  currentMonth,
  summarySettlement,
}: StaffDetailModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch detailed settlement (includes service breakdown)
  const {
    data: detail,
    isLoading: detailLoading,
  } = useStaffSettlement(staff?.id ?? '', currentMonth);

  if (!staff) return null;

  const specialties: string[] = staff.specialties ?? [];
  const schedule: number[] = staff.schedules
    ? staff.schedules
        .map((s: any) => {
          const dayMap: Record<string, number> = {
            SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
          };
          return dayMap[s.dayOfWeek] ?? -1;
        })
        .filter((d: number) => d >= 0)
    : [];

  // Use detail data if available, fallback to summary
  const settlement = detail ?? summarySettlement;

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="직원 상세"
        description="직원 정보와 이번달 실적을 확인하세요"
        size="lg"
      >
        <div className="space-y-6">
          {/* ── Staff Header ───────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${staff.color ?? '#9CA3AF'}20` }}
              >
                <User
                  size={24}
                  weight="fill"
                  style={{ color: staff.color ?? '#9CA3AF' }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-zinc-900 tracking-tight">
                    {staff.name}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-500">
                    {roleLabels[staff.role] ?? staff.role}
                  </span>
                </div>
                {/* Contact info */}
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                  {staff.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} />
                      {formatPhone(staff.phone)}
                    </span>
                  )}
                  {staff.email && (
                    <span className="flex items-center gap-1">
                      <EnvelopeSimple size={12} />
                      {staff.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onOpenChange(false);
                // Small delay to let animation finish before opening edit
                setTimeout(() => setShowEditModal(true), 150);
              }}
              className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-2 text-xs font-medium text-zinc-600 transition-all duration-300 hover:bg-zinc-200 active:scale-[0.98]"
            >
              <PencilSimple size={14} weight="bold" />
              수정
            </button>
          </div>

          {/* ── Specialties ────────────────────────────────── */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {specialties.map((spec: string) => (
                <span
                  key={spec}
                  className="rounded-full bg-[#FFF8F6] px-3 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-[#FFE4E0]"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* ── Schedule ───────────────────────────────────── */}
          <div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              근무 스케줄
            </span>
            <div className="mt-2 flex items-center gap-1.5">
              {dayLabels.map((label, idx) => {
                const isWorking = schedule.includes(idx);
                return (
                  <span
                    key={idx}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-medium transition-colors duration-200',
                      isWorking
                        ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_4px_15px_rgba(255,107,107,0.3)]'
                        : 'bg-zinc-100 text-zinc-400',
                    )}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* ── Monthly Stats ──────────────────────────────── */}
          <div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              {currentMonth.replace('-', '년 ')}월 실적
            </span>

            {!settlement && detailLoading ? (
              <div className="mt-3 flex items-center justify-center py-6">
                <SpinnerGap size={20} className="animate-spin text-[#FF6B6B]" />
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={<CalendarDots size={14} className="text-[#FF6B6B]" />}
                  label="예약"
                  value={`${settlement?.totalBookings ?? 0}건`}
                />
                <StatCard
                  icon={<CurrencyCircleDollar size={14} className="text-[#FF6B6B]" />}
                  label="매출"
                  value={formatCurrency(settlement?.totalRevenue ?? 0)}
                />
                <StatCard
                  icon={<Sparkle size={14} className="text-[#FF6B6B]" />}
                  label="인센티브"
                  value={formatCurrency(settlement?.incentiveAmount ?? 0)}
                  highlight
                />
                <StatCard
                  icon={<Wallet size={14} className="text-[#FF6B6B]" />}
                  label="총 급여"
                  value={formatCurrency(settlement?.totalPay ?? 0)}
                />
              </div>
            )}
          </div>

          {/* ── Service Breakdown ──────────────────────────── */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <ChartBar size={14} className="text-zinc-400" />
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                서비스별 매출
              </span>
            </div>

            {detailLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-[#FFE4E0]/40 animate-pulse" />
                ))}
              </div>
            ) : detail?.serviceBreakdown && detail.serviceBreakdown.length > 0 ? (
              <div className="space-y-2">
                {detail.serviceBreakdown.map((svc) => {
                  const maxRevenue = Math.max(
                    ...detail.serviceBreakdown.map((s) => s.revenue),
                    1,
                  );
                  const pct = (svc.revenue / maxRevenue) * 100;
                  return (
                    <div
                      key={svc.serviceId}
                      className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0]"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-zinc-700">
                          {svc.serviceName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="font-mono tabular-nums">
                            {svc.bookingCount}건
                          </span>
                          <span className="font-mono font-semibold text-zinc-800 tabular-nums">
                            {formatCurrency(svc.revenue)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#FFE4E0]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-[#FFF8F6] p-4 ring-1 ring-[#FFE4E0] text-center">
                <p className="text-xs text-zinc-400">이번달 서비스 실적이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <StaffFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        staff={staff}
      />
    </>
  );
}

/* ── Stat card sub-component ──────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0]">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={cn(
          'text-sm font-semibold font-mono tabular-nums',
          highlight ? 'text-[#FF6B6B]' : 'text-zinc-900',
        )}
      >
        {value}
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  UserPlus,
  CalendarDots,
  CurrencyCircleDollar,
  Percent,
  Sparkle,
  UserCircle,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import { useStaff } from '@/hooks/use-staff';
import { StaffFormModal } from './staff-form-modal';

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
const roleLabels = {
  DESIGNER: '디자이너',
  ASSISTANT: '어시스턴트',
};

export function StaffManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: staffList, isLoading, error, refetch } = useStaff();
  const staffData = staffList ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">직원 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">직원 정보와 실적을 관리하세요</p>
        </div>
        <div className="animate-fade-in space-y-4">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">직원 관리</h1>
        </div>
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">데이터를 불러오는데 실패했습니다</p>
          <button onClick={() => refetch()} className="mt-2 text-xs text-red-500 underline">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              직원 관리
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              직원 정보와 실적을 관리하세요
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-mono font-medium text-zinc-600 tabular-nums">
            {staffData.length}명
          </span>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] whitespace-nowrap"
        >
          <UserPlus size={16} weight="bold" />
          직원 등록
        </button>
      </div>

      {/* Staff cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {staffData.map((staff: any) => {
          const specialties = staff.specialties ?? [];
          // Extract working days from schedules relation if available
          const schedule: number[] = staff.schedules
            ? staff.schedules.map((s: any) => {
                const dayMap: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
                return dayMap[s.dayOfWeek] ?? -1;
              }).filter((d: number) => d >= 0)
            : [];
          return (
            <div
              key={staff.id}
              className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft p-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: staff.color ?? '#9CA3AF' }}
                  />
                  <span className="text-base font-semibold text-zinc-900 tracking-tight">
                    {staff.name}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-500">
                    {roleLabels[staff.role as keyof typeof roleLabels] ?? staff.role}
                  </span>
                </div>
              </div>

              {/* Specialties */}
              <div className="flex items-center gap-1.5 mb-5">
                {specialties.map((spec: string) => (
                  <span
                    key={spec}
                    className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 ring-1 ring-zinc-200/50"
                  >
                    {spec}
                  </span>
                ))}
                {specialties.length === 0 && (
                  <span className="text-[10px] text-zinc-400">전문 분야 미설정</span>
                )}
              </div>

              {/* Stats - using placeholder values since stats endpoint needs date params */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl bg-zinc-50/80 p-3 ring-1 ring-zinc-200/40">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CalendarDots size={11} className="text-zinc-400" />
                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
                      이번달 예약
                    </span>
                  </div>
                  <p className="text-lg font-semibold font-mono text-zinc-900 tabular-nums">
                    -
                    <span className="text-xs font-sans text-zinc-400 ml-0.5">
                      건
                    </span>
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50/80 p-3 ring-1 ring-zinc-200/40">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CurrencyCircleDollar size={11} className="text-zinc-400" />
                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
                      이번달 매출
                    </span>
                  </div>
                  <p className="text-base font-semibold font-mono text-zinc-900 tabular-nums">
                    -
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50/80 p-3 ring-1 ring-zinc-200/40">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkle size={11} className="text-zinc-400" />
                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
                      인센티브
                    </span>
                  </div>
                  <p className="text-base font-semibold font-mono text-brand-700 tabular-nums">
                    -
                  </p>
                </div>
              </div>

              {/* Schedule */}
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
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-400',
                        )}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty add card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="rounded-2xl border-2 border-dashed border-zinc-200 p-6 flex flex-col items-center justify-center text-center min-h-[280px] transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50/50 cursor-pointer group"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-4 transition-all duration-300 group-hover:bg-zinc-200">
            <UserCircle size={28} weight="regular" className="text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600">
            새 직원 등록
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            직원을 추가하여 예약을 배정하세요
          </p>
        </div>
      </div>

      {/* Staff create modal */}
      <StaffFormModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}

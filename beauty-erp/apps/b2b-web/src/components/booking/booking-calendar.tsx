'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CaretLeft,
  CaretRight,
  Plus,
  CalendarBlank,
  Clock,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const mockStaff = [
  { id: '1', name: '박서연', color: '#10B981', role: 'DESIGNER' },
  { id: '2', name: '이하은', color: '#6366F1', role: 'DESIGNER' },
  { id: '3', name: '김도윤', color: '#F59E0B', role: 'ASSISTANT' },
];

const mockBookings = [
  {
    id: '1',
    customer: '정민서',
    service: '속눈썹 연장 (자연)',
    staff: '1',
    startHour: 10,
    duration: 90,
    status: 'CONFIRMED' as const,
  },
  {
    id: '2',
    customer: '최유진',
    service: '젤네일 풀세트',
    staff: '2',
    startHour: 11,
    duration: 120,
    status: 'IN_PROGRESS' as const,
  },
  {
    id: '3',
    customer: '한소희',
    service: '브라질리언 왁싱',
    staff: '1',
    startHour: 13,
    duration: 60,
    status: 'CONFIRMED' as const,
  },
  {
    id: '4',
    customer: '오서윤',
    service: '속눈썹 리터치',
    staff: '3',
    startHour: 14,
    duration: 45,
    status: 'READY' as const,
  },
  {
    id: '5',
    customer: '윤채원',
    service: '아트네일',
    staff: '2',
    startHour: 15,
    duration: 90,
    status: 'COMPLETED' as const,
  },
];

type BookingStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';

const statusConfig: Record<
  BookingStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  CONFIRMED: {
    label: '확정',
    bg: 'bg-brand-50',
    text: 'text-brand-700',
    dot: 'bg-brand-500',
  },
  IN_PROGRESS: {
    label: '진행중',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  READY: {
    label: '대기',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  COMPLETED: {
    label: '완료',
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
    dot: 'bg-zinc-400',
  },
};

const HOUR_HEIGHT = 80;
const START_HOUR = 9;
const END_HOUR = 21;
const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

export function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMinute, setCurrentMinute] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentMinute(now.getHours() * 60 + now.getMinutes());
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const goNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const currentTimeTop = useMemo(() => {
    const minutesSinceStart = currentMinute - START_HOUR * 60;
    if (minutesSinceStart < 0 || currentMinute > END_HOUR * 60) return null;
    return (minutesSinceStart / 60) * HOUR_HEIGHT;
  }, [currentMinute]);

  const hasBookings = mockBookings.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            예약 관리
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            일정을 확인하고 예약을 관리하세요
          </p>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CaretLeft size={16} className="text-zinc-600" />
          </button>
          <button
            onClick={goToday}
            className="rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            오늘
          </button>
          <button
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CaretRight size={16} className="text-zinc-600" />
          </button>
          <span className="ml-2 text-sm font-medium text-zinc-700">
            {formatDate(currentDate)}
          </span>
        </div>
      </div>

      {!hasBookings ? (
        /* Empty state */
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft p-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 mb-6">
            <CalendarBlank size={32} weight="regular" className="text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            오늘 예약이 없습니다
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">
            새로운 예약을 등록하거나, 다른 날짜를 선택해 주세요
          </p>
          <button className="mt-6 flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98]">
            <Plus size={16} weight="bold" />
            예약 등록
          </button>
        </div>
      ) : (
        /* Calendar grid */
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden">
          {/* Staff header */}
          <div className="grid border-b border-zinc-100" style={{ gridTemplateColumns: '72px repeat(3, 1fr)' }}>
            <div className="p-3 border-r border-zinc-100">
              <Clock size={16} className="text-zinc-400 mx-auto" />
            </div>
            {mockStaff.map((staff) => (
              <div
                key={staff.id}
                className="p-3 text-center border-r border-zinc-100 last:border-r-0"
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: staff.color }}
                  />
                  <span className="text-sm font-medium text-zinc-800">
                    {staff.name}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] font-medium text-zinc-500">
                    {staff.role === 'DESIGNER' ? '디자이너' : '어시스턴트'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative overflow-y-auto max-h-[calc(100vh-280px)]">
            <div
              className="grid"
              style={{ gridTemplateColumns: '72px repeat(3, 1fr)' }}
            >
              {/* Time labels */}
              <div className="border-r border-zinc-100">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="relative border-b border-zinc-50"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="absolute -top-2.5 right-3 text-[11px] font-mono text-zinc-400 tabular-nums">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Staff columns */}
              {mockStaff.map((staff) => {
                const staffBookings = mockBookings.filter(
                  (b) => b.staff === staff.id,
                );
                return (
                  <div
                    key={staff.id}
                    className="relative border-r border-zinc-100 last:border-r-0"
                  >
                    {/* Hour grid lines */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="border-b border-zinc-50"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {/* Booking blocks */}
                    {staffBookings.map((booking) => {
                      const top =
                        (booking.startHour - START_HOUR) * HOUR_HEIGHT;
                      const height = (booking.duration / 60) * HOUR_HEIGHT;
                      const status = statusConfig[booking.status];

                      return (
                        <div
                          key={booking.id}
                          className="absolute left-1.5 right-1.5 rounded-xl bg-white shadow-soft ring-1 ring-zinc-200/50 px-3 py-2 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.99] overflow-hidden"
                          style={{
                            top: top + 2,
                            height: height - 4,
                            borderLeft: `4px solid ${staff.color}`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-semibold text-zinc-800 truncate leading-tight">
                              {booking.customer}
                            </p>
                            <span
                              className={cn(
                                'flex-shrink-0 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium',
                                status.bg,
                                status.text,
                              )}
                            >
                              <span
                                className={cn(
                                  'h-1 w-1 rounded-full',
                                  status.dot,
                                )}
                              />
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-zinc-500 truncate">
                            {booking.service}
                          </p>
                          <p className="mt-1 text-[10px] font-mono text-zinc-400 tabular-nums">
                            {String(booking.startHour).padStart(2, '0')}:00 ~{' '}
                            {String(
                              booking.startHour +
                                Math.floor(booking.duration / 60),
                            ).padStart(2, '0')}
                            :{String(booking.duration % 60).padStart(2, '0')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Current time indicator */}
            {currentTimeTop !== null && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: currentTimeTop }}
              >
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-1 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                  <div className="flex-1 h-px bg-red-500/60" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="fixed bottom-8 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-soft-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] hover:-translate-y-1 active:scale-[0.95]">
        <Plus size={24} weight="bold" />
      </button>
    </div>
  );
}

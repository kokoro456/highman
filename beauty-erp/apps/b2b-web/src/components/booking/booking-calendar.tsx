'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CaretLeft,
  CaretRight,
  Plus,
  CalendarBlank,
  Clock,
  X,
  List,
  GridFour,
  DownloadSimple,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from '@/components/ui/toast';
import { useStaff } from '@/hooks/use-staff';
import { useBookings, useUpdateBookingStatus } from '@/hooks/use-bookings';
import { BookingFormModal } from './booking-form-modal';

type BookingStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';

const statusConfig: Record<
  BookingStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  CONFIRMED: {
    label: '확정',
    bg: 'bg-[#FF6B6B15]',
    text: 'text-[#FF6B6B]',
    dot: 'bg-[#FF6B6B]',
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

type AllBookingStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const allStatusOptions: { value: AllBookingStatus; label: string; color: string }[] = [
  { value: 'CONFIRMED', label: '확정', color: 'bg-[#FF6B6B]' },
  { value: 'IN_PROGRESS', label: '진행중', color: 'bg-amber-500' },
  { value: 'COMPLETED', label: '완료', color: 'bg-zinc-400' },
  { value: 'CANCELLED', label: '취소', color: 'bg-red-500' },
  { value: 'NO_SHOW', label: '노쇼', color: 'bg-rose-500' },
];

export function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMinute, setCurrentMinute] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'calendar'>('list');
  const [statusPopup, setStatusPopup] = useState<{ bookingId: string; x: number; y: number } | null>(null);
  const statusPopupRef = useRef<HTMLDivElement>(null);
  const updateStatus = useUpdateBookingStatus();

  const handleExport = async () => {
    const token = useAuthStore.getState().accessToken;
    const shopId = useAuthStore.getState().shopId;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const res = await fetch(`${apiUrl}/api/export/bookings?format=csv&startDate=${dateStr}&endDate=${dateStr}`, {
      headers: { Authorization: `Bearer ${token}`, 'x-shop-id': shopId || '' },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { data: staffList, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = useStaff();
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useBookings(currentDate.toISOString());

  const isLoading = staffLoading || bookingsLoading;
  const error = staffError || bookingsError;

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

  // Close status popup on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusPopupRef.current && !statusPopupRef.current.contains(e.target as Node)) {
        setStatusPopup(null);
      }
    }
    if (statusPopup) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [statusPopup]);

  function handleBookingClick(bookingId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setStatusPopup({
      bookingId,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  async function handleStatusChange(bookingId: string, status: string) {
    try {
      await updateStatus.mutateAsync({ id: bookingId, status });
      toast('success', '예약 상태가 변경되었습니다');
    } catch (err: any) {
      toast('error', err.message || '상태 변경에 실패했습니다');
    }
    setStatusPopup(null);
  }

  const currentTimeTop = useMemo(() => {
    const minutesSinceStart = currentMinute - START_HOUR * 60;
    if (minutesSinceStart < 0 || currentMinute > END_HOUR * 60) return null;
    return (minutesSinceStart / 60) * HOUR_HEIGHT;
  }, [currentMinute]);

  const staffData = staffList ?? [];
  const bookingData = bookings ?? [];
  const hasBookings = bookingData.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            예약 관리
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            일정을 확인하고 예약을 관리하세요
          </p>
        </div>
        <div className="animate-fade-in space-y-4">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            예약 관리
          </h1>
        </div>
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">데이터를 불러오는데 실패했습니다</p>
          <button onClick={() => { refetchStaff(); refetchBookings(); }} className="mt-2 text-xs text-red-500 underline">다시 시도</button>
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
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CaretLeft size={16} className="text-zinc-600" />
          </button>
          <button
            onClick={goToday}
            className="rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-700 ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            오늘
          </button>
          <button
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CaretRight size={16} className="text-zinc-600" />
          </button>
          <span className="ml-2 text-sm font-medium text-zinc-700">
            {formatDate(currentDate)}
          </span>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="ml-2 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-700 ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap"
          >
            <DownloadSimple size={14} weight="bold" />
            내보내기
          </button>
        </div>
      </div>

      {!hasBookings || staffData.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-8 md:p-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6B6B10] mb-6">
            <CalendarBlank size={32} weight="regular" className="text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            오늘 예약이 없습니다
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">
            새로운 예약을 등록하거나, 다른 날짜를 선택해 주세요
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_15px_rgba(255,107,107,0.3)] px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" />
            예약 등록
          </button>
        </div>
      ) : (
        <>
          {/* Mobile view toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileView('list')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                mobileView === 'list'
                  ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_4px_15px_rgba(255,107,107,0.3)]'
                  : 'bg-white text-zinc-600 ring-1 ring-[#FFE4E0]',
              )}
            >
              <List size={14} />
              리스트
            </button>
            <button
              onClick={() => setMobileView('calendar')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                mobileView === 'calendar'
                  ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_4px_15px_rgba(255,107,107,0.3)]'
                  : 'bg-white text-zinc-600 ring-1 ring-[#FFE4E0]',
              )}
            >
              <GridFour size={14} />
              캘린더
            </button>
          </div>

          {/* Mobile list view */}
          <div className={cn('md:hidden', mobileView !== 'list' && 'hidden')}>
            <div className="space-y-3">
              {bookingData
                .slice()
                .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((booking: any) => {
                  const startTime = new Date(booking.startTime);
                  const endTime = new Date(booking.endTime);
                  const startHour = startTime.getHours();
                  const startMinute = startTime.getMinutes();
                  const endHour = endTime.getHours();
                  const endMin = endTime.getMinutes();
                  const status = statusConfig[booking.status as BookingStatus];
                  const bookingStaff = staffData.find((s: any) => s.id === booking.staffId);
                  const bookingStaffColor = booking.staff?.color || bookingStaff?.color || '#9CA3AF';

                  if (!status) return null;

                  return (
                    <div
                      key={booking.id}
                      onClick={(e) => handleBookingClick(booking.id, e)}
                      className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-4 cursor-pointer transition-all duration-300 hover:shadow-soft-lg active:scale-[0.99]"
                      style={{ borderLeft: `4px solid ${bookingStaffColor}` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-zinc-800 truncate">
                            {booking.customer?.name ?? '고객'}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500 truncate">
                            {booking.service?.name ?? '서비스'}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                            status.bg,
                            status.text,
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-zinc-400 tabular-nums">
                            {String(startHour).padStart(2, '0')}:{String(startMinute).padStart(2, '0')} ~ {String(endHour).padStart(2, '0')}:{String(endMin).padStart(2, '0')}
                          </span>
                          {booking.depositAmount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-[#4ECDC415] px-1.5 py-0.5 text-[9px] font-medium text-[#4ECDC4]">
                              예약금 {Number(booking.depositAmount).toLocaleString()}원
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: bookingStaffColor }}
                          />
                          <span className="text-xs text-zinc-500">
                            {booking.staff?.name || bookingStaff?.name || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Calendar grid - hidden on mobile unless calendar view selected */}
          <div className={cn(
            'rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden',
            mobileView !== 'calendar' ? 'hidden md:block' : 'block',
          )}>
            {/* Staff header */}
            <div className="grid border-b border-[#FFE4E0] overflow-x-auto" style={{ gridTemplateColumns: `72px repeat(${staffData.length}, minmax(120px, 1fr))` }}>
              <div className="p-3 border-r border-[#FFE4E0]">
                <Clock size={16} className="text-zinc-400 mx-auto" />
              </div>
              {staffData.map((staff: any) => (
                <div
                  key={staff.id}
                  className="p-3 text-center border-r border-[#FFE4E0] last:border-r-0"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: staff.color }}
                    />
                    <span className="text-sm font-medium text-zinc-800 truncate">
                      {staff.name}
                    </span>
                    <span className="hidden sm:inline rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] font-medium text-zinc-500">
                      {staff.role === 'DESIGNER' ? '디자이너' : '어시스턴트'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative overflow-y-auto overflow-x-auto max-h-[calc(100vh-280px)]">
              <div
                className="grid"
                style={{ gridTemplateColumns: `72px repeat(${staffData.length}, minmax(120px, 1fr))` }}
              >
                {/* Time labels */}
                <div className="border-r border-[#FFE4E0]">
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
                {staffData.map((staff: any) => {
                  const staffBookings = bookingData.filter(
                    (b: any) => b.staffId === staff.id,
                  );
                  return (
                    <div
                      key={staff.id}
                      className="relative border-r border-[#FFE4E0] last:border-r-0"
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
                      {staffBookings.map((booking: any) => {
                        const startTime = new Date(booking.startTime);
                        const endTime = new Date(booking.endTime);
                        const startHour = startTime.getHours();
                        const startMinute = startTime.getMinutes();
                        const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
                        const top =
                          (startHour - START_HOUR) * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;
                        const height = (durationMinutes / 60) * HOUR_HEIGHT;
                        const status = statusConfig[booking.status as BookingStatus];
                        const bookingStaffColor = booking.staff?.color || staff.color;
                        const endHour = endTime.getHours();
                        const endMin = endTime.getMinutes();

                        if (!status) return null;

                        return (
                          <div
                            key={booking.id}
                            onClick={(e) => handleBookingClick(booking.id, e)}
                            className="absolute left-1.5 right-1.5 rounded-xl bg-white shadow-soft ring-1 ring-[#FFE4E0] px-3 py-2 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.99] overflow-hidden"
                            style={{
                              top: top + 2,
                              height: height - 4,
                              borderLeft: `4px solid ${bookingStaffColor}`,
                            }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-xs font-semibold text-zinc-800 truncate leading-tight">
                                {booking.customer?.name ?? '고객'}
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
                              {booking.service?.name ?? '서비스'}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <p className="text-[10px] font-mono text-zinc-400 tabular-nums">
                                {String(startHour).padStart(2, '0')}:{String(startMinute).padStart(2, '0')} ~{' '}
                                {String(endHour).padStart(2, '0')}
                                :{String(endMin).padStart(2, '0')}
                              </p>
                              {booking.depositAmount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-[#4ECDC415] px-1.5 py-0.5 text-[8px] font-medium text-[#4ECDC4]">
                                  예약금
                                </span>
                              )}
                            </div>
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
        </>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_4px_15px_rgba(255,107,107,0.3)] shadow-soft-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:from-[#FF5252] hover:to-[#FF7B7B] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] hover:-translate-y-1 active:scale-[0.95]"
      >
        <Plus size={24} weight="bold" />
      </button>

      {/* Status popup */}
      {statusPopup && (
        <div
          ref={statusPopupRef}
          className="fixed z-30 rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft-xl p-2 min-w-[140px]"
          style={{
            left: statusPopup.x,
            top: statusPopup.y,
            transform: 'translate(-50%, -100%) translateY(-8px)',
          }}
        >
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <span className="text-[11px] font-medium text-zinc-500">상태 변경</span>
            <button onClick={() => setStatusPopup(null)} className="flex h-5 w-5 items-center justify-center rounded hover:bg-zinc-100">
              <X size={12} className="text-zinc-400" />
            </button>
          </div>
          {allStatusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(statusPopup.bookingId, opt.value)}
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors duration-150 hover:bg-[#FFF5F5] active:bg-zinc-100 disabled:opacity-50"
            >
              <span className={cn('h-2 w-2 rounded-full flex-shrink-0', opt.color)} />
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Create booking modal */}
      <BookingFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        selectedDate={currentDate}
      />
    </div>
  );
}

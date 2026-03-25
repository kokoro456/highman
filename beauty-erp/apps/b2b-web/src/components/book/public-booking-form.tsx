'use client';

import { useState, useEffect, useMemo } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Shop {
  id: string;
  name: string;
  phone: string;
  address: string;
  description: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  businessHours: Record<string, any>;
  closedDays: string[];
  naverBookingUrl: string | null;
  kakaoChannelUrl: string | null;
  instagramUrl: string | null;
}

interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  b2cPrice: number | null;
  description: string | null;
  categoryId: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  color: string;
}

interface BookedSlot {
  staffId: string;
  startTime: string;
  endTime: string;
  status: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${days[d.getDay()]})`;
}

function generateTimeSlots(start: number, end: number, intervalMin: number): string[] {
  const slots: string[] = [];
  for (let m = start; m < end; m += intervalMin) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return slots;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMaxDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Steps ──────────────────────────────────────────────────────────────────────

type Step = 'service' | 'staff' | 'datetime' | 'info' | 'confirm' | 'done';

const STEP_LABELS: Record<Step, string> = {
  service: '서비스 선택',
  staff: '담당자 선택',
  datetime: '날짜/시간',
  info: '고객 정보',
  confirm: '확인',
  done: '완료',
};

const STEP_ORDER: Step[] = ['service', 'staff', 'datetime', 'info', 'confirm'];

// ── Component ──────────────────────────────────────────────────────────────────

export function PublicBookingForm({ shopId }: { shopId: string }) {
  // Data
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  // Selections
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [memo, setMemo] = useState('');

  // UI
  const [step, setStep] = useState<Step>('service');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pgClientKey, setPgClientKey] = useState<string>('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // ── Load shop + categories + staff ─────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const [shopRes, catRes, staffRes] = await Promise.all([
          publicFetch<{ data: Shop }>(`/shops/public/${shopId}`),
          publicFetch<{ data: ServiceCategory[] }>(`/services/public/categories?shopId=${shopId}`),
          publicFetch<{ data: Staff[] }>(`/staff/public?shopId=${shopId}`),
        ]);
        setShop(shopRes.data);
        setCategories(catRes.data);
        setStaffList(staffRes.data);

        // Check if PG is configured
        try {
          const keyRes = await publicFetch<{ data: { clientKey: string } }>('/pg/client-key');
          const key = keyRes.data.clientKey;
          if (key && key !== '' && !key.startsWith('test_ck_XXXX')) {
            setPgClientKey(key);
          }
        } catch {
          // PG not configured, ignore
        }
      } catch (e: any) {
        setError(e.message || '매장 정보를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shopId]);

  // ── Load booked slots when date or staff changes ───────────────────────────

  useEffect(() => {
    if (!selectedDate || !selectedStaffId) return;
    publicFetch<{ data: BookedSlot[] }>(
      `/bookings/public?shopId=${shopId}&date=${selectedDate}`,
    ).then((res) => setBookedSlots(res.data));
  }, [shopId, selectedDate, selectedStaffId]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedService = selectedCategory?.services.find((s) => s.id === selectedServiceId)
    ?? categories.flatMap((c) => c.services).find((s) => s.id === selectedServiceId);
  const selectedStaff = staffList.find((s) => s.id === selectedStaffId);

  // Generate available time slots (9:00 - 21:00, 30 min intervals)
  const allTimeSlots = useMemo(() => generateTimeSlots(9 * 60, 21 * 60, 30), []);

  const availableTimeSlots = useMemo(() => {
    if (!selectedService || !selectedStaffId) return allTimeSlots;
    const duration = selectedService.duration;
    const staffSlots = bookedSlots.filter((s) => s.staffId === selectedStaffId && s.status !== 'CANCELLED' && s.status !== 'NO_SHOW');

    return allTimeSlots.filter((timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      const slotStart = new Date(`${selectedDate}T${timeStr}:00`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      // Check if past
      if (slotStart < new Date()) return false;

      // Check conflicts
      return !staffSlots.some((booked) => {
        const bs = new Date(booked.startTime);
        const be = new Date(booked.endTime);
        return slotStart < be && slotEnd > bs;
      });
    });
  }, [allTimeSlots, bookedSlots, selectedStaffId, selectedService, selectedDate]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const stepIndex = STEP_ORDER.indexOf(step);

  function goNext() {
    if (stepIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[stepIndex + 1]);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStep(STEP_ORDER[stepIndex - 1]);
    }
  }

  function canProceed(): boolean {
    switch (step) {
      case 'service': return !!selectedServiceId;
      case 'staff': return !!selectedStaffId;
      case 'datetime': return !!selectedDate && !!selectedTime;
      case 'info': return !!customerName.trim() && !!customerPhone.trim();
      default: return true;
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          serviceId: selectedServiceId,
          staffId: selectedStaffId,
          startTime: `${selectedDate}T${selectedTime}:00`,
          memo: memo.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: '예약에 실패했습니다' }));
        throw new Error(err.error?.message || err.message || '예약에 실패했습니다');
      }
      setStep('done');
    } catch (e: any) {
      setError(e.message || '예약에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Online payment ───────────────────────────────────────────────────────

  async function handleOnlinePayment() {
    if (!selectedService || creatingOrder) return;
    setCreatingOrder(true);
    setError(null);

    try {
      const price = Number(selectedService.b2cPrice ?? selectedService.price);
      const res = await fetch(`${API_BASE}/api/pg/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shop-id': shopId,
        },
        body: JSON.stringify({
          amount: price,
          productName: selectedService.name,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: '주문 생성에 실패했습니다' }));
        throw new Error(err.message || '주문 생성에 실패했습니다');
      }

      const data = await res.json();
      // Redirect to checkout page
      window.location.href = `/checkout/${data.data.orderId}`;
    } catch (e: any) {
      setError(e.message || '결제 요청에 실패했습니다');
    } finally {
      setCreatingOrder(false);
    }
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FFF8F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B6B30] border-t-[#FF6B6B]" />
          <p className="text-sm text-zinc-400">매장 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error && !shop) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FFF8F6] px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <h1 className="text-xl font-semibold text-zinc-800 mb-2">매장을 찾을 수 없습니다</h1>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    const servicePrice = selectedService ? Number(selectedService.b2cPrice ?? selectedService.price) : 0;
    const showOnlinePayment = pgClientKey && servicePrice > 0;

    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FFF8F6] px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FF6B6B20] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#4ECDC4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-800 mb-2">예약이 완료되었습니다</h2>
          <p className="text-zinc-500 text-sm mb-6">예약 확인은 매장에서 연락드립니다.</p>
          <div className="bg-zinc-50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">매장</span>
              <span className="font-medium text-zinc-800">{shop?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">서비스</span>
              <span className="font-medium text-zinc-800">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">담당자</span>
              <span className="font-medium text-zinc-800">{selectedStaff?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">날짜</span>
              <span className="font-medium text-zinc-800">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">시간</span>
              <span className="font-medium text-zinc-800">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">고객명</span>
              <span className="font-medium text-zinc-800">{customerName}</span>
            </div>
          </div>

          {/* Online payment option */}
          {showOnlinePayment && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-zinc-200" />
                <span className="text-xs text-zinc-400">결제 방법 선택</span>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-left">
                  {error}
                </div>
              )}

              <button
                onClick={handleOnlinePayment}
                disabled={creatingOrder}
                className="w-full py-3.5 rounded-xl bg-[#0064FF] text-white font-medium text-sm hover:bg-[#0052D4] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingOrder
                  ? '처리 중...'
                  : `예약금 결제하기 (${formatPrice(servicePrice)})`}
              </button>
              <button
                onClick={() => setError(null)}
                className="w-full py-3.5 rounded-xl bg-zinc-100 text-zinc-600 font-medium text-sm hover:bg-zinc-200 transition-colors"
              >
                매장에서 결제
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFF8F6]">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          {shop?.profileImageUrl ? (
            <img
              src={shop.profileImageUrl}
              alt={shop.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#FF6B6B20] flex items-center justify-center">
              <span className="text-[#4ECDC4] font-semibold text-sm">
                {shop?.name?.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="font-semibold text-zinc-800">{shop?.name}</h1>
            <p className="text-xs text-zinc-400">온라인 예약</p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex items-center gap-1">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= stepIndex ? 'bg-[#4ECDC415]0' : 'bg-zinc-200'
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          {stepIndex + 1}/{STEP_ORDER.length} · {STEP_LABELS[step]}
        </p>
      </div>

      {/* External booking buttons */}
      {(shop?.naverBookingUrl || shop?.kakaoChannelUrl) && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="space-y-3">
            {shop.naverBookingUrl && (
              <a
                href={shop.naverBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#03C75A] text-white font-medium text-sm hover:bg-[#02b351] transition-colors shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.5 10.8L6.2 3H3v14h3.5V9.2L13.8 17H17V3h-3.5v7.8z"/>
                </svg>
                네이버 예약
              </a>
            )}
            {shop.kakaoChannelUrl && (
              <a
                href={shop.kakaoChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#FEE500] text-[#191919] font-medium text-sm hover:bg-[#FDD800] transition-colors shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2C5.03 2 1 5.13 1 8.97c0 2.48 1.64 4.66 4.1 5.89l-.6 2.92c-.04.2.17.36.35.26L8.4 15.9c.52.08 1.06.12 1.6.12 4.97 0 9-3.13 9-6.97S14.97 2 10 2z"/>
                </svg>
                카카오톡 상담
              </a>
            )}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-zinc-200" />
              <span className="text-xs text-zinc-400">또는 아래에서 직접 예약하세요</span>
              <div className="flex-1 h-px bg-zinc-200" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step: Service */}
        {step === 'service' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-800">서비스를 선택해 주세요</h2>

            {/* Category tabs */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                <button
                  onClick={() => { setSelectedCategoryId(''); setSelectedServiceId(''); }}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !selectedCategoryId
                      ? 'bg-[#4ECDC415]0 text-white'
                      : 'bg-white text-zinc-600 border border-zinc-200'
                  }`}
                >
                  전체
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategoryId(cat.id); setSelectedServiceId(''); }}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategoryId === cat.id
                        ? 'bg-[#4ECDC415]0 text-white'
                        : 'bg-white text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Service list */}
            <div className="space-y-2">
              {(selectedCategoryId
                ? categories.filter((c) => c.id === selectedCategoryId)
                : categories
              ).flatMap((cat) =>
                cat.services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedServiceId === svc.id
                        ? 'border-[#FF6B6B] bg-[#4ECDC415] ring-1 ring-[#FF6B6B]'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-800">{svc.name}</span>
                      <span className="text-[#4ECDC4] font-semibold text-sm">
                        {formatPrice(Number(svc.b2cPrice ?? svc.price))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-400">{svc.duration}분</span>
                      {svc.description && (
                        <span className="text-xs text-zinc-400">· {svc.description}</span>
                      )}
                    </div>
                  </button>
                )),
              )}
              {categories.flatMap((c) => c.services).length === 0 && (
                <p className="text-center text-zinc-400 text-sm py-8">
                  등록된 서비스가 없습니다
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step: Staff */}
        {step === 'staff' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-800">담당자를 선택해 주세요</h2>
            <div className="grid grid-cols-2 gap-3">
              {staffList.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    selectedStaffId === staff.id
                      ? 'border-[#FF6B6B] bg-[#4ECDC415] ring-1 ring-[#FF6B6B]'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: staff.color || '#10b981' }}
                  >
                    {staff.name.charAt(0)}
                  </div>
                  <p className="font-medium text-zinc-800 text-sm">{staff.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{staff.role === 'DESIGNER' ? '디자이너' : staff.role === 'INTERN' ? '인턴' : staff.role}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: DateTime */}
        {step === 'datetime' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-800">날짜와 시간을 선택해 주세요</h2>

            {/* Date picker */}
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-2">날짜</label>
              <input
                type="date"
                value={selectedDate}
                min={getTodayStr()}
                max={getMaxDateStr()}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
              />
            </div>

            {/* Time slots */}
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-2">
                시간 {selectedService && <span className="text-zinc-400 font-normal">({selectedService.duration}분 소요)</span>}
              </label>
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-[#4ECDC415]0 text-white'
                          : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-400 text-sm py-8">
                  선택한 날짜에 예약 가능한 시간이 없습니다
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step: Info */}
        {step === 'info' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-800">고객 정보를 입력해 주세요</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1.5">이름 *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent placeholder:text-zinc-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1.5">전화번호 *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent placeholder:text-zinc-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1.5">요청 사항 <span className="text-zinc-400 font-normal">(선택)</span></label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                placeholder="요청 사항이 있으시면 남겨주세요"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-800 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent placeholder:text-zinc-300"
              />
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-800">예약 정보를 확인해 주세요</h2>
            <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
              <div className="px-4 py-3 flex justify-between">
                <span className="text-sm text-zinc-500">서비스</span>
                <span className="text-sm font-medium text-zinc-800">{selectedService?.name}</span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-sm text-zinc-500">금액</span>
                <span className="text-sm font-semibold text-[#4ECDC4]">
                  {selectedService && formatPrice(Number(selectedService.b2cPrice ?? selectedService.price))}
                </span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-sm text-zinc-500">담당자</span>
                <span className="text-sm font-medium text-zinc-800">{selectedStaff?.name}</span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-sm text-zinc-500">날짜</span>
                <span className="text-sm font-medium text-zinc-800">{formatDate(selectedDate)}</span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-sm text-zinc-500">시간</span>
                <span className="text-sm font-medium text-zinc-800">{selectedTime} ({selectedService?.duration}분)</span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-sm text-zinc-500">고객명</span>
                <span className="text-sm font-medium text-zinc-800">{customerName}</span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-sm text-zinc-500">전화번호</span>
                <span className="text-sm font-medium text-zinc-800">{customerPhone}</span>
              </div>
              {memo && (
                <div className="px-4 py-3 flex justify-between">
                  <span className="text-sm text-zinc-500">요청 사항</span>
                  <span className="text-sm text-zinc-800 max-w-[60%] text-right">{memo}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 safe-area-pb">
        <div className="max-w-lg mx-auto flex gap-3">
          {stepIndex > 0 && (
            <button
              onClick={goBack}
              className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-medium text-sm hover:bg-[#FFF5F5] transition-colors"
            >
              이전
            </button>
          )}
          {step === 'confirm' ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#4ECDC415]0 text-white font-medium text-sm hover:bg-[#FF5252] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '예약 중...' : '예약 확정'}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex-1 py-3 rounded-xl bg-[#4ECDC415]0 text-white font-medium text-sm hover:bg-[#FF5252] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

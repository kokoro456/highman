'use client';

import { useState, useEffect } from 'react';
import {
  FloppyDisk,
  CaretDown,
  Plus,
  Trash,
  Clock,
  Storefront,
  Link as LinkIcon,
  CaretRight,
  CheckCircle,
  Info,
  ChatCircleDots,
  UserCircle,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import { useShop, useUpdateShop } from '@/hooks/use-shop';
import { useServiceCategories } from '@/hooks/use-services';
import { useClientKey } from '@/hooks/use-pg';
import { useAuthStore } from '@/lib/auth-store';
import { SpinnerGap, CreditCard } from '@phosphor-icons/react';
import { toast } from '@/components/ui/toast';

type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

const dayLabels: Record<DayKey, string> = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
  SAT: '토요일',
  SUN: '일요일',
};

const businessTypes = [
  { value: 'NAIL', label: '네일' },
  { value: 'EYELASH', label: '속눈썹' },
  { value: 'WAXING', label: '왁싱' },
  { value: 'SKIN', label: '피부' },
  { value: 'HAIR', label: '헤어' },
  { value: 'MULTI', label: '복합' },
];

interface BusinessHours {
  open: string;
  close: string;
  isOpen: boolean;
}

const defaultBusinessHours: Record<DayKey, BusinessHours> = {
  MON: { open: '10:00', close: '20:00', isOpen: true },
  TUE: { open: '10:00', close: '20:00', isOpen: true },
  WED: { open: '10:00', close: '20:00', isOpen: true },
  THU: { open: '10:00', close: '20:00', isOpen: true },
  FRI: { open: '10:00', close: '21:00', isOpen: true },
  SAT: { open: '11:00', close: '18:00', isOpen: true },
  SUN: { open: '00:00', close: '00:00', isOpen: false },
};

export function ShopSettings() {
  const { shopId } = useAuthStore();
  const { data: shopData, isLoading: shopLoading, error: shopError, refetch: refetchShop } = useShop(shopId ?? '');
  const { data: serviceCategories, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useServiceCategories();

  const isLoading = shopLoading || servicesLoading;
  const error = shopError || servicesError;

  const [shop, setShop] = useState({
    name: '',
    businessType: 'NAIL',
    phone: '',
    address: '',
    businessHours: defaultBusinessHours,
    naverBookingUrl: '',
    naverPlaceId: '',
    kakaoChannelUrl: '',
    instagramUrl: '',
  });
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [alimtalkGuideOpen, setAlimtalkGuideOpen] = useState(false);
  const [alimtalkStatus, setAlimtalkStatus] = useState<{ configured: boolean }>({ configured: false });
  const [socialLoginStatus, setSocialLoginStatus] = useState<{ kakao: boolean; naver: boolean }>({ kakao: false, naver: false });
  const updateShop = useUpdateShop();
  const { data: pgClientKey } = useClientKey();
  const isPgConnected = !!pgClientKey && pgClientKey !== '' && !pgClientKey.startsWith('test_ck_XXXX');

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API_BASE}/api/alimtalk/status`, { headers })
      .then((res) => res.json())
      .then((data) => { if (data.data) setAlimtalkStatus(data.data); })
      .catch(() => {});

    fetch(`${API_BASE}/api/auth/social/status`)
      .then((res) => res.json())
      .then((data) => { if (data.data) setSocialLoginStatus(data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (shopData && !initialized) {
      const bh = shopData.businessHours ?? defaultBusinessHours;
      setShop({
        name: shopData.name ?? '',
        businessType: shopData.businessType ?? 'NAIL',
        phone: shopData.phone ?? '',
        address: shopData.address ?? '',
        businessHours: typeof bh === 'object' ? bh : defaultBusinessHours,
        naverBookingUrl: shopData.naverBookingUrl ?? '',
        naverPlaceId: shopData.naverPlaceId ?? '',
        kakaoChannelUrl: shopData.kakaoChannelUrl ?? '',
        instagramUrl: shopData.instagramUrl ?? '',
      });
      setInitialized(true);
    }
  }, [shopData, initialized]);

  // Build service categories from API
  const services = (serviceCategories ?? []).map((cat: any) => ({
    category: cat.name ?? cat.category ?? '카테고리',
    items: (cat.services ?? cat.items ?? []).map((s: any) => ({
      name: s.name,
      duration: s.duration ?? 0,
      price: Number(s.price ?? 0),
    })),
  }));

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const updateHours = (day: DayKey, field: keyof BusinessHours, value: string | boolean) => {
    setShop((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">매장 설정</h1>
          <p className="mt-1 text-sm text-zinc-500">매장 정보와 서비스를 관리하세요</p>
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
      <div className="space-y-8 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">매장 설정</h1>
        </div>
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">데이터를 불러오는데 실패했습니다</p>
          <button onClick={() => { refetchShop(); refetchServices(); }} className="mt-2 text-xs text-red-500 underline">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          매장 설정
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          매장 정보와 서비스를 관리하세요
        </p>
      </div>

      {/* Section 1: Shop info */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
            <Storefront size={14} className="text-zinc-600" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-800">매장 정보</h2>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft p-6 space-y-5">
          {/* Shop name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600 pl-1">
              매장명
            </label>
            <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
              <input
                type="text"
                value={shop.name}
                onChange={(e) =>
                  setShop((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
              />
            </div>
          </div>

          {/* Business type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600 pl-1">
              업종
            </label>
            <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
              <select
                value={shop.businessType}
                onChange={(e) =>
                  setShop((prev) => ({
                    ...prev,
                    businessType: e.target.value,
                  }))
                }
                className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 outline-none appearance-none cursor-pointer"
              >
                {businessTypes.map((bt) => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone + Address row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">
                전화번호
              </label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <input
                  type="tel"
                  value={shop.phone}
                  onChange={(e) =>
                    setShop((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 outline-none tabular-nums"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">
                주소
              </label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <input
                  type="text"
                  value={shop.address}
                  onChange={(e) =>
                    setShop((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Business hours */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
            <Clock size={14} className="text-zinc-600" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-800">영업 시간</h2>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden">
          {(Object.keys(dayLabels) as DayKey[]).map((day, idx) => {
            const hours = shop.businessHours[day];
            return (
              <div
                key={day}
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4',
                  idx < 6 && 'border-b border-zinc-50',
                )}
              >
                {/* Day label + Toggle row */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <span
                    className={cn(
                      'text-sm font-medium w-16 flex-shrink-0',
                      hours.isOpen ? 'text-zinc-800' : 'text-zinc-400',
                    )}
                  >
                    {dayLabels[day]}
                  </span>

                  {/* Toggle */}
                  <button
                    onClick={() => updateHours(day, 'isOpen', !hours.isOpen)}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex-shrink-0',
                      hours.isOpen ? 'bg-brand-500' : 'bg-zinc-300',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                        hours.isOpen && 'translate-x-5',
                      )}
                    />
                  </button>

                  {/* Closed label - inline on mobile */}
                  {!hours.isOpen && (
                    <span className="text-sm text-zinc-400 sm:hidden">휴무</span>
                  )}
                </div>

                {/* Time inputs */}
                {hours.isOpen ? (
                  <div className="flex items-center gap-2 flex-1 pl-0 sm:pl-0">
                    <div className="rounded-lg bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white transition-all duration-300">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          updateHours(day, 'open', e.target.value)
                        }
                        className="rounded-md bg-transparent px-3 py-1.5 text-sm font-mono text-zinc-900 outline-none tabular-nums"
                      />
                    </div>
                    <span className="text-xs text-zinc-400">~</span>
                    <div className="rounded-lg bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white transition-all duration-300">
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          updateHours(day, 'close', e.target.value)
                        }
                        className="rounded-md bg-transparent px-3 py-1.5 text-sm font-mono text-zinc-900 outline-none tabular-nums"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="hidden sm:block text-sm text-zinc-400 flex-1">휴무</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: External integrations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
            <LinkIcon size={14} className="text-zinc-600" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-800">외부 서비스 연동</h2>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft p-6 space-y-5">
          {/* Naver Booking URL */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600 pl-1">
              네이버 예약 URL
            </label>
            <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
              <input
                type="url"
                value={shop.naverBookingUrl}
                onChange={(e) =>
                  setShop((prev) => ({ ...prev, naverBookingUrl: e.target.value }))
                }
                placeholder="https://booking.naver.com/booking/..."
                className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
              />
            </div>
            <p className="text-[11px] text-zinc-400 pl-1">
              네이버 스마트플레이스에서 예약 URL을 복사해 붙여넣으세요
            </p>
          </div>

          {/* Naver Place ID */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600 pl-1">
              네이버 플레이스 ID
            </label>
            <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
              <input
                type="text"
                value={shop.naverPlaceId}
                onChange={(e) =>
                  setShop((prev) => ({ ...prev, naverPlaceId: e.target.value }))
                }
                placeholder="12345678"
                className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400 pl-1">
              네이버 지도에서 매장 검색 후 URL의 숫자 부분
            </p>
          </div>

          {/* Kakao Channel URL */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600 pl-1">
              카카오톡 채널 URL
            </label>
            <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
              <input
                type="url"
                value={shop.kakaoChannelUrl}
                onChange={(e) =>
                  setShop((prev) => ({ ...prev, kakaoChannelUrl: e.target.value }))
                }
                placeholder="https://pf.kakao.com/..."
                className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
              />
            </div>
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600 pl-1">
              인스타그램
            </label>
            <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
              <input
                type="text"
                value={shop.instagramUrl}
                onChange={(e) =>
                  setShop((prev) => ({ ...prev, instagramUrl: e.target.value }))
                }
                placeholder="@beautynailstudio"
                className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
              />
            </div>
          </div>

          {/* Online Payment (Toss Payments) */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-zinc-600" />
                <label className="text-xs font-medium text-zinc-600">
                  온라인 결제 (토스페이먼츠)
                </label>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                  isPgConnected
                    ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                    : 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', isPgConnected ? 'bg-emerald-500' : 'bg-zinc-400')} />
                {isPgConnected ? '연동됨' : '미연동'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 pl-1">
              토스페이먼츠 API 키를 환경변수에 설정하면 B2C 예약 시 온라인 결제가 활성화됩니다
            </p>
          </div>

          {/* Kakao Alimtalk */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChatCircleDots size={16} className="text-zinc-600" />
                <label className="text-xs font-medium text-zinc-600">
                  카카오 알림톡
                </label>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                  alimtalkStatus.configured
                    ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                    : 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', alimtalkStatus.configured ? 'bg-emerald-500' : 'bg-zinc-400')} />
                {alimtalkStatus.configured ? '연동됨' : '미연동'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 pl-1">
              카카오 비즈니스 채널 등록 후 API 키를 환경변수에 설정하면 예약 알림이 자동 발송됩니다
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle size={16} className="text-zinc-600" />
                <label className="text-xs font-medium text-zinc-600">
                  소셜 로그인
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                    socialLoginStatus.kakao
                      ? 'bg-[#FEE500]/30 text-yellow-700 ring-1 ring-yellow-300'
                      : 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', socialLoginStatus.kakao ? 'bg-yellow-500' : 'bg-zinc-400')} />
                  카카오 {socialLoginStatus.kakao ? '연동' : '미연동'}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                    socialLoginStatus.naver
                      ? 'bg-[#03C75A]/10 text-green-700 ring-1 ring-green-300'
                      : 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', socialLoginStatus.naver ? 'bg-green-500' : 'bg-zinc-400')} />
                  네이버 {socialLoginStatus.naver ? '연동' : '미연동'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 pl-1">
              카카오 개발자 센터에서 앱 등록 후 REST API 키를 환경변수에 설정하세요
            </p>
          </div>
        </div>

        {/* Kakao Alimtalk Setup Guide */}
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden">
          <button
            onClick={() => setAlimtalkGuideOpen((prev) => !prev)}
            className="flex items-center justify-between w-full px-6 py-4 transition-colors duration-200 hover:bg-zinc-50/60"
          >
            <div className="flex items-center gap-2">
              <Info size={16} className="text-brand-500" />
              <span className="text-sm font-medium text-zinc-700">카카오 알림톡 / 소셜 로그인 설정 가이드</span>
            </div>
            <CaretRight
              size={14}
              className={cn(
                'text-zinc-400 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                alimtalkGuideOpen && 'rotate-90',
              )}
            />
          </button>

          {alimtalkGuideOpen && (
            <div className="border-t border-zinc-100 px-6 py-5 space-y-4">
              <div className="rounded-xl bg-brand-50/50 ring-1 ring-brand-100 p-5">
                <h4 className="text-xs font-semibold text-zinc-700 mb-3">카카오 알림톡 설정</h4>
                <ol className="space-y-2 text-sm text-zinc-700">
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600 flex-shrink-0">1</span>
                    <span>
                      <a href="https://business.kakao.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline underline-offset-2">카카오 비즈니스</a>에서 채널 생성
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600 flex-shrink-0">2</span>
                    <span>알림톡 발신 프로필 등록 및 템플릿 등록</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600 flex-shrink-0">3</span>
                    <span>REST API 키와 발신키를 환경변수에 설정</span>
                  </li>
                </ol>
              </div>
              <div className="rounded-xl bg-brand-50/50 ring-1 ring-brand-100 p-5">
                <h4 className="text-xs font-semibold text-zinc-700 mb-3">소셜 로그인 설정</h4>
                <ol className="space-y-2 text-sm text-zinc-700">
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600 flex-shrink-0">1</span>
                    <span>
                      <a href="https://developers.kakao.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline underline-offset-2">카카오 개발자 센터</a> / <a href="https://developers.naver.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline underline-offset-2">네이버 개발자 센터</a>에서 앱 등록
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600 flex-shrink-0">2</span>
                    <span>Redirect URI 설정 (카카오: /auth/kakao/callback, 네이버: /auth/naver/callback)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600 flex-shrink-0">3</span>
                    <span>Client ID / Secret을 환경변수에 설정</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Naver SmartPlace Guide */}
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden">
          <button
            onClick={() => setGuideOpen((prev) => !prev)}
            className="flex items-center justify-between w-full px-6 py-4 transition-colors duration-200 hover:bg-zinc-50/60"
          >
            <div className="flex items-center gap-2">
              <Info size={16} className="text-brand-500" />
              <span className="text-sm font-medium text-zinc-700">네이버 스마트플레이스 예약 설정 가이드</span>
            </div>
            <CaretRight
              size={14}
              className={cn(
                'text-zinc-400 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                guideOpen && 'rotate-90',
              )}
            />
          </button>

          {guideOpen && (
            <div className="border-t border-zinc-100 px-6 py-5">
              <div className="rounded-xl bg-brand-50/50 ring-1 ring-brand-100 p-5">
                <ol className="space-y-3 text-sm text-zinc-700">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 flex-shrink-0">1</span>
                    <span>
                      <a href="https://smartplace.naver.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline underline-offset-2">네이버 스마트플레이스</a> 접속
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 flex-shrink-0">2</span>
                    <span>사업자등록번호로 매장 등록</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 flex-shrink-0">3</span>
                    <span>예약 관리 &gt; 예약 설정 활성화</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 flex-shrink-0">4</span>
                    <span>예약 URL 복사 → 위 입력란에 붙여넣기</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 flex-shrink-0">5</span>
                    <span>완료! B2C 예약 페이지에 네이버 예약 버튼이 자동 표시됩니다</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Service menu */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
              <Storefront size={14} className="text-zinc-600" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-800">
              서비스 메뉴
            </h2>
          </div>
          <button className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-all duration-300 hover:bg-zinc-200 active:scale-[0.98]">
            <Plus size={12} weight="bold" />
            카테고리 추가
          </button>
        </div>

        <div className="space-y-3">
          {services.map((category: any) => {
            const isExpanded = expandedCategories.includes(category.category);
            return (
              <div
                key={category.category}
                className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden"
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="flex items-center justify-between w-full px-6 py-4 transition-colors duration-200 hover:bg-zinc-50/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-800">
                      {category.category}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-500 tabular-nums">
                      {category.items.length}개
                    </span>
                  </div>
                  <CaretDown
                    size={14}
                    className={cn(
                      'text-zinc-400 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                      isExpanded && 'rotate-180',
                    )}
                  />
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="border-t border-zinc-100">
                    {category.items.map((item: any, idx: number) => (
                      <div
                        key={item.name}
                        className={cn(
                          'flex flex-col sm:grid sm:grid-cols-[1fr_80px_100px_32px] gap-1 sm:gap-4 sm:items-center px-4 sm:px-6 py-3 sm:py-3.5',
                          idx < category.items.length - 1 &&
                            'border-b border-zinc-50',
                        )}
                      >
                        <div className="flex items-center justify-between sm:contents">
                          <span className="text-sm text-zinc-700">
                            {item.name}
                          </span>
                          <button className="sm:order-last flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 transition-colors duration-200 group">
                            <Trash
                              size={13}
                              className="text-zinc-400 group-hover:text-red-500 transition-colors duration-200"
                            />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 sm:contents">
                          <span className="text-xs font-mono text-zinc-500 tabular-nums sm:text-right">
                            {item.duration}분
                          </span>
                          <span className="text-sm font-mono font-medium text-zinc-800 tabular-nums sm:text-right">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Add service row */}
                    <button className="flex items-center gap-2 w-full px-6 py-3 text-xs font-medium text-zinc-500 border-t border-zinc-100 transition-colors duration-200 hover:bg-zinc-50/60 hover:text-zinc-700">
                      <Plus size={12} weight="bold" />
                      서비스 추가
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3 pb-8">
        {saveError && (
          <span className="text-xs text-red-500">{saveError}</span>
        )}
        <button
          onClick={async () => {
            if (!shopId) return;
            setSaveError('');
            try {
              await updateShop.mutateAsync({
                id: shopId,
                data: {
                  name: shop.name,
                  businessType: shop.businessType,
                  phone: shop.phone,
                  address: shop.address,
                  businessHours: shop.businessHours,
                  naverBookingUrl: shop.naverBookingUrl || null,
                  naverPlaceId: shop.naverPlaceId || null,
                  kakaoChannelUrl: shop.kakaoChannelUrl || null,
                  instagramUrl: shop.instagramUrl || null,
                },
              });
              toast('success', '매장 정보가 저장되었습니다');
            } catch (err: any) {
              setSaveError(err.message || '저장에 실패했습니다');
              toast('error', err.message || '저장에 실패했습니다');
            }
          }}
          disabled={updateShop.isPending}
          className="group relative flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60"
        >
          {updateShop.isPending ? (
            <SpinnerGap size={16} className="animate-spin" />
          ) : (
            <FloppyDisk size={16} weight="bold" />
          )}
          {updateShop.isPending ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}

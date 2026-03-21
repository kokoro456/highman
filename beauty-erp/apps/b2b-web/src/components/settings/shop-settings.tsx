'use client';

import { useState, useEffect } from 'react';
import {
  FloppyDisk,
  CaretDown,
  Plus,
  Trash,
  Clock,
  Storefront,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import { useShop } from '@/hooks/use-shop';
import { useServiceCategories } from '@/hooks/use-services';
import { useAuthStore } from '@/lib/auth-store';

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
  });
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (shopData && !initialized) {
      const bh = shopData.businessHours ?? defaultBusinessHours;
      setShop({
        name: shopData.name ?? '',
        businessType: shopData.businessType ?? 'NAIL',
        phone: shopData.phone ?? '',
        address: shopData.address ?? '',
        businessHours: typeof bh === 'object' ? bh : defaultBusinessHours,
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
                  'flex items-center gap-4 px-6 py-4',
                  idx < 6 && 'border-b border-zinc-50',
                )}
              >
                {/* Day label */}
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

                {/* Time inputs */}
                {hours.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
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
                  <span className="text-sm text-zinc-400 flex-1">휴무</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Service menu */}
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
                    {category.items.map((item, idx) => (
                      <div
                        key={item.name}
                        className={cn(
                          'grid grid-cols-[1fr_80px_100px_32px] gap-4 items-center px-6 py-3.5',
                          idx < category.items.length - 1 &&
                            'border-b border-zinc-50',
                        )}
                      >
                        <span className="text-sm text-zinc-700">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono text-zinc-500 tabular-nums text-right">
                          {item.duration}분
                        </span>
                        <span className="text-sm font-mono font-medium text-zinc-800 tabular-nums text-right">
                          {formatCurrency(item.price)}
                        </span>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 transition-colors duration-200 group">
                          <Trash
                            size={13}
                            className="text-zinc-400 group-hover:text-red-500 transition-colors duration-200"
                          />
                        </button>
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
      <div className="flex justify-end pb-8">
        <button className="group relative flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98]">
          <FloppyDisk size={16} weight="bold" />
          저장하기
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAdminStats, useAdminShops } from '@/hooks/use-admin';
import { formatCurrency } from '@/lib/utils';
import {
  Storefront,
  Users,
  CalendarDots,
  CurrencyCircleDollar,
  MagnifyingGlass,
  ArrowRight,
} from '@phosphor-icons/react';

export function AdminDashboard() {
  const [search, setSearch] = useState('');
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: shops, isLoading: shopsLoading } = useAdminShops(search || undefined);

  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  if (statsLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">관리자 대시보드</h1>
          <p className="mt-1 text-sm text-zinc-500">플랫폼 전체 현황</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-zinc-100 animate-pulse" />
      </div>
    );
  }

  const statCards = [
    {
      label: '전체 매장',
      value: String(stats?.totalShops ?? 0),
      unit: '개',
      icon: Storefront,
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand-600',
    },
    {
      label: '전체 사용자',
      value: String(stats?.totalUsers ?? 0),
      unit: '명',
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '오늘 예약',
      value: String(stats?.todayBookings ?? 0),
      unit: '건',
      icon: CalendarDots,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: '오늘 매출',
      value: formatCurrency(stats?.todayRevenue ?? 0),
      unit: '',
      icon: CurrencyCircleDollar,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          관리자 대시보드
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          플랫폼 전체 현황을 확인하세요
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
                  <Icon size={16} className={stat.iconColor} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight text-zinc-900 font-mono">
                  {stat.value}
                </span>
                {stat.unit && <span className="text-sm text-zinc-400">{stat.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shop List */}
      <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-medium text-zinc-700">매장 목록</h2>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="매장 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl bg-zinc-50 ring-1 ring-zinc-200/50 focus:ring-brand-300 focus:outline-none transition-all duration-200 w-48 md:w-64"
            />
          </div>
        </div>

        {shopsLoading ? (
          <div className="p-8 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500 mx-auto" />
          </div>
        ) : !shops || shops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-4">
              <Storefront size={28} weight="regular" className="text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600">
              {search ? '검색 결과가 없습니다' : '등록된 매장이 없습니다'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">매장명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">대표</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">플랜</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">오늘 예약</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">오늘 매출</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">총 고객</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {shops.map((shop: any) => (
                    <tr
                      key={shop.id}
                      onClick={() => setSelectedShopId(selectedShopId === shop.id ? null : shop.id)}
                      className="hover:bg-zinc-50/50 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {shop.name?.[0] ?? 'B'}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-800">{shop.name}</p>
                            <p className="text-xs text-zinc-400">{shop.businessType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{shop.owner?.name ?? '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                          {shop.subscriptionTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums text-zinc-700">
                        {shop.todayBookings}건
                      </td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums text-zinc-700">
                        {formatCurrency(shop.todayRevenue)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums text-zinc-700">
                        {shop.totalCustomers}명
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-zinc-100">
              {shops.map((shop: any) => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(selectedShopId === shop.id ? null : shop.id)}
                  className="w-full px-4 py-4 text-left hover:bg-zinc-50/50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {shop.name?.[0] ?? 'B'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{shop.name}</p>
                        <p className="text-xs text-zinc-400">{shop.owner?.name ?? '-'} &middot; {shop.subscriptionTier}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-zinc-400 shrink-0" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-zinc-50 px-2 py-1.5">
                      <p className="text-xs text-zinc-500">오늘 예약</p>
                      <p className="text-sm font-mono font-medium text-zinc-800">{shop.todayBookings}</p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 px-2 py-1.5">
                      <p className="text-xs text-zinc-500">오늘 매출</p>
                      <p className="text-sm font-mono font-medium text-zinc-800">{formatCurrency(shop.todayRevenue)}</p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 px-2 py-1.5">
                      <p className="text-xs text-zinc-500">총 고객</p>
                      <p className="text-sm font-mono font-medium text-zinc-800">{shop.totalCustomers}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Selected shop detail */}
      {selectedShopId && (
        <ShopDetailCard shopId={selectedShopId} onClose={() => setSelectedShopId(null)} />
      )}
    </div>
  );
}

function ShopDetailCard({ shopId, onClose }: { shopId: string; onClose: () => void }) {
  const { data: shop, isLoading } = useAdminShops();
  const shopData = (shop ?? []).find((s: any) => s.id === shopId);

  if (isLoading || !shopData) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50 shadow-soft">
        <div className="h-32 rounded-xl bg-zinc-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 md:p-6 ring-1 ring-zinc-200/50 shadow-soft animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
            {shopData.name?.[0] ?? 'B'}
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">{shopData.name}</h3>
            <p className="text-xs text-zinc-400">
              {shopData.owner?.name} &middot; {shopData.businessType} &middot; {shopData.subscriptionTier}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          닫기
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-zinc-50 p-3 text-center">
          <p className="text-xs text-zinc-500">총 예약</p>
          <p className="text-lg font-semibold font-mono text-zinc-900">{shopData.totalBookings}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 text-center">
          <p className="text-xs text-zinc-500">총 고객</p>
          <p className="text-lg font-semibold font-mono text-zinc-900">{shopData.totalCustomers}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 text-center">
          <p className="text-xs text-zinc-500">직원 수</p>
          <p className="text-lg font-semibold font-mono text-zinc-900">{shopData.totalStaff}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 text-center">
          <p className="text-xs text-zinc-500">오늘 매출</p>
          <p className="text-lg font-semibold font-mono text-zinc-900">{formatCurrency(shopData.todayRevenue)}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  CalendarDots,
  Users,
  CreditCard,
  UserCircle,
  ChartBar,
  ChartLine,
  GearSix,
  Sparkle,
  List,
  X,
  Scissors,
  SignOut,
  Package,
  CaretUpDown,
  Check,
  Plus,
  Wallet,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { useShop, useMyShops } from '@/hooks/use-shop';
import { useQueryClient } from '@tanstack/react-query';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: ChartBar },
  { href: '/bookings', label: '예약 관리', icon: CalendarDots },
  { href: '/customers', label: '고객 관리', icon: Users },
  { href: '/payments', label: '매출/결제', icon: CreditCard },
  { href: '/reports', label: '보고서', icon: ChartLine },
  { href: '/staff', label: '직원 관리', icon: UserCircle },
  { href: '/settlement', label: '정산 관리', icon: Wallet },
  { href: '/inventory', label: '재고 관리', icon: Package },
  { href: '/settings', label: '매장 설정', icon: GearSix },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopSwitcherOpen, setShopSwitcherOpen] = useState(false);
  const shopSwitcherRef = useRef<HTMLDivElement>(null);
  const { shopId, setShopId, logout } = useAuthStore();
  const { data: shop } = useShop(shopId || '');
  const { data: myShops } = useMyShops();

  // Close shop switcher on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shopSwitcherRef.current && !shopSwitcherRef.current.contains(e.target as Node)) {
        setShopSwitcherOpen(false);
      }
    }
    if (shopSwitcherOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [shopSwitcherOpen]);

  function handleShopSwitch(newShopId: string) {
    if (newShopId === shopId) {
      setShopSwitcherOpen(false);
      return;
    }
    setShopId(newShopId);
    setShopSwitcherOpen(false);
    // Invalidate all queries so data reloads for new shop
    queryClient.invalidateQueries();
    router.push('/dashboard');
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 flex md:hidden h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft"
      >
        <List size={20} className="text-zinc-700" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] bg-white border-r border-zinc-200/60',
          'flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
              <Scissors size={16} weight="bold" className="text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              Beauty ERP
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X size={18} className="text-zinc-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                  isActive
                    ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200/50'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                )}
              >
                <Icon
                  size={20}
                  weight={isActive ? 'fill' : 'regular'}
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? 'text-brand-500' : 'text-zinc-400 group-hover:text-zinc-600',
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom - Shop switcher + Logout */}
        <div className="border-t border-zinc-100 p-4 space-y-2">
          <div className="relative" ref={shopSwitcherRef}>
            <button
              onClick={() => setShopSwitcherOpen(!shopSwitcherOpen)}
              className="w-full rounded-xl bg-zinc-50/80 p-3 ring-1 ring-zinc-200/40 hover:ring-zinc-300/60 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_2px_8px_rgba(16,185,129,0.25)]">
                  {shop?.name?.[0] ?? 'B'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-zinc-800 truncate">
                    {shop?.name ?? '매장명'}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {shop?.subscriptionTier ?? 'Free Plan'}
                  </p>
                </div>
                <CaretUpDown size={14} className="text-zinc-400 shrink-0" />
              </div>
            </button>

            {/* Shop switcher dropdown */}
            {shopSwitcherOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft-lg overflow-hidden animate-fade-in z-50">
                <div className="px-3 py-2 border-b border-zinc-100">
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">매장 선택</p>
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {(myShops ?? []).map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() => handleShopSwitch(s.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150',
                        s.id === shopId ? 'bg-brand-50/60' : 'hover:bg-zinc-50',
                      )}
                    >
                      <div className="h-7 w-7 rounded-md bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {s.name?.[0] ?? 'B'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-800 truncate">{s.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{s.subscriptionTier ?? 'Free'}</p>
                      </div>
                      {s.id === shopId && (
                        <Check size={14} weight="bold" className="text-brand-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-zinc-100">
                  <Link
                    href="/settings?new=true"
                    onClick={() => { setShopSwitcherOpen(false); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-brand-600 hover:bg-brand-50/60 transition-colors duration-150"
                  >
                    <Plus size={14} weight="bold" />
                    새 매장 등록
                  </Link>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <SignOut size={18} weight="regular" />
            로그아웃
          </button>
        </div>
      </aside>
    </>
  );
}

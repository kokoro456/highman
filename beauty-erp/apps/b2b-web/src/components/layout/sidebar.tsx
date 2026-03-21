'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDots,
  Users,
  CreditCard,
  UserCircle,
  ChartBar,
  GearSix,
  Sparkle,
  List,
  X,
  Scissors,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: ChartBar },
  { href: '/bookings', label: '예약 관리', icon: CalendarDots },
  { href: '/customers', label: '고객 관리', icon: Users },
  { href: '/payments', label: '매출/결제', icon: CreditCard },
  { href: '/staff', label: '직원 관리', icon: UserCircle },
  { href: '/settings', label: '매장 설정', icon: GearSix },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            const isActive = pathname === item.href;
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

        {/* Bottom - Shop info */}
        <div className="border-t border-zinc-100 p-4">
          <div className="rounded-xl bg-zinc-50/80 p-3 ring-1 ring-zinc-200/40">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_2px_8px_rgba(16,185,129,0.25)]">
                B
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-800 truncate">
                  Beauty Nail Studio
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  Professional Plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

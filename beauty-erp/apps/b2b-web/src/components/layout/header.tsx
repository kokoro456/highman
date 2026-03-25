'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  MagnifyingGlass,
  CaretDown,
  SignOut,
  CalendarDots,
  XCircle,
  Warning,
  CurrencyCircleDollar,
  Check,
  UserCircle,
  Sun,
  Moon,
  Monitor,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { useThemeStore } from '@/lib/theme-store';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications';

const notificationTypeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  BOOKING_NEW: { icon: CalendarDots, color: 'text-[#FF6B6B]', bg: 'bg-[#FF6B6B15]' },
  BOOKING_CANCEL: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  NO_SHOW: { icon: UserCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  LOW_STOCK: { icon: Warning, color: 'text-[#FFA502]', bg: 'bg-[#FFA50215]' },
  PAYMENT: { icon: CurrencyCircleDollar, color: 'text-[#4ECDC4]', bg: 'bg-[#4ECDC415]' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const { theme, setTheme } = useThemeStore();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: notifData } = useNotifications({ limit: 10 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notifData?.data ?? [];

  // Close notification panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const userName = user?.email?.split('@')[0] || 'User';
  const initial = userName.charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function handleNotificationClick(notif: any) {
    if (!notif.isRead) {
      markRead.mutate(notif.id);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-[#FFE4E0] dark:border-[#323264] bg-white/80 dark:bg-[#1A1A2E]/80 backdrop-blur-xl px-3 md:px-8">
      {/* Search - full bar on desktop, icon on mobile */}
      <div className="hidden md:flex items-center gap-2 rounded-xl bg-[#FFF8F6] dark:bg-[#1E1E3C] px-3 py-2 ring-1 ring-[#FFE4E0] dark:ring-[#323264] w-full max-w-xs transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-[#FF6B6B] focus-within:ring-2 focus-within:bg-white dark:focus-within:bg-[#16213E]">
        <MagnifyingGlass size={16} className="text-[#636E72]" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-sm text-[#2D3436] dark:text-zinc-100 placeholder:text-[#636E72] dark:placeholder:text-zinc-500 outline-none"
        />
        <kbd className="inline-flex h-5 items-center rounded border border-[#FFE4E0] dark:border-[#323264] bg-white dark:bg-[#16213E] px-1.5 text-[10px] font-mono text-[#636E72]">
          /
        </kbd>
      </div>
      {/* Mobile search icon */}
      <button className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[#FFF5F5] dark:hover:bg-[#1E1E3C] transition-all duration-200 active:scale-95">
        <MagnifyingGlass size={20} className="text-[#636E72] dark:text-zinc-400" />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4">
        {/* Theme toggle */}
        <button
          onClick={() => {
            const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
            setTheme(next);
          }}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[#FFF5F5] dark:hover:bg-[#1E1E3C] transition-all duration-200 active:scale-95"
          title={theme === 'light' ? '라이트 모드' : theme === 'dark' ? '다크 모드' : '시스템 설정'}
        >
          {theme === 'light' && <Sun size={20} className="text-[#FFA502]" />}
          {theme === 'dark' && <Moon size={20} className="text-[#FFD93D]" />}
          {theme === 'system' && <Monitor size={20} className="text-[#636E72] dark:text-zinc-400" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[#FFF5F5] dark:hover:bg-[#1E1E3C] transition-all duration-200 active:scale-95"
          >
            <Bell size={20} className="text-[#636E72] dark:text-zinc-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6B6B] px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#1A1A2E]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 z-50 w-80 md:w-96 rounded-2xl bg-white dark:bg-[#16213E] ring-1 ring-[#FFE4E0] dark:ring-[#323264] shadow-soft-xl animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#FFE4E0] dark:border-[#323264]">
                <p className="text-sm font-semibold text-[#2D3436] dark:text-zinc-200">알림</p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="flex items-center gap-1 text-xs font-medium text-[#FF6B6B] hover:text-[#FF5252] transition-colors"
                  >
                    <Check size={12} weight="bold" />
                    모두 읽음
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="mx-auto text-[#FFE4E0]" />
                    <p className="mt-2 text-xs text-[#636E72]">새로운 알림이 없습니다</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => {
                    const typeConfig = notificationTypeConfig[notif.type] ?? notificationTypeConfig.BOOKING_NEW;
                    const Icon = typeConfig.icon;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 border-b border-[#FFE4E0]/50 last:border-0',
                          notif.isRead ? 'bg-white hover:bg-[#FFF8F6]' : 'bg-[#FF6B6B08] hover:bg-[#FF6B6B12]',
                        )}
                      >
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5', typeConfig.bg)}>
                          <Icon size={14} weight="fill" className={typeConfig.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              'text-xs truncate',
                              notif.isRead ? 'font-medium text-[#2D3436]' : 'font-semibold text-[#2D3436]',
                            )}>
                              {notif.title}
                            </p>
                            {!notif.isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B6B] shrink-0" />
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#636E72] line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="mt-1 text-[10px] font-mono text-[#636E72]/70 tabular-nums">
                            {timeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#FFF5F5] dark:hover:bg-[#1E1E3C] transition-all duration-200 active:scale-[0.98]"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#FFA07A] flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <span className="hidden md:block text-sm font-medium text-[#2D3436] dark:text-zinc-300">
              {userName}
            </span>
            <CaretDown size={12} className="text-[#636E72]" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-2xl bg-white dark:bg-[#16213E] p-1 ring-1 ring-[#FFE4E0] dark:ring-[#323264] shadow-soft-lg animate-fade-in">
                <div className="px-3 py-2 border-b border-[#FFE4E0] dark:border-[#323264]">
                  <p className="text-xs font-medium text-[#2D3436] dark:text-zinc-200">{user?.email}</p>
                  <p className="text-[10px] text-[#636E72] dark:text-zinc-500">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 mt-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <SignOut size={16} />
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

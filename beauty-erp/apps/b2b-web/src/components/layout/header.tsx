'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, MagnifyingGlass, CaretDown, SignOut } from '@phosphor-icons/react';
import { useAuthStore } from '@/lib/auth-store';

export function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const userName = user?.email?.split('@')[0] || 'User';
  const initial = userName.charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-3 md:px-8">
      {/* Search - full bar on desktop, icon on mobile */}
      <div className="hidden md:flex items-center gap-2 rounded-xl bg-zinc-50/80 px-3 py-2 ring-1 ring-zinc-200/40 w-full max-w-xs transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
        <MagnifyingGlass size={16} className="text-zinc-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
        />
        <kbd className="inline-flex h-5 items-center rounded border border-zinc-200 bg-white px-1.5 text-[10px] font-mono text-zinc-400">
          /
        </kbd>
      </div>
      {/* Mobile search icon */}
      <button className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-100 transition-all duration-200 active:scale-95">
        <MagnifyingGlass size={20} className="text-zinc-500" />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-100 transition-all duration-200 active:scale-95">
          <Bell size={20} className="text-zinc-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-zinc-100 transition-all duration-200 active:scale-[0.98]"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <span className="hidden md:block text-sm font-medium text-zinc-700">
              {userName}
            </span>
            <CaretDown size={12} className="text-zinc-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-white p-1 ring-1 ring-zinc-200/50 shadow-soft-lg animate-fade-in">
                <div className="px-3 py-2 border-b border-zinc-100">
                  <p className="text-xs font-medium text-zinc-800">{user?.email}</p>
                  <p className="text-[10px] text-zinc-400">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 mt-1 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

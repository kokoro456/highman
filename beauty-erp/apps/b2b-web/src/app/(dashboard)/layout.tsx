'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ToastContainer } from '@/components/ui/toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [isReady, setIsReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken) {
      router.replace('/login');
    } else {
      setIsReady(true);
    }
  }, [hydrated, accessToken, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#FFF8F6] dark:bg-[#1A1A2E]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B6B30] border-t-[#FF6B6B]" />
          <p className="text-sm text-zinc-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#FFF8F6] dark:bg-[#1A1A2E]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-[var(--sidebar-width)]">
        <Header />
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1400px]">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

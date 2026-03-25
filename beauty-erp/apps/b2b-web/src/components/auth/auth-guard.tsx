'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Read directly from localStorage (Zustand persist stores here)
    try {
      const stored = localStorage.getItem('beauty-erp-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.accessToken) {
          setIsReady(true);
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    router.replace('/login');
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#FFF8F6]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[#FF6B6B]" />
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { SpinnerGap, WarningCircle } from '@phosphor-icons/react';

export default function NaverCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><SpinnerGap size={32} className="animate-spin text-brand-500" /></div>}>
      <NaverCallbackContent />
    </Suspense>
  );
}

function NaverCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, setUser, setShopId } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) {
      setError('인증 코드가 없습니다. 다시 시도해주세요.');
      return;
    }

    const handleCallback = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${API_BASE}/api/auth/naver/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || data.message || '네이버 로그인에 실패했습니다');
        }

        setTokens(data.data.accessToken, data.data.refreshToken);

        // Decode JWT to get user info
        const payload = JSON.parse(atob(data.data.accessToken.split('.')[1]));
        setUser({ sub: payload.sub, email: payload.email, role: payload.role });

        // Fetch shops
        const shopsRes = await fetch(`${API_BASE}/api/shops`, {
          headers: { Authorization: `Bearer ${data.data.accessToken}` },
        });
        const shopsData = await shopsRes.json();
        if (shopsData.data?.length > 0) {
          setShopId(shopsData.data[0].id);
          router.push('/dashboard');
        } else {
          router.push('/settings?onboarding=true');
        }
      } catch (err: any) {
        setError(err.message || '네이버 로그인에 실패했습니다');
      }
    };

    handleCallback();
  }, [searchParams, router, setTokens, setUser, setShopId]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-[420px] animate-slide-up">
          <div className="rounded-[2.5rem] bg-white/60 p-1.5 ring-1 ring-zinc-200/50 shadow-soft-xl backdrop-blur-sm">
            <div className="rounded-[calc(2.5rem-0.375rem)] bg-white p-8 md:p-10 text-center">
              <div className="flex justify-center mb-4">
                <WarningCircle size={48} className="text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-2">로그인 실패</h2>
              <p className="text-sm text-zinc-500 mb-6">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <SpinnerGap size={32} className="animate-spin text-brand-500 mx-auto mb-4" />
        <p className="text-sm text-zinc-500">네이버 로그인 처리 중...</p>
      </div>
    </div>
  );
}

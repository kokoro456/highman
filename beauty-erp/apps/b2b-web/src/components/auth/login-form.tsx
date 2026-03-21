'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeSlash, Sparkle, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [socialStatus, setSocialStatus] = useState<{ kakao: boolean; naver: boolean }>({ kakao: false, naver: false });
  const { setTokens, setShopId, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${API_BASE}/api/auth/social/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setSocialStatus(data.data);
      })
      .catch(() => {});
  }, []);

  const handleSocialLogin = async (provider: 'kakao' | 'naver') => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/auth/${provider}`);
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch {
      setError(`${provider === 'kakao' ? '카카오' : '네이버'} 로그인을 시작할 수 없습니다`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || '로그인에 실패했습니다');
      }

      setTokens(data.data.accessToken, data.data.refreshToken);

      // Decode JWT to get user info
      const payload = JSON.parse(atob(data.data.accessToken.split('.')[1]));
      setUser({ sub: payload.sub, email: payload.email, role: payload.role });

      // Fetch shops and set first shop with data
      const shopsRes = await fetch(`${API_BASE}/api/shops`, {
        headers: { 'Authorization': `Bearer ${data.data.accessToken}` },
      });
      const shopsData = await shopsRes.json();
      if (shopsData.data?.length > 0) {
        // Prefer the main shop that has service data
        const mainShop = shopsData.data.find((s: any) => s.name === 'Beauty Nail Studio');
        setShopId(mainShop?.id || shopsData.data[0].id);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] animate-slide-up">
      {/* Outer Shell (Double-Bezel) */}
      <div className="rounded-[2.5rem] bg-white/60 p-1.5 ring-1 ring-zinc-200/50 shadow-soft-xl backdrop-blur-sm">
        {/* Inner Core */}
        <div className="rounded-[calc(2.5rem-0.375rem)] bg-white p-8 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
          {/* Logo / Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 ring-1 ring-brand-200/50 mb-6">
              <Sparkle size={12} weight="fill" className="text-brand-500" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-700">
                Beauty ERP
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              매장 관리 대시보드에 로그인하세요
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200/50 mb-2">
              <WarningCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">
                이메일
              </label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 또는 아이디"
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">
                비밀번호
              </label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <div className="flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8자 이상 입력"
                    className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="mr-3 text-zinc-400 hover:text-zinc-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button (Button-in-Button) */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'group relative flex w-full items-center justify-between',
                'rounded-full bg-zinc-900 px-6 py-3.5 text-sm font-medium text-white',
                'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                'hover:bg-zinc-800 active:scale-[0.98]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              <span>{isLoading ? '로그인 중...' : '로그인'}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/20">
                <ArrowRight size={16} weight="bold" />
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200/60" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 font-medium">
              또는
            </span>
            <div className="h-px flex-1 bg-zinc-200/60" />
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              disabled={!socialStatus.kakao}
              title={!socialStatus.kakao ? '준비 중' : undefined}
              className={cn(
                'group flex w-full items-center justify-center gap-2.5 rounded-full bg-[#FEE500] px-6 py-3 text-sm font-medium text-zinc-900 ring-1 ring-[#FEE500] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-95 active:scale-[0.98]',
                !socialStatus.kakao && 'opacity-50 cursor-not-allowed hover:brightness-100',
              )}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.82 1.86 5.28 4.68 6.66-.18.66-.66 2.4-.72 2.76-.12.48.18.48.36.36.18-.06 2.52-1.68 3.54-2.4.66.12 1.38.18 2.14.18 5.52 0 10-3.48 10-7.56S17.52 3 12 3z"/>
              </svg>
              카카오로 시작하기
              {!socialStatus.kakao && <span className="text-[10px] text-zinc-500 ml-1">(준비 중)</span>}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('naver')}
              disabled={!socialStatus.naver}
              title={!socialStatus.naver ? '준비 중' : undefined}
              className={cn(
                'group flex w-full items-center justify-center gap-2.5 rounded-full bg-[#03C75A] px-6 py-3 text-sm font-medium text-white ring-1 ring-[#03C75A] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-95 active:scale-[0.98]',
                !socialStatus.naver && 'opacity-50 cursor-not-allowed hover:brightness-100',
              )}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M16.27 10.55L7.72 4.69C7.31 4.41 6.76 4.56 6.55 5L3.08 11.92c-.2.43.04.94.5 1.06l3.2.84.84 3.2c.12.46.63.7 1.06.5L15.6 14.05c.43-.21.58-.76.3-1.17l-3.17-4.84"/>
              </svg>
              네이버로 시작하기
              {!socialStatus.naver && <span className="text-[10px] text-white/60 ml-1">(준비 중)</span>}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-zinc-400">
            계정이 없으신가요?{' '}
            <Link
              href="/register"
              className="text-brand-600 font-medium hover:text-brand-700 transition-colors duration-200"
            >
              무료로 시작하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

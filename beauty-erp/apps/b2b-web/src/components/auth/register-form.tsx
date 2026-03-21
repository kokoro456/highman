'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeSlash, Sparkle, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const { setTokens, setUser, setShopId } = useAuthStore();
  const router = useRouter();

  function validate(): boolean {
    const errors: FormErrors = {};

    if (!name.trim()) {
      errors.name = '이름을 입력하세요';
    }

    if (!email.trim()) {
      errors.email = '이메일을 입력하세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      errors.password = '비밀번호를 입력하세요';
    } else if (password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          phone: phone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle conflict (duplicate email)
        if (res.status === 409) {
          throw new Error('이미 등록된 이메일입니다');
        }
        throw new Error(data.error?.message || data.message || '회원가입에 실패했습니다');
      }

      // Auto-login: set tokens from response
      setTokens(data.data.accessToken, data.data.refreshToken);

      // Decode JWT to get user info
      const payload = JSON.parse(atob(data.data.accessToken.split('.')[1]));
      setUser({ sub: payload.sub, email: payload.email, role: payload.role });

      // Check if user has shops - new user won't have any
      const shopsRes = await fetch(`${API_BASE}/api/shops`, {
        headers: { 'Authorization': `Bearer ${data.data.accessToken}` },
      });
      const shopsData = await shopsRes.json();

      if (shopsData.data?.length > 0) {
        setShopId(shopsData.data[0].id);
        router.push('/dashboard');
      } else {
        // New user needs to create a shop - redirect to settings
        router.push('/settings?onboarding=true');
      }
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] animate-slide-up">
      <div className="rounded-[2.5rem] bg-white/60 p-1.5 ring-1 ring-zinc-200/50 shadow-soft-xl backdrop-blur-sm">
        <div className="rounded-[calc(2.5rem-0.375rem)] bg-white p-8 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 ring-1 ring-brand-200/50 mb-6">
              <Sparkle size={12} weight="fill" className="text-brand-500" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-700">
                Beauty ERP
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              매장을 등록하세요
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              무료로 시작하고 언제든 업그레이드하세요
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200/50 mb-4">
              <WarningCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">이름</label>
              <div className={cn(
                'rounded-xl bg-zinc-50/80 p-0.5 ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-2 focus-within:bg-white',
                fieldErrors.name
                  ? 'ring-red-300 focus-within:ring-red-400'
                  : 'ring-zinc-200/60 focus-within:ring-brand-400',
              )}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="홍길동"
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-red-500 pl-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">이메일</label>
              <div className={cn(
                'rounded-xl bg-zinc-50/80 p-0.5 ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-2 focus-within:bg-white',
                fieldErrors.email
                  ? 'ring-red-300 focus-within:ring-red-400'
                  : 'ring-zinc-200/60 focus-within:ring-brand-400',
              )}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="name@example.com"
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 pl-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">전화번호</label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678 (선택)"
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">비밀번호</label>
              <div className={cn(
                'rounded-xl bg-zinc-50/80 p-0.5 ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-2 focus-within:bg-white',
                fieldErrors.password
                  ? 'ring-red-300 focus-within:ring-red-400'
                  : 'ring-zinc-200/60 focus-within:ring-brand-400',
              )}>
                <div className="flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    placeholder="영문 + 숫자, 8자 이상"
                    className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="mr-3 text-zinc-400 hover:text-zinc-600 transition-colors duration-200">
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-500 pl-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'group relative flex w-full items-center justify-between',
                'rounded-full bg-zinc-900 px-6 py-3.5 text-sm font-medium text-white',
                'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                'hover:bg-zinc-800 active:scale-[0.98]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'mt-6',
              )}
            >
              <span>{isLoading ? '등록 중...' : '무료로 시작하기'}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/20">
                <ArrowRight size={16} weight="bold" />
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-400">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors duration-200">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

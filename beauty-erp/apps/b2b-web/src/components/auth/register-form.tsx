'use client';

import { useState, useEffect } from 'react';
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
  const [socialStatus, setSocialStatus] = useState<{ kakao: boolean; naver: boolean }>({ kakao: false, naver: false });
  const { setTokens, setUser, setShopId } = useAuthStore();
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
      <div className="rounded-[2.5rem] bg-white/60 p-1.5 ring-1 ring-[#FFE4E0] shadow-soft-xl backdrop-blur-sm">
        <div className="rounded-[calc(2.5rem-0.375rem)] bg-white p-8 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FF6B6B15] px-3 py-1 ring-1 ring-[#FF6B6B30] mb-6">
              <Sparkle size={12} weight="fill" className="text-[#FF6B6B]" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#FF6B6B]">
                Beauty ERP
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#2D3436]">
              매장을 등록하세요
            </h1>
            <p className="mt-1.5 text-sm text-[#636E72]">
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
              <label className="text-xs font-medium text-[#636E72] pl-1">이름</label>
              <div className={cn(
                'rounded-xl bg-[#FFF8F6] p-0.5 ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-2 focus-within:bg-white',
                fieldErrors.name
                  ? 'ring-red-300 focus-within:ring-red-400'
                  : 'ring-[#FFE4E0] focus-within:ring-[#FF6B6B]',
              )}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="홍길동"
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-[#2D3436] placeholder:text-[#636E72]/60 outline-none"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-red-500 pl-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#636E72] pl-1">이메일</label>
              <div className={cn(
                'rounded-xl bg-[#FFF8F6] p-0.5 ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-2 focus-within:bg-white',
                fieldErrors.email
                  ? 'ring-red-300 focus-within:ring-red-400'
                  : 'ring-[#FFE4E0] focus-within:ring-[#FF6B6B]',
              )}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="name@example.com"
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-[#2D3436] placeholder:text-[#636E72]/60 outline-none"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 pl-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#636E72] pl-1">전화번호</label>
              <div className="rounded-xl bg-[#FFF8F6] p-0.5 ring-1 ring-[#FFE4E0] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-[#FF6B6B] focus-within:ring-2 focus-within:bg-white">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678 (선택)"
                  className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-[#2D3436] placeholder:text-[#636E72]/60 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#636E72] pl-1">비밀번호</label>
              <div className={cn(
                'rounded-xl bg-[#FFF8F6] p-0.5 ring-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-2 focus-within:bg-white',
                fieldErrors.password
                  ? 'ring-red-300 focus-within:ring-red-400'
                  : 'ring-[#FFE4E0] focus-within:ring-[#FF6B6B]',
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
                    className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-[#2D3436] placeholder:text-[#636E72]/60 outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="mr-3 text-[#636E72] hover:text-[#2D3436] transition-colors duration-200">
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
                'rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] px-6 py-3.5 text-sm font-medium text-white',
                'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                'hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'shadow-[0_4px_15px_rgba(255,107,107,0.3)]',
                'mt-6',
              )}
            >
              <span>{isLoading ? '등록 중...' : '무료로 시작하기'}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/30">
                <ArrowRight size={16} weight="bold" />
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#FFE4E0]" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#636E72] font-medium">
              또는
            </span>
            <div className="h-px flex-1 bg-[#FFE4E0]" />
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

          <p className="mt-8 text-center text-xs text-[#636E72]">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-[#FF6B6B] font-medium hover:text-[#FF5252] transition-colors duration-200">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeSlash, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">이름</label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <input type="text" placeholder="홍길동" className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">이메일</label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <input type="email" placeholder="name@example.com" className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">전화번호</label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <input type="tel" placeholder="010-1234-5678" className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 pl-1">비밀번호</label>
              <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
                <div className="flex items-center">
                  <input type={showPassword ? 'text' : 'password'} placeholder="영문 + 숫자, 8자 이상" className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="mr-3 text-zinc-400 hover:text-zinc-600 transition-colors duration-200">
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
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

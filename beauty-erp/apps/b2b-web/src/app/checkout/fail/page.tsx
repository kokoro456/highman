'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" /></div>}>
      <CheckoutFailContent />
    </Suspense>
  );
}

function CheckoutFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-800 mb-2">결제에 실패했습니다</h2>
        <p className="text-zinc-500 text-sm mb-6">
          {message || '결제 처리 중 오류가 발생했습니다.'}
        </p>

        <div className="bg-zinc-50 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
          {code && (
            <div className="flex justify-between">
              <span className="text-zinc-500">오류 코드</span>
              <span className="font-mono text-xs font-medium text-zinc-800">{code}</span>
            </div>
          )}
          {orderId && (
            <div className="flex justify-between">
              <span className="text-zinc-500">주문번호</span>
              <span className="font-mono text-xs font-medium text-zinc-800">{orderId}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium text-sm hover:bg-zinc-200 transition-colors"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}

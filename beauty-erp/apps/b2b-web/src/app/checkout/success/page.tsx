'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PaymentResult {
  orderId: string;
  amount: number;
  method: string | null;
  productName: string;
  customerName: string | null;
  approvedAt: string | null;
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" /></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');
  const amount = searchParams.get('amount');

  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !paymentKey || !amount) {
      setError('잘못된 결제 정보입니다');
      setLoading(false);
      return;
    }

    async function confirmPayment() {
      try {
        const res = await fetch(`${API_BASE}/api/pg/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            paymentKey,
            amount: Number(amount),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || '결제 승인에 실패했습니다');
        }

        setResult(data.data);
      } catch (e: any) {
        setError(e.message || '결제 승인 처리 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    }

    confirmPayment();
  }, [orderId, paymentKey, amount]);

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  }

  function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  const methodLabels: Record<string, string> = {
    카드: '카드',
    CARD: '카드',
    가상계좌: '가상계좌',
    VIRTUAL_ACCOUNT: '가상계좌',
    계좌이체: '계좌이체',
    TRANSFER: '계좌이체',
    휴대폰: '휴대폰',
    MOBILE_PHONE: '휴대폰',
    간편결제: '간편결제',
    EASY_PAY: '간편결제',
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
          <p className="text-sm text-zinc-400">결제 승인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-800 mb-2">결제 실패</h2>
          <p className="text-zinc-500 text-sm mb-6">{error}</p>
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

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-800 mb-2">결제가 완료되었습니다</h2>
        <p className="text-zinc-500 text-sm mb-6">정상적으로 결제가 처리되었습니다.</p>

        {result && (
          <div className="bg-zinc-50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">주문번호</span>
              <span className="font-mono text-xs font-medium text-zinc-800">{result.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">상품</span>
              <span className="font-medium text-zinc-800">{result.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">결제수단</span>
              <span className="font-medium text-zinc-800">
                {result.method ? (methodLabels[result.method] || result.method) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">결제금액</span>
              <span className="font-semibold text-emerald-600">
                {formatPrice(Number(result.amount))}
              </span>
            </div>
            {result.approvedAt && (
              <div className="flex justify-between">
                <span className="text-zinc-500">결제일시</span>
                <span className="font-medium text-zinc-800">
                  {formatDateTime(result.approvedAt)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

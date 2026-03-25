'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface OrderData {
  orderId: string;
  amount: number;
  productName: string;
  customerName: string | null;
  customerPhone: string | null;
  shop: { name: string };
}

export default function CheckoutPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [clientKey, setClientKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paymentWidgetRef = useRef<any>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);

  // Load order data and client key
  useEffect(() => {
    async function loadData() {
      try {
        const [orderRes, keyRes] = await Promise.all([
          fetch(`${API_BASE}/api/pg/orders?orderId=${orderId}`).then((r) => r.json()),
          fetch(`${API_BASE}/api/pg/client-key`).then((r) => r.json()),
        ]);
        setOrder(orderRes.data);
        setClientKey(keyRes.data.clientKey);
      } catch (e: any) {
        setError('주문 정보를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderId]);

  // Load Toss Payments SDK and render widget
  useEffect(() => {
    if (!clientKey || !order) return;

    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment-widget';
    script.async = true;
    script.onload = () => {
      try {
        const paymentWidget = (window as any).PaymentWidget(clientKey, (window as any).PaymentWidget.ANONYMOUS);
        paymentWidgetRef.current = paymentWidget;

        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: Number(order.amount) },
          { variantKey: 'DEFAULT' },
        );
        paymentMethodsWidgetRef.current = paymentMethodsWidget;

        paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });
      } catch (e: any) {
        setError('결제 위젯을 초기화할 수 없습니다');
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [clientKey, order]);

  async function handlePayment() {
    if (!paymentWidgetRef.current || !order) return;

    const successUrl = `${window.location.origin}/checkout/success`;
    const failUrl = `${window.location.origin}/checkout/fail`;

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId: order.orderId,
        orderName: order.productName,
        customerName: order.customerName || undefined,
        customerMobilePhone: order.customerPhone?.replace(/-/g, '') || undefined,
        successUrl,
        failUrl,
      });
    } catch (e: any) {
      // User cancelled or error
      if (e.code !== 'USER_CANCEL') {
        setError(e.message || '결제 요청에 실패했습니다');
      }
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FFF8F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B6B30] border-t-[#FF6B6B]" />
          <p className="text-sm text-zinc-400">주문 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FFF8F6] px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-800 mb-2">오류</h1>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFF8F6]">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-semibold text-zinc-800 text-center">결제하기</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-800">주문 정보</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">매장</span>
              <span className="font-medium text-zinc-800">{order?.shop?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">상품</span>
              <span className="font-medium text-zinc-800">{order?.productName}</span>
            </div>
            {order?.customerName && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">고객명</span>
                <span className="font-medium text-zinc-800">{order.customerName}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#FFE4E0] flex justify-between">
              <span className="text-sm font-medium text-zinc-700">결제 금액</span>
              <span className="text-lg font-bold text-[#4ECDC4]">
                {order && formatPrice(Number(order.amount))}
              </span>
            </div>
          </div>
        </div>

        {/* Toss Payment Widget */}
        <div id="payment-widget" className="rounded-2xl overflow-hidden" />

        {/* Agreement Widget */}
        <div id="agreement" className="rounded-2xl overflow-hidden" />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePayment}
          className="w-full py-4 rounded-xl bg-[#0064FF] text-white font-semibold text-base hover:bg-[#0052D4] transition-colors shadow-sm"
        >
          {order && formatPrice(Number(order.amount))} 결제하기
        </button>
      </div>
    </div>
  );
}

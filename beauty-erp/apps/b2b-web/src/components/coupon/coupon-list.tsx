'use client';

import { useState, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Copy,
  Percent,
  CurrencyKrw,
  CalendarBlank,
  Users,
  SpinnerGap,
  Prohibit,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  useCoupons,
  useCreateCoupon,
  useDeactivateCoupon,
  type Coupon,
} from '@/hooks/use-coupons';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

// ---- Helpers ----

function formatDateKr(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getCouponStatus(coupon: Coupon): { label: string; className: string } {
  if (!coupon.isActive) {
    return { label: '비활성', className: 'bg-zinc-100 text-zinc-500' };
  }
  const now = new Date();
  if (new Date(coupon.endDate) < now) {
    return { label: '만료', className: 'bg-red-50 text-red-600' };
  }
  if (new Date(coupon.startDate) > now) {
    return { label: '대기', className: 'bg-yellow-50 text-yellow-700' };
  }
  if (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage) {
    return { label: '소진', className: 'bg-orange-50 text-orange-600' };
  }
  return { label: '활성', className: 'bg-[#FF6B6B15] text-[#FF6B6B]' };
}

// ---- Create Coupon Modal ----

function CreateCouponModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createCoupon = useCreateCoupon();
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'FIXED' as 'FIXED' | 'PERCENTAGE',
    value: '',
    minAmount: '',
    maxDiscount: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    maxUsage: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleAutoCode() {
    setForm((p) => ({ ...p, code: generateCode() }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.code.trim()) errs.code = '쿠폰 코드를 입력하세요';
    if (!form.name.trim()) errs.name = '쿠폰 이름을 입력하세요';
    if (!form.value || Number(form.value) <= 0) errs.value = '할인 값을 입력하세요';
    if (form.type === 'PERCENTAGE' && Number(form.value) > 100)
      errs.value = '비율은 100 이하여야 합니다';
    if (!form.startDate) errs.startDate = '시작일을 입력하세요';
    if (!form.endDate) errs.endDate = '종료일을 입력하세요';
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      errs.endDate = '종료일은 시작일 이후여야 합니다';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createCoupon.mutateAsync({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type,
        value: Number(form.value),
        minAmount: form.minAmount ? Number(form.minAmount) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
      });
      toast('success', '쿠폰이 생성되었습니다');
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast('error', err.message || '쿠폰 생성에 실패했습니다');
    }
  }

  function resetForm() {
    setForm({
      code: '',
      name: '',
      type: 'FIXED',
      value: '',
      minAmount: '',
      maxDiscount: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      maxUsage: '',
    });
    setErrors({});
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
      title="쿠폰 생성"
      description="새로운 쿠폰을 생성합니다"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Code */}
        <div>
          <label className="text-xs font-medium text-zinc-600">쿠폰 코드</label>
          <div className="mt-1 flex gap-2">
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="flex-1 rounded-xl border-0 bg-[#FFF8F6] px-4 py-2.5 text-sm font-mono ring-1 ring-[#FFE4E0] focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
              placeholder="SUMMER2026"
            />
            <button
              type="button"
              onClick={handleAutoCode}
              className="rounded-xl bg-zinc-100 px-3 py-2.5 text-xs font-medium text-zinc-600 ring-1 ring-[#FFE4E0] hover:bg-zinc-200 transition-all active:scale-[0.98]"
              title="자동 생성"
            >
              <ArrowsClockwise size={16} weight="bold" />
            </button>
          </div>
          {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-medium text-zinc-600">쿠폰 이름</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-xl border-0 bg-[#FFF8F6] px-4 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
            placeholder="예: 여름 할인 쿠폰"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Type & Value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-600">할인 유형</label>
            <div className="mt-1 flex gap-2">
              {(['FIXED', 'PERCENTAGE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={cn(
                    'flex-1 rounded-xl py-2.5 text-xs font-medium ring-1 transition-all',
                    form.type === t
                      ? 'bg-[#FF6B6B15] text-[#FF6B6B] ring-[#FF6B6B30]'
                      : 'bg-zinc-50 text-zinc-500 ring-[#FFE4E0] hover:bg-zinc-100',
                  )}
                >
                  {t === 'FIXED' ? '금액할인' : '비율할인'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">
              할인 {form.type === 'FIXED' ? '금액 (원)' : '비율 (%)'}
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="mt-1 w-full rounded-xl border-0 bg-[#FFF8F6] px-4 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
              placeholder="0"
              min={0}
              max={form.type === 'PERCENTAGE' ? 100 : undefined}
            />
            {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
          </div>
        </div>

        {/* Min amount & max discount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-600">최소 주문 금액 (선택)</label>
            <input
              type="number"
              value={form.minAmount}
              onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
              className="mt-1 w-full rounded-xl border-0 bg-[#FFF8F6] px-4 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
              placeholder="0"
              min={0}
            />
          </div>
          {form.type === 'PERCENTAGE' && (
            <div>
              <label className="text-xs font-medium text-zinc-600">최대 할인 금액 (선택)</label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                className="mt-1 w-full rounded-xl border-0 bg-[#FFF8F6] px-4 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
                placeholder="0"
                min={0}
              />
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-600">시작일</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="mt-1 w-full rounded-xl border-0 bg-[#FFF8F6] px-4 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
            />
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">종료일</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="mt-1 w-full rounded-xl border-0 bg-[#FFF8F6] px-4 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
            />
            {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
          </div>
        </div>

        {/* Max usage */}
        <div>
          <label className="text-xs font-medium text-zinc-600">최대 사용 횟수 (선택, 비워두면 무제한)</label>
          <input
            type="number"
            value={form.maxUsage}
            onChange={(e) => setForm({ ...form, maxUsage: e.target.value })}
            className="mt-1 w-full rounded-xl border-0 bg-[#FFF8F6] px-4 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
            placeholder="무제한"
            min={1}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-200 active:scale-[0.98]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={createCoupon.isPending}
            className="flex items-center gap-2 rounded-full bg-[#FF6B6B] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#FF5252] active:scale-[0.98] disabled:opacity-60"
          >
            {createCoupon.isPending && <SpinnerGap size={16} className="animate-spin" />}
            생성
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---- Coupon Card ----

function CouponCard({
  coupon,
  onDeactivate,
}: {
  coupon: Coupon;
  onDeactivate: (id: string) => void;
}) {
  const status = getCouponStatus(coupon);
  const isFixed = coupon.type === 'FIXED';

  function handleCopyCode() {
    navigator.clipboard.writeText(coupon.code);
    toast('success', '쿠폰 코드가 복사되었습니다');
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden transition-all duration-300 hover:shadow-soft-lg">
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Icon */}
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl shrink-0',
            isFixed ? 'bg-blue-50' : 'bg-purple-50',
          )}
        >
          {isFixed ? (
            <CurrencyKrw size={20} weight="bold" className="text-blue-500" />
          ) : (
            <Percent size={20} weight="bold" className="text-purple-500" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-zinc-800 truncate">{coupon.name}</p>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0', status.className)}>
              {status.label}
            </span>
          </div>

          {/* Code */}
          <button
            onClick={handleCopyCode}
            className="mt-1 flex items-center gap-1 group"
            title="코드 복사"
          >
            <span className="font-mono text-xs font-semibold text-[#FF6B6B] tracking-wider">
              {coupon.code}
            </span>
            <Copy
              size={12}
              className="text-zinc-400 group-hover:text-[#FF6B6B] transition-colors"
            />
          </button>

          {/* Details */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              {isFixed ? (
                <>
                  <CurrencyKrw size={12} />
                  {formatCurrency(Number(coupon.value))} 할인
                </>
              ) : (
                <>
                  <Percent size={12} />
                  {Number(coupon.value)}% 할인
                  {coupon.maxDiscount && (
                    <span className="text-zinc-400">(최대 {formatCurrency(Number(coupon.maxDiscount))})</span>
                  )}
                </>
              )}
            </span>
            <span className="flex items-center gap-1">
              <CalendarBlank size={12} />
              {formatDateKr(coupon.startDate)} ~ {formatDateKr(coupon.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {coupon.usedCount}{coupon.maxUsage !== null ? `/${coupon.maxUsage}` : ''} 사용
            </span>
            {coupon.minAmount && Number(coupon.minAmount) > 0 && (
              <span className="text-zinc-400">
                최소 {formatCurrency(Number(coupon.minAmount))}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {coupon.isActive && !coupon.isExpired && (
          <button
            onClick={() => onDeactivate(coupon.id)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 ring-1 ring-red-200/50 hover:bg-red-100 transition-all active:scale-[0.98]"
            title="비활성화"
          >
            <Prohibit size={14} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Main Component ----

export function CouponList() {
  const [tab, setTab] = useState<'active' | 'expired'>('active');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useCoupons({ page, status: tab });
  const deactivateCoupon = useDeactivateCoupon();

  const coupons = data?.data ?? [];
  const meta = data?.meta;

  async function handleDeactivate(id: string) {
    try {
      await deactivateCoupon.mutateAsync(id);
      toast('success', '쿠폰이 비활성화되었습니다');
    } catch (err: any) {
      toast('error', err.message || '비활성화에 실패했습니다');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">쿠폰 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">쿠폰을 생성하고 사용 현황을 관리합니다</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#FF6B6B] px-5 py-2.5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)] transition-all duration-300 hover:bg-[#FF5252] hover:shadow-[0_4px_16px_rgba(255,107,107,0.35)] hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          쿠폰 생성
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-zinc-100/80 p-1 w-fit">
        {(['active', 'expired'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={cn(
              'rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200',
              tab === t
                ? 'bg-white text-zinc-900 shadow-soft'
                : 'text-zinc-500 hover:text-zinc-700',
            )}
          >
            {t === 'active' ? '활성 쿠폰' : '만료/비활성'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#FFE4E0] shadow-soft">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            {tab === 'active' ? '활성 쿠폰' : '만료/비활성'}
          </p>
          <p className="text-lg font-semibold font-mono text-zinc-900 tabular-nums">
            {meta?.total ?? 0}
          </p>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#FFE4E0] animate-pulse" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
            <Ticket size={24} className="text-zinc-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-600">
            {tab === 'active' ? '활성 쿠폰이 없습니다' : '만료/비활성 쿠폰이 없습니다'}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {tab === 'active' ? '새 쿠폰을 생성해서 프로모션을 시작해보세요' : '만료되거나 비활성화된 쿠폰이 여기에 표시됩니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white ring-1 ring-[#FFE4E0] hover:bg-[#FFF5F5] disabled:opacity-40 transition-all"
          >
            이전
          </button>
          <span className="text-xs font-mono text-zinc-500 tabular-nums">
            {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
            disabled={page >= meta.totalPages}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white ring-1 ring-[#FFE4E0] hover:bg-[#FFF5F5] disabled:opacity-40 transition-all"
          >
            다음
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateCouponModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/ui/form-input';
import { useCustomers } from '@/hooks/use-customers';
import { useStaff } from '@/hooks/use-staff';
import { useCreatePayment, usePasses } from '@/hooks/use-payments';
import { formatCurrency } from '@/lib/utils';
import { SpinnerGap } from '@phosphor-icons/react';
import { toast } from '@/components/ui/toast';

interface PaymentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const methodOptions = [
  { value: 'CARD', label: '카드' },
  { value: 'CASH', label: '현금' },
  { value: 'TRANSFER', label: '이체' },
  { value: 'PASS', label: '정기권' },
  { value: 'MIXED', label: '복합' },
];

export function PaymentFormModal({ open, onOpenChange }: PaymentFormModalProps) {
  const [form, setForm] = useState({
    customerId: '',
    staffId: '',
    amount: '',
    discount: '0',
    method: '',
    passId: '',
    memo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const { data: customerData } = useCustomers({ page: 1, limit: 100 });
  const { data: staffList } = useStaff();
  const { data: passes } = usePasses(form.customerId || undefined);
  const createPayment = useCreatePayment();

  const customers = customerData?.data ?? [];
  const staff = staffList ?? [];
  const passList = passes ?? [];

  const customerOptions = customers.map((c: any) => ({
    value: c.id,
    label: `${c.name} (${c.phone ?? ''})`,
  }));

  const staffOptions = staff.map((s: any) => ({
    value: s.id,
    label: s.name,
  }));

  const passOptions = passList.map((p: any) => ({
    value: p.id,
    label: `${p.name ?? '정기권'} (잔여: ${p.remainingCount ?? p.remaining ?? '-'})`,
  }));

  const finalAmount = useMemo(() => {
    const amt = Number(form.amount) || 0;
    const disc = Number(form.discount) || 0;
    return Math.max(0, amt - disc);
  }, [form.amount, form.discount]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.customerId) errs.customerId = '고객을 선택하세요';
    if (!form.staffId) errs.staffId = '담당자를 선택하세요';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = '금액을 입력하세요';
    if (!form.method) errs.method = '결제 방법을 선택하세요';
    if (form.method === 'PASS' && !form.passId) errs.passId = '정기권을 선택하세요';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    try {
      await createPayment.mutateAsync({
        customerId: form.customerId,
        staffId: form.staffId,
        amount: Number(form.amount),
        discount: Number(form.discount) || 0,
        finalAmount,
        method: form.method,
        passId: form.method === 'PASS' ? form.passId : undefined,
        memo: form.memo || undefined,
      });
      onOpenChange(false);
      resetForm();
      toast('success', '결제가 완료되었습니다');
    } catch (err: any) {
      setSubmitError(err.message || '결제 등록에 실패했습니다');
      toast('error', err.message || '결제 등록에 실패했습니다');
    }
  }

  function resetForm() {
    setForm({
      customerId: '',
      staffId: '',
      amount: '',
      discount: '0',
      method: '',
      passId: '',
      memo: '',
    });
    setErrors({});
    setSubmitError('');
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
      title="결제 등록"
      description="새로운 결제를 등록합니다"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect
          label="고객"
          value={form.customerId}
          onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value, passId: '' }))}
          options={customerOptions}
          error={errors.customerId}
        />

        <FormSelect
          label="담당자"
          value={form.staffId}
          onChange={(e) => setForm((p) => ({ ...p, staffId: e.target.value }))}
          options={staffOptions}
          error={errors.staffId}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="금액"
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            error={errors.amount}
            min={0}
          />
          <FormInput
            label="할인"
            type="number"
            placeholder="0"
            value={form.discount}
            onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
            min={0}
          />
        </div>

        {/* Final amount display */}
        <div className="flex items-center justify-between rounded-xl bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200/40">
          <span className="text-xs font-medium text-zinc-500">최종 결제 금액</span>
          <span className="text-base font-semibold font-mono text-zinc-900 tabular-nums">
            {formatCurrency(finalAmount)}
          </span>
        </div>

        <FormSelect
          label="결제 방법"
          value={form.method}
          onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
          options={methodOptions}
          error={errors.method}
        />

        {form.method === 'PASS' && (
          <FormSelect
            label="정기권 선택"
            value={form.passId}
            onChange={(e) => setForm((p) => ({ ...p, passId: e.target.value }))}
            options={passOptions}
            error={errors.passId}
          />
        )}

        <FormTextarea
          label="메모"
          placeholder="결제 관련 메모 (선택사항)"
          value={form.memo}
          onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
        />

        {submitError && (
          <p className="text-xs text-red-500 pl-1">{submitError}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-200 active:scale-[0.98]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={createPayment.isPending}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60"
          >
            {createPayment.isPending && <SpinnerGap size={16} className="animate-spin" />}
            결제 등록
          </button>
        </div>
      </form>
    </Modal>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/ui/form-input';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/use-customers';
import { SpinnerGap } from '@phosphor-icons/react';
import { toast } from '@/components/ui/toast';

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: any; // If provided, editing mode
}

const genderOptions = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'OTHER', label: '기타' },
];

export function CustomerFormModal({ open, onOpenChange, customer }: CustomerFormModalProps) {
  const isEditing = !!customer;
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    birthDate: '',
    tags: '',
    marketingConsent: false,
    memo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const mutation = isEditing ? updateCustomer : createCustomer;

  useEffect(() => {
    if (customer && open) {
      setForm({
        name: customer.name ?? '',
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        gender: customer.gender ?? '',
        birthDate: customer.birthDate ? customer.birthDate.slice(0, 10) : '',
        tags: (customer.tags ?? []).join(', '),
        marketingConsent: customer.marketingConsent ?? false,
        memo: customer.memo ?? '',
      });
    }
  }, [customer, open]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '이름을 입력하세요';
    if (!form.phone.trim()) errs.phone = '전화번호를 입력하세요';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      gender: form.gender || undefined,
      birthDate: form.birthDate || undefined,
      tags,
      marketingConsent: form.marketingConsent,
      memo: form.memo || undefined,
    };

    try {
      if (isEditing) {
        await updateCustomer.mutateAsync({ id: customer.id, data: payload });
      } else {
        await createCustomer.mutateAsync(payload);
      }
      onOpenChange(false);
      resetForm();
      toast('success', isEditing ? '고객 정보가 수정되었습니다' : '고객이 등록되었습니다');
    } catch (err: any) {
      setSubmitError(err.message || '저장에 실패했습니다');
      toast('error', err.message || '저장에 실패했습니다');
    }
  }

  function resetForm() {
    setForm({
      name: '',
      phone: '',
      email: '',
      gender: '',
      birthDate: '',
      tags: '',
      marketingConsent: false,
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
      title={isEditing ? '고객 수정' : '고객 등록'}
      description={isEditing ? '고객 정보를 수정합니다' : '새로운 고객을 등록합니다'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="이름"
          placeholder="고객 이름"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          error={errors.name}
          required
        />

        <FormInput
          label="전화번호"
          type="tel"
          placeholder="010-0000-0000"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          error={errors.phone}
          required
        />

        <FormInput
          label="이메일"
          type="email"
          placeholder="email@example.com (선택)"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="성별"
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            options={genderOptions}
          />
          <FormInput
            label="생년월일"
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
          />
        </div>

        <FormInput
          label="태그"
          placeholder="VIP, 신규 (쉼표로 구분)"
          value={form.tags}
          onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
        />

        {/* Marketing consent checkbox */}
        <div className="flex items-center gap-3 pl-1">
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, marketingConsent: !p.marketingConsent }))}
            className={`flex h-5 w-5 items-center justify-center rounded-md ring-1 transition-all duration-200 ${
              form.marketingConsent
                ? 'bg-[#FF6B6B] ring-[#FF6B6B]'
                : 'bg-white ring-zinc-300 hover:ring-zinc-400'
            }`}
          >
            {form.marketingConsent && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-xs font-medium text-zinc-600">마케팅 수신 동의</span>
        </div>

        <FormTextarea
          label="메모"
          placeholder="고객 관련 메모 (선택사항)"
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
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_15px_rgba(255,107,107,0.3)] px-6 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98] disabled:opacity-60"
          >
            {mutation.isPending && <SpinnerGap size={16} className="animate-spin" />}
            {isEditing ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

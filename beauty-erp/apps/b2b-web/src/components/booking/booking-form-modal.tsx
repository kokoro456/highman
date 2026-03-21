'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/ui/form-input';
import { useCustomers } from '@/hooks/use-customers';
import { useStaff } from '@/hooks/use-staff';
import { useServiceCategories } from '@/hooks/use-services';
import { useCreateBooking } from '@/hooks/use-bookings';
import { formatCurrency } from '@/lib/utils';
import { SpinnerGap } from '@phosphor-icons/react';
import { toast } from '@/components/ui/toast';

interface BookingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

export function BookingFormModal({ open, onOpenChange, selectedDate }: BookingFormModalProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [form, setForm] = useState({
    customerId: '',
    staffId: '',
    serviceId: '',
    date: selectedDate ? formatDateInput(selectedDate) : formatDateInput(new Date()),
    time: '10:00',
    memo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const { data: customerData } = useCustomers({ page: 1, limit: 50, search: customerSearch || undefined });
  const { data: staffList } = useStaff();
  const { data: serviceCategories } = useServiceCategories();
  const createBooking = useCreateBooking();

  const customers = customerData?.data ?? [];
  const staff = staffList ?? [];
  const categories = serviceCategories ?? [];

  // Build flat service options with optgroup-style labels
  const serviceOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    categories.forEach((cat: any) => {
      const catName = cat.name ?? cat.category ?? '';
      const services = cat.services ?? cat.items ?? [];
      services.forEach((s: any) => {
        opts.push({
          value: s.id,
          label: `[${catName}] ${s.name}`,
        });
      });
    });
    return opts;
  }, [categories]);

  // Find selected service details
  const selectedService = useMemo(() => {
    for (const cat of categories) {
      const services = cat.services ?? cat.items ?? [];
      const found = services.find((s: any) => s.id === form.serviceId);
      if (found) return found;
    }
    return null;
  }, [categories, form.serviceId]);

  const customerOptions = customers.map((c: any) => ({
    value: c.id,
    label: `${c.name} (${c.phone ?? ''})`,
  }));

  const staffOptions = staff.map((s: any) => ({
    value: s.id,
    label: s.name,
  }));

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.customerId) errs.customerId = '고객을 선택하세요';
    if (!form.staffId) errs.staffId = '담당자를 선택하세요';
    if (!form.serviceId) errs.serviceId = '서비스를 선택하세요';
    if (!form.date) errs.date = '날짜를 선택하세요';
    if (!form.time) errs.time = '시간을 선택하세요';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const startTime = new Date(`${form.date}T${form.time}:00`);

    try {
      await createBooking.mutateAsync({
        customerId: form.customerId,
        staffId: form.staffId,
        serviceId: form.serviceId,
        startTime: startTime.toISOString(),
        memo: form.memo || undefined,
      });
      onOpenChange(false);
      resetForm();
      toast('success', '예약이 등록되었습니다');
    } catch (err: any) {
      setSubmitError(err.message || '예약 등록에 실패했습니다');
      toast('error', err.message || '예약 등록에 실패했습니다');
    }
  }

  function resetForm() {
    setForm({
      customerId: '',
      staffId: '',
      serviceId: '',
      date: selectedDate ? formatDateInput(selectedDate) : formatDateInput(new Date()),
      time: '10:00',
      memo: '',
    });
    setErrors({});
    setSubmitError('');
    setCustomerSearch('');
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
      title="예약 등록"
      description="새로운 예약을 등록합니다"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer search + select */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600 pl-1">고객</label>
          <div className="rounded-xl bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/60 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2 focus-within:bg-white">
            <input
              type="text"
              placeholder="고객명 또는 전화번호 검색"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
            />
          </div>
          <FormSelect
            label=""
            value={form.customerId}
            onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))}
            options={customerOptions}
            error={errors.customerId}
          />
        </div>

        <FormSelect
          label="담당자"
          value={form.staffId}
          onChange={(e) => setForm((p) => ({ ...p, staffId: e.target.value }))}
          options={staffOptions}
          error={errors.staffId}
        />

        <FormSelect
          label="서비스"
          value={form.serviceId}
          onChange={(e) => setForm((p) => ({ ...p, serviceId: e.target.value }))}
          options={serviceOptions}
          error={errors.serviceId}
        />

        {/* Show duration and price when service selected */}
        {selectedService && (
          <div className="flex items-center gap-4 rounded-xl bg-zinc-50/80 px-4 py-2.5 ring-1 ring-zinc-200/40">
            <span className="text-xs text-zinc-500">
              소요시간: <span className="font-mono font-medium text-zinc-700">{selectedService.duration}분</span>
            </span>
            <span className="text-xs text-zinc-500">
              가격: <span className="font-mono font-medium text-zinc-700">{formatCurrency(Number(selectedService.price ?? 0))}</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="날짜"
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            error={errors.date}
          />
          <FormInput
            label="시간"
            type="time"
            value={form.time}
            onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
            error={errors.time}
          />
        </div>

        <FormTextarea
          label="메모"
          placeholder="예약 관련 메모 (선택사항)"
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
            disabled={createBooking.isPending}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60"
          >
            {createBooking.isPending && <SpinnerGap size={16} className="animate-spin" />}
            예약 등록
          </button>
        </div>
      </form>
    </Modal>
  );
}

function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

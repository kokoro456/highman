'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/ui/form-input';
import { useCreateStaff, useUpdateStaff } from '@/hooks/use-staff';
import { cn } from '@/lib/utils';
import { SpinnerGap } from '@phosphor-icons/react';

interface StaffFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: any; // If provided, editing mode
}

const roleOptions = [
  { value: 'OWNER', label: '원장' },
  { value: 'MANAGER', label: '매니저' },
  { value: 'DESIGNER', label: '디자이너' },
  { value: 'ASSISTANT', label: '어시스턴트' },
  { value: 'INTERN', label: '인턴' },
];

const presetColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export function StaffFormModal({ open, onOpenChange, staff }: StaffFormModalProps) {
  const isEditing = !!staff;
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    color: presetColors[0],
    specialties: '',
    hireDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const mutation = isEditing ? updateStaff : createStaff;

  useEffect(() => {
    if (staff && open) {
      setForm({
        name: staff.name ?? '',
        phone: staff.phone ?? '',
        email: staff.email ?? '',
        role: staff.role ?? '',
        color: staff.color ?? presetColors[0],
        specialties: (staff.specialties ?? []).join(', '),
        hireDate: staff.hireDate ? staff.hireDate.slice(0, 10) : '',
      });
    }
  }, [staff, open]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '이름을 입력하세요';
    if (!form.phone.trim()) errs.phone = '전화번호를 입력하세요';
    if (!form.role) errs.role = '역할을 선택하세요';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const specialties = form.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      role: form.role,
      color: form.color,
      specialties,
      hiredAt: form.hireDate || new Date().toISOString().split('T')[0],
    };

    try {
      if (isEditing) {
        await updateStaff.mutateAsync({ id: staff.id, data: payload });
      } else {
        await createStaff.mutateAsync(payload);
      }
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      setSubmitError(err.message || '저장에 실패했습니다');
    }
  }

  function resetForm() {
    setForm({
      name: '',
      phone: '',
      email: '',
      role: '',
      color: presetColors[0],
      specialties: '',
      hireDate: '',
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
      title={isEditing ? '직원 수정' : '직원 등록'}
      description={isEditing ? '직원 정보를 수정합니다' : '새로운 직원을 등록합니다'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="이름"
          placeholder="직원 이름"
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

        <FormSelect
          label="역할"
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          options={roleOptions}
          error={errors.role}
        />

        {/* Color picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600 pl-1">색상</label>
          <div className="flex items-center gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((p) => ({ ...p, color }))}
                className={cn(
                  'h-8 w-8 rounded-full transition-all duration-200',
                  form.color === color
                    ? 'ring-2 ring-offset-2 ring-zinc-900 scale-110'
                    : 'hover:scale-105',
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <FormInput
          label="전문 분야"
          placeholder="커트, 펌, 염색 (쉼표로 구분)"
          value={form.specialties}
          onChange={(e) => setForm((p) => ({ ...p, specialties: e.target.value }))}
        />

        <FormInput
          label="입사일"
          type="date"
          value={form.hireDate}
          onChange={(e) => setForm((p) => ({ ...p, hireDate: e.target.value }))}
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
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60"
          >
            {mutation.isPending && <SpinnerGap size={16} className="animate-spin" />}
            {isEditing ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

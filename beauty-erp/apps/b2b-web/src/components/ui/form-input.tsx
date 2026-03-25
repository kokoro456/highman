'use client';

import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, className, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#636E72] pl-1">{label}</label>
      <div className={cn(
        'rounded-xl bg-[#FFF8F6] p-0.5 ring-1 ring-[#FFE4E0]',
        'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'focus-within:ring-[#FF6B6B] focus-within:ring-2 focus-within:bg-white',
        error && 'ring-red-400 ring-2',
      )}>
        <input
          className={cn(
            'w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-2.5 text-sm text-[#2D3436]',
            'placeholder:text-[#636E72]/60 outline-none',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, error, options, className, ...props }: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#636E72] pl-1">{label}</label>
      <div className={cn(
        'rounded-xl bg-[#FFF8F6] p-0.5 ring-1 ring-[#FFE4E0]',
        'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'focus-within:ring-[#FF6B6B] focus-within:ring-2 focus-within:bg-white',
        error && 'ring-red-400 ring-2',
      )}>
        <select
          className={cn(
            'w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-2.5 text-sm text-[#2D3436] outline-none',
            className,
          )}
          {...props}
        >
          <option value="">선택하세요</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function FormTextarea({ label, error, className, ...props }: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#636E72] pl-1">{label}</label>
      <div className={cn(
        'rounded-xl bg-[#FFF8F6] p-0.5 ring-1 ring-[#FFE4E0]',
        'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'focus-within:ring-[#FF6B6B] focus-within:ring-2 focus-within:bg-white',
        error && 'ring-red-400 ring-2',
      )}>
        <textarea
          className={cn(
            'w-full rounded-[calc(0.75rem-2px)] bg-transparent px-4 py-2.5 text-sm text-[#2D3436]',
            'placeholder:text-[#636E72]/60 outline-none resize-none',
            className,
          )}
          rows={3}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  );
}

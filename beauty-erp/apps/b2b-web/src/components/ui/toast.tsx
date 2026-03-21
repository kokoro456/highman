'use client';

import { create } from 'zustand';
import { CheckCircle, XCircle, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: 'success' | 'error', message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(type: 'success' | 'error', message: string) {
  useToastStore.getState().addToast(type, message);
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-3 shadow-soft-lg animate-slide-up min-w-[280px] max-w-[400px]',
            t.type === 'success' && 'bg-brand-50 ring-1 ring-brand-200/50',
            t.type === 'error' && 'bg-red-50 ring-1 ring-red-200/50',
          )}
        >
          {t.type === 'success' ? (
            <CheckCircle size={20} weight="fill" className="text-brand-500 shrink-0" />
          ) : (
            <XCircle size={20} weight="fill" className="text-red-500 shrink-0" />
          )}
          <p className={cn(
            'text-sm font-medium flex-1',
            t.type === 'success' ? 'text-brand-800' : 'text-red-800',
          )}>
            {t.message}
          </p>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 text-zinc-400 hover:text-zinc-600"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

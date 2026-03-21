'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onOpenChange, title, description, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-zinc-900/20 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'rounded-[2rem] bg-white p-1.5 ring-1 ring-zinc-200/50 shadow-soft-xl',
            'data-[state=open]:animate-slide-up',
            'max-h-[85vh] overflow-hidden',
            size === 'sm' && 'w-full max-w-[400px]',
            size === 'md' && 'w-full max-w-[520px]',
            size === 'lg' && 'w-full max-w-[640px]',
          )}
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white overflow-y-auto max-h-[calc(85vh-12px)]">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 pt-6 pb-4 border-b border-zinc-100">
              <div>
                <Dialog.Title className="text-lg font-semibold tracking-tight text-zinc-900">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-xs text-zinc-500">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors">
                <X size={16} className="text-zinc-500" />
              </Dialog.Close>
            </div>
            <div className="px-6 py-5">
              {children}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

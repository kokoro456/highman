'use client';

import { useState } from 'react';
import {
  Package,
  Plus,
  MagnifyingGlass,
  Warning,
  ArrowDown,
  ArrowUp,
  Equals,
  Clock,
  SpinnerGap,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  useInventory,
  useCreateInventoryItem,
  useAddInventoryLog,
  useInventoryLogs,
} from '@/hooks/use-inventory';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

const logTypeConfig = {
  IN: { label: '입고', icon: ArrowDown, color: 'text-brand-600', bg: 'bg-brand-50' },
  OUT: { label: '출고', icon: ArrowUp, color: 'text-red-600', bg: 'bg-red-50' },
  ADJUST: { label: '조정', icon: Equals, color: 'text-blue-600', bg: 'bg-blue-50' },
};

function formatDateKr(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// --- Add Item Modal ---
function AddItemModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const createItem = useCreateInventoryItem();
  const [form, setForm] = useState({
    name: '', category: '', unit: '개', quantity: 0, minQuantity: 5, price: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await createItem.mutateAsync({
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        unit: form.unit,
        quantity: form.quantity,
        minQuantity: form.minQuantity,
        price: form.price,
      });
      toast('success', '재고 항목이 추가되었습니다');
      setForm({ name: '', category: '', unit: '개', quantity: 0, minQuantity: 5, price: 0 });
      onOpenChange(false);
    } catch (err: any) {
      toast('error', err.message || '추가에 실패했습니다');
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="재고 항목 추가" description="새 재고 항목을 등록합니다">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-zinc-600">품명 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-xl border-0 bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200/60 focus:ring-2 focus:ring-brand-400 outline-none transition-all"
              placeholder="예: 젤 네일 베이스"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">카테고리</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-xl border-0 bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200/60 focus:ring-2 focus:ring-brand-400 outline-none transition-all"
              placeholder="예: 네일 재료"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">단위</label>
            <input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="mt-1 w-full rounded-xl border-0 bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200/60 focus:ring-2 focus:ring-brand-400 outline-none transition-all"
              placeholder="개"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">초기 수량</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full rounded-xl border-0 bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200/60 focus:ring-2 focus:ring-brand-400 outline-none transition-all"
              min={0}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">최소 수량 (경고)</label>
            <input
              type="number"
              value={form.minQuantity}
              onChange={(e) => setForm({ ...form, minQuantity: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full rounded-xl border-0 bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200/60 focus:ring-2 focus:ring-brand-400 outline-none transition-all"
              min={0}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-zinc-600">단가 (원)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full rounded-xl border-0 bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200/60 focus:ring-2 focus:ring-brand-400 outline-none transition-all"
              min={0}
            />
          </div>
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
            disabled={createItem.isPending}
            className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
          >
            {createItem.isPending && <SpinnerGap size={16} className="animate-spin" />}
            추가
          </button>
        </div>
      </form>
    </Modal>
  );
}

// --- Stock Adjustment Modal ---
function StockAdjustModal({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: { id: string; name: string; quantity: number; unit: string } | null;
}) {
  const addLog = useAddInventoryLog();
  const [form, setForm] = useState({ type: 'IN' as 'IN' | 'OUT' | 'ADJUST', quantity: 0, memo: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item || form.quantity <= 0) return;
    try {
      await addLog.mutateAsync({
        id: item.id,
        data: { type: form.type, quantity: form.quantity, memo: form.memo || undefined },
      });
      toast('success', '재고가 변경되었습니다');
      setForm({ type: 'IN', quantity: 0, memo: '' });
      onOpenChange(false);
    } catch (err: any) {
      toast('error', err.message || '재고 변경에 실패했습니다');
    }
  }

  if (!item) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="재고 조정" description={item.name} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600">조정 유형</label>
          <div className="mt-1 flex gap-2">
            {(['IN', 'OUT', 'ADJUST'] as const).map((type) => {
              const config = logTypeConfig[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type })}
                  className={cn(
                    'flex-1 rounded-xl py-2.5 text-xs font-medium ring-1 transition-all',
                    form.type === type
                      ? `${config.bg} ${config.color} ring-current`
                      : 'bg-zinc-50 text-zinc-500 ring-zinc-200/60 hover:bg-zinc-100',
                  )}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">
            {form.type === 'ADJUST' ? '조정 후 수량' : '수량'} ({item.unit})
          </label>
          <input
            type="number"
            value={form.quantity || ''}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
            className="mt-1 w-full rounded-xl border-0 bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200/60 focus:ring-2 focus:ring-brand-400 outline-none transition-all"
            min={0}
            required
            placeholder={form.type === 'ADJUST' ? `현재: ${item.quantity}` : '0'}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">메모</label>
          <input
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            className="mt-1 w-full rounded-xl border-0 bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200/60 focus:ring-2 focus:ring-brand-400 outline-none transition-all"
            placeholder="사유 입력 (선택)"
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
            disabled={addLog.isPending}
            className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
          >
            {addLog.isPending && <SpinnerGap size={16} className="animate-spin" />}
            적용
          </button>
        </div>
      </form>
    </Modal>
  );
}

// --- Item History (expandable) ---
function ItemHistory({ itemId }: { itemId: string }) {
  const { data } = useInventoryLogs(itemId);
  const logs = data?.data ?? [];

  if (logs.length === 0) {
    return <p className="text-xs text-zinc-400 py-2">이력이 없습니다</p>;
  }

  return (
    <div className="space-y-1.5">
      {logs.slice(0, 5).map((log: any) => {
        const config = logTypeConfig[log.type as keyof typeof logTypeConfig] ?? logTypeConfig.ADJUST;
        const Icon = config.icon;
        return (
          <div key={log.id} className="flex items-center gap-2 text-xs">
            <div className={cn('flex h-5 w-5 items-center justify-center rounded-md', config.bg)}>
              <Icon size={10} weight="bold" className={config.color} />
            </div>
            <span className={cn('font-medium', config.color)}>{config.label}</span>
            <span className="font-mono text-zinc-700 tabular-nums">{log.quantity}</span>
            {log.memo && <span className="text-zinc-400 truncate">{log.memo}</span>}
            <span className="ml-auto text-[10px] font-mono text-zinc-400 tabular-nums shrink-0">
              {formatDateKr(log.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// --- Main Inventory List ---
export function InventoryList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useInventory({ page, search: search || undefined });
  const items = data?.data ?? [];
  const meta = data?.meta;
  const lowStockCount = data?.lowStockCount ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">재고 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">재고 현황을 관리하고 입출고를 기록합니다</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-all duration-300 hover:bg-brand-600 hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          항목 추가
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-zinc-200/50 shadow-soft">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">전체 항목</p>
          <p className="text-lg font-semibold font-mono text-zinc-900 tabular-nums">{meta?.total ?? 0}</p>
        </div>
        {lowStockCount > 0 && (
          <div className="rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200/50">
            <p className="text-[10px] font-medium text-red-500 uppercase tracking-wider">재고 부족</p>
            <p className="text-lg font-semibold font-mono text-red-700 tabular-nums">{lowStockCount}</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-zinc-200/50 shadow-soft max-w-md focus-within:ring-brand-400 focus-within:ring-2 transition-all">
        <MagnifyingGlass size={16} className="text-zinc-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="품명 또는 카테고리 검색..."
          className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
            <Package size={24} className="text-zinc-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-600">재고 항목이 없습니다</p>
          <p className="mt-1 text-xs text-zinc-400">새 항목을 추가해서 재고를 관리해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-soft-lg"
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
                  item.isLowStock ? 'bg-red-50' : 'bg-zinc-100',
                )}>
                  {item.isLowStock ? (
                    <Warning size={18} weight="fill" className="text-red-500" />
                  ) : (
                    <Package size={18} className="text-zinc-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-800 truncate">{item.name}</p>
                    {item.category && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 shrink-0">
                        {item.category}
                      </span>
                    )}
                    {item.isLowStock && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 shrink-0">
                        부족
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    단위: {item.unit} &middot; 최소: {item.minQuantity}{item.unit}
                    {Number(item.price) > 0 && <> &middot; 단가: {formatCurrency(Number(item.price))}</>}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-lg font-semibold font-mono tabular-nums',
                    item.isLowStock ? 'text-red-600' : 'text-zinc-900',
                  )}>
                    {item.quantity}
                    <span className="text-xs font-sans text-zinc-400 ml-0.5">{item.unit}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setAdjustItem(item)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 ring-1 ring-brand-200/50 hover:bg-brand-100 transition-all active:scale-[0.98]"
                  >
                    입출고
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 bg-zinc-50 ring-1 ring-zinc-200/50 hover:bg-zinc-100 transition-all active:scale-[0.98]"
                  >
                    <Clock size={12} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Expandable history */}
              {expandedId === item.id && (
                <div className="border-t border-zinc-100 px-5 py-3 bg-zinc-50/50">
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-2">최근 이력</p>
                  <ItemHistory itemId={item.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white ring-1 ring-zinc-200/50 hover:bg-zinc-50 disabled:opacity-40 transition-all"
          >
            이전
          </button>
          <span className="text-xs font-mono text-zinc-500 tabular-nums">
            {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
            disabled={page >= meta.totalPages}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white ring-1 ring-zinc-200/50 hover:bg-zinc-50 disabled:opacity-40 transition-all"
          >
            다음
          </button>
        </div>
      )}

      {/* Modals */}
      <AddItemModal open={addOpen} onOpenChange={setAddOpen} />
      <StockAdjustModal open={!!adjustItem} onOpenChange={(v) => !v && setAdjustItem(null)} item={adjustItem} />
    </div>
  );
}

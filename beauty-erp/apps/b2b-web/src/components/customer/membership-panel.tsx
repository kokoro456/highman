'use client';

import { useState } from 'react';
import {
  CreditCard,
  CurrencyCircleDollar,
  Plus,
  ArrowUp,
  ArrowDown,
  Lightning,
  Clock,
  SpinnerGap,
  WarningCircle,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { FormInput, FormSelect } from '@/components/ui/form-input';
import { toast } from '@/components/ui/toast';
import {
  useMembershipCards,
  useCreateMembershipCard,
  useUseMembershipCard,
  useChargeMembershipCard,
  usePointBalance,
  usePointHistory,
  useEarnPoints,
  useSpendPoints,
} from '@/hooks/use-membership';

const cardTypeConfig = {
  AMOUNT: { label: '금액권', bg: 'bg-[#FF6B6B15]', text: 'text-[#FF6B6B]', icon: CurrencyCircleDollar },
  DISCOUNT: { label: '할인권', bg: 'bg-[#4ECDC415]', text: 'text-[#4ECDC4]', icon: Lightning },
  COUNT: { label: '횟수권', bg: 'bg-[#FFA07A15]', text: 'text-[#FFA07A]', icon: CreditCard },
};

function formatDateKr(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function MembershipPanel({ customerId }: { customerId: string }) {
  const { data: cards, isLoading: cardsLoading } = useMembershipCards(customerId);
  const { data: pointBalance } = usePointBalance(customerId);
  const { data: pointHistory } = usePointHistory(customerId);

  const [activeTab, setActiveTab] = useState<'cards' | 'points'>('cards');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [useModalOpen, setUseModalOpen] = useState(false);
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [pointMode, setPointMode] = useState<'earn' | 'spend'>('earn');
  const [selectedCardId, setSelectedCardId] = useState('');

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800">회원권 / 포인트</h2>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 rounded-xl bg-zinc-100/80 p-1">
        <button
          onClick={() => setActiveTab('cards')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            activeTab === 'cards'
              ? 'bg-white text-zinc-900 shadow-soft'
              : 'text-zinc-500 hover:text-zinc-700',
          )}
        >
          <CreditCard size={14} />
          회원권
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            activeTab === 'points'
              ? 'bg-white text-zinc-900 shadow-soft'
              : 'text-zinc-500 hover:text-zinc-700',
          )}
        >
          <CurrencyCircleDollar size={14} />
          포인트
          {pointBalance && (
            <span className="ml-0.5 text-[10px] font-mono text-[#FF6B6B] tabular-nums">
              {pointBalance.balance?.toLocaleString()}P
            </span>
          )}
        </button>
      </div>

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="space-y-3">
          {/* Create button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_15px_rgba(255,107,107,0.3)] px-4 py-2 text-xs font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98]"
          >
            <Plus size={14} weight="bold" />
            회원권 발급
          </button>

          {cardsLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-[#FFE4E0] animate-pulse" />
              ))}
            </div>
          ) : !cards || cards.length === 0 ? (
            <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft px-6 py-8 text-center">
              <p className="text-sm text-zinc-400">등록된 회원권이 없습니다</p>
            </div>
          ) : (
            cards.map((card: any) => {
              const config = cardTypeConfig[card.type as keyof typeof cardTypeConfig] ?? cardTypeConfig.AMOUNT;
              const Icon = config.icon;
              const isExpired = card.validUntil && new Date(card.validUntil) < new Date();

              return (
                <div
                  key={card.id}
                  className={cn(
                    'rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-4 space-y-3 transition-all duration-300',
                    !card.isActive && 'opacity-50',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.bg)}>
                        <Icon size={16} className={config.text} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-800">{card.name}</p>
                        <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-medium', config.bg, config.text)}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                    {isExpired && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-500">
                        만료됨
                      </span>
                    )}
                  </div>

                  {/* Card value */}
                  <div className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0]">
                    {card.type === 'AMOUNT' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">잔액</span>
                        <span className="text-base font-semibold font-mono text-zinc-900 tabular-nums">
                          {formatCurrency(Number(card.remainingAmount ?? 0))}
                          <span className="text-[10px] text-zinc-400 ml-1">
                            / {formatCurrency(Number(card.totalAmount ?? 0))}
                          </span>
                        </span>
                      </div>
                    )}
                    {card.type === 'COUNT' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">남은 횟수</span>
                        <span className="text-base font-semibold font-mono text-zinc-900 tabular-nums">
                          {card.remainingCount ?? 0}
                          <span className="text-[10px] text-zinc-400 ml-1">
                            / {card.totalCount ?? 0}회
                          </span>
                        </span>
                      </div>
                    )}
                    {card.type === 'DISCOUNT' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">할인율</span>
                        <span className="text-base font-semibold font-mono text-[#4ECDC4] tabular-nums">
                          {Number(card.discountRate ?? 0)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expiry */}
                  {card.validUntil && (
                    <p className="text-[10px] text-zinc-400 font-mono tabular-nums">
                      유효기간: {formatDateKr(card.validFrom)} ~ {formatDateKr(card.validUntil)}
                    </p>
                  )}

                  {/* Action buttons */}
                  {card.isActive && !isExpired && (
                    <div className="flex items-center gap-2">
                      {card.type !== 'DISCOUNT' && (
                        <button
                          onClick={() => { setSelectedCardId(card.id); setUseModalOpen(true); }}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#FFF8F6] px-3 py-2 text-xs font-medium text-[#FF6B6B] ring-1 ring-[#FFE4E0] transition-all duration-200 hover:bg-[#FFE4E0] active:scale-[0.98]"
                        >
                          <ArrowDown size={12} />
                          사용
                        </button>
                      )}
                      {(card.type === 'AMOUNT' || card.type === 'COUNT') && (
                        <button
                          onClick={() => { setSelectedCardId(card.id); setChargeModalOpen(true); }}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#FFF8F6] px-3 py-2 text-xs font-medium text-[#4ECDC4] ring-1 ring-[#FFE4E0] transition-all duration-200 hover:bg-[#FFE4E0] active:scale-[0.98]"
                        >
                          <ArrowUp size={12} />
                          충전
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Points Tab */}
      {activeTab === 'points' && (
        <div className="space-y-3">
          {/* Balance card */}
          <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500">보유 포인트</span>
              <span className="text-xl font-semibold font-mono text-[#FF6B6B] tabular-nums">
                {(pointBalance?.balance ?? 0).toLocaleString()}
                <span className="text-sm ml-0.5">P</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPointMode('earn'); setPointModalOpen(true); }}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#4ECDC415] px-3 py-2 text-xs font-medium text-[#4ECDC4] ring-1 ring-[#4ECDC430] transition-all duration-200 hover:bg-[#4ECDC420] active:scale-[0.98]"
              >
                <ArrowUp size={12} />
                적립
              </button>
              <button
                onClick={() => { setPointMode('spend'); setPointModalOpen(true); }}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#FF6B6B15] px-3 py-2 text-xs font-medium text-[#FF6B6B] ring-1 ring-[#FF6B6B30] transition-all duration-200 hover:bg-[#FF6B6B20] active:scale-[0.98]"
              >
                <ArrowDown size={12} />
                사용
              </button>
            </div>
          </div>

          {/* Point history */}
          <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-50">
              <span className="text-xs font-medium text-zinc-500">포인트 내역</span>
            </div>
            {!pointHistory || pointHistory.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-zinc-400">포인트 내역이 없습니다</p>
              </div>
            ) : (
              pointHistory.slice(0, 10).map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-zinc-50 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      tx.points > 0 ? 'bg-[#4ECDC415]' : 'bg-[#FF6B6B15]',
                    )}>
                      {tx.points > 0 ? (
                        <ArrowUp size={10} className="text-[#4ECDC4]" />
                      ) : (
                        <ArrowDown size={10} className="text-[#FF6B6B]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-zinc-700">{tx.description}</p>
                      <p className="text-[10px] text-zinc-400 font-mono tabular-nums">
                        {formatDateKr(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold font-mono tabular-nums',
                    tx.points > 0 ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]',
                  )}>
                    {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}P
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      <CreateCardModal
        customerId={customerId}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {/* Use Card Modal */}
      <UseCardModal
        cardId={selectedCardId}
        open={useModalOpen}
        onOpenChange={setUseModalOpen}
      />

      {/* Charge Card Modal */}
      <ChargeCardModal
        cardId={selectedCardId}
        open={chargeModalOpen}
        onOpenChange={setChargeModalOpen}
      />

      {/* Point Modal */}
      <PointModal
        customerId={customerId}
        mode={pointMode}
        open={pointModalOpen}
        onOpenChange={setPointModalOpen}
      />
    </div>
  );
}

// ==================== Sub-modals ====================

function CreateCardModal({ customerId, open, onOpenChange }: {
  customerId: string; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    type: 'AMOUNT' as 'AMOUNT' | 'DISCOUNT' | 'COUNT',
    totalAmount: '',
    discountRate: '',
    totalCount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
  });
  const createCard = useCreateMembershipCard();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCard.mutateAsync({
        customerId,
        name: form.name,
        type: form.type,
        totalAmount: form.type === 'AMOUNT' ? Number(form.totalAmount) : undefined,
        discountRate: form.type === 'DISCOUNT' ? Number(form.discountRate) : undefined,
        totalCount: form.type === 'COUNT' ? Number(form.totalCount) : undefined,
        validFrom: form.validFrom,
        validUntil: form.validUntil || undefined,
      });
      toast('success', '회원권이 발급되었습니다');
      onOpenChange(false);
      setForm({ name: '', type: 'AMOUNT', totalAmount: '', discountRate: '', totalCount: '', validFrom: new Date().toISOString().split('T')[0], validUntil: '' });
    } catch (err: any) {
      toast('error', err.message || '발급에 실패했습니다');
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="회원권 발급" description="새로운 회원권을 발급합니다">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="회원권 이름"
          placeholder="예: 네일 10회권"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <FormSelect
          label="유형"
          value={form.type}
          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as any }))}
          options={[
            { value: 'AMOUNT', label: '금액권' },
            { value: 'DISCOUNT', label: '할인권' },
            { value: 'COUNT', label: '횟수권' },
          ]}
        />
        {form.type === 'AMOUNT' && (
          <FormInput
            label="충전 금액 (원)"
            type="number"
            placeholder="100000"
            value={form.totalAmount}
            onChange={(e) => setForm((p) => ({ ...p, totalAmount: e.target.value }))}
            required
          />
        )}
        {form.type === 'DISCOUNT' && (
          <FormInput
            label="할인율 (%)"
            type="number"
            placeholder="10"
            value={form.discountRate}
            onChange={(e) => setForm((p) => ({ ...p, discountRate: e.target.value }))}
            required
          />
        )}
        {form.type === 'COUNT' && (
          <FormInput
            label="총 횟수"
            type="number"
            placeholder="10"
            value={form.totalCount}
            onChange={(e) => setForm((p) => ({ ...p, totalCount: e.target.value }))}
            required
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="시작일"
            type="date"
            value={form.validFrom}
            onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))}
            required
          />
          <FormInput
            label="만료일 (선택)"
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-200 active:scale-[0.98]">
            취소
          </button>
          <button type="submit" disabled={createCard.isPending} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_15px_rgba(255,107,107,0.3)] px-6 py-2.5 text-sm font-medium text-white transition-all hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98] disabled:opacity-60">
            {createCard.isPending && <SpinnerGap size={16} className="animate-spin" />}
            발급
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UseCardModal({ cardId, open, onOpenChange }: {
  cardId: string; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const [form, setForm] = useState({ amount: '', description: '' });
  const useCard = useUseMembershipCard();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await useCard.mutateAsync({
        id: cardId,
        amount: Number(form.amount),
        description: form.description || '사용',
      });
      toast('success', '회원권이 사용되었습니다');
      onOpenChange(false);
      setForm({ amount: '', description: '' });
    } catch (err: any) {
      toast('error', err.message || '사용에 실패했습니다');
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="회원권 사용" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="사용 금액/횟수"
          type="number"
          placeholder="금액권: 원 / 횟수권: 1"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          required
        />
        <FormInput
          label="사용 내용"
          placeholder="시술명 등"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 active:scale-[0.98]">
            취소
          </button>
          <button type="submit" disabled={useCard.isPending} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_15px_rgba(255,107,107,0.3)] px-6 py-2.5 text-sm font-medium text-white hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98] disabled:opacity-60">
            {useCard.isPending && <SpinnerGap size={16} className="animate-spin" />}
            사용
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ChargeCardModal({ cardId, open, onOpenChange }: {
  cardId: string; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const [form, setForm] = useState({ amount: '' });
  const chargeCard = useChargeMembershipCard();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await chargeCard.mutateAsync({
        id: cardId,
        amount: Number(form.amount),
        count: Number(form.amount),
      });
      toast('success', '충전되었습니다');
      onOpenChange(false);
      setForm({ amount: '' });
    } catch (err: any) {
      toast('error', err.message || '충전에 실패했습니다');
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="회원권 충전" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="충전 금액/횟수"
          type="number"
          placeholder="충전할 금액 또는 횟수"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          required
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 active:scale-[0.98]">
            취소
          </button>
          <button type="submit" disabled={chargeCard.isPending} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#6BD4CD] shadow-[0_4px_15px_rgba(78,205,196,0.3)] px-6 py-2.5 text-sm font-medium text-white hover:from-[#45B7AF] hover:to-[#5CC8C1] active:scale-[0.98] disabled:opacity-60">
            {chargeCard.isPending && <SpinnerGap size={16} className="animate-spin" />}
            충전
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PointModal({ customerId, mode, open, onOpenChange }: {
  customerId: string; mode: 'earn' | 'spend'; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const [form, setForm] = useState({ points: '', description: '' });
  const earnPoints = useEarnPoints();
  const spendPoints = useSpendPoints();
  const mutation = mode === 'earn' ? earnPoints : spendPoints;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mutation.mutateAsync({
        customerId,
        points: Number(form.points),
        description: form.description || (mode === 'earn' ? '포인트 적립' : '포인트 사용'),
      });
      toast('success', mode === 'earn' ? '포인트가 적립되었습니다' : '포인트가 사용되었습니다');
      onOpenChange(false);
      setForm({ points: '', description: '' });
    } catch (err: any) {
      toast('error', err.message || '처리에 실패했습니다');
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={mode === 'earn' ? '포인트 적립' : '포인트 사용'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="포인트"
          type="number"
          placeholder="1000"
          value={form.points}
          onChange={(e) => setForm((p) => ({ ...p, points: e.target.value }))}
          required
        />
        <FormInput
          label="내용"
          placeholder={mode === 'earn' ? '적립 사유' : '사용 내역'}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 active:scale-[0.98]">
            취소
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className={cn(
              'flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white active:scale-[0.98] disabled:opacity-60',
              mode === 'earn'
                ? 'bg-gradient-to-r from-[#4ECDC4] to-[#6BD4CD] shadow-[0_4px_15px_rgba(78,205,196,0.3)] hover:from-[#45B7AF] hover:to-[#5CC8C1]'
                : 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_15px_rgba(255,107,107,0.3)] hover:from-[#FF5252] hover:to-[#FF7B7B]',
            )}
          >
            {mutation.isPending && <SpinnerGap size={16} className="animate-spin" />}
            {mode === 'earn' ? '적립' : '사용'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

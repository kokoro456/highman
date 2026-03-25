'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Envelope,
  CalendarDots,
  CurrencyCircleDollar,
  Star,
  NotePencil,
  Clock,
  PencilSimple,
  TrashSimple,
  WarningCircle,
  SpinnerGap,
  Camera,
  UserCircle,
  CalendarCheck,
  Ticket,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import { useCustomer, useCustomerTier, useDeleteCustomer } from '@/hooks/use-customers';
import { CustomerFormModal } from '../customer/customer-form-modal';
import { PhotoGallery } from '../customer/photo-gallery';
import { MembershipPanel } from '../customer/membership-panel';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

const tierConfig = {
  NORMAL: { label: '일반', bg: 'bg-zinc-100', text: 'text-zinc-600', ring: 'ring-[#FFE4E0]', gradient: 'from-zinc-400 to-zinc-500' },
  SILVER: { label: 'SILVER', bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-300/50', gradient: 'from-slate-400 to-slate-500' },
  GOLD: { label: 'GOLD', bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-300/50', gradient: 'from-yellow-400 to-yellow-600' },
  VIP: { label: 'VIP', bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200/50', gradient: 'from-purple-400 to-purple-600' },
  VVIP: { label: 'VVIP', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200/50', gradient: 'from-red-400 to-red-600' },
};

const tagStyles: Record<string, string> = {
  VVIP: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  VIP: 'bg-[#FF6B6B15] text-[#FF6B6B] ring-1 ring-[#FF6B6B30]',
  '신규': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50',
};

function formatDateKr(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function CustomerDetail({ customerId }: { customerId: string }) {
  const { data: customer, isLoading, error, refetch } = useCustomer(customerId);
  const { data: tierData } = useCustomerTier(customerId);
  const deleteCustomer = useDeleteCustomer();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'history' | 'photos' | 'membership'>('history');

  async function handleDelete() {
    try {
      await deleteCustomer.mutateAsync(customerId);
      toast('success', '고객이 삭제되었습니다');
      router.push('/customers');
    } catch (err: any) {
      toast('error', err.message || '삭제에 실패했습니다');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft"
          >
            <ArrowLeft size={16} className="text-zinc-600" />
          </Link>
          <div className="h-8 w-32 rounded-xl bg-[#FFE4E0] animate-pulse" />
        </div>
        <div className="animate-fade-in space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#FFE4E0] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft"
          >
            <ArrowLeft size={16} className="text-zinc-600" />
          </Link>
        </div>
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">데이터를 불러오는데 실패했습니다</p>
          <button onClick={() => refetch()} className="mt-2 text-xs text-red-500 underline">다시 시도</button>
        </div>
      </div>
    );
  }

  const tier = tierConfig[(customer.tier as keyof typeof tierConfig) ?? 'NORMAL'] ?? tierConfig.NORMAL;
  const visits = customer.treatmentHistories ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <ArrowLeft size={16} className="text-zinc-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-base font-semibold text-zinc-700">
              {customer.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {customer.name}
                </h1>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-semibold',
                    tier.bg,
                    tier.text,
                  )}
                >
                  {tier.label}
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                {customer.createdAt ? formatDateKr(customer.createdAt) : ''} 등록
              </p>
            </div>
          </div>
        </div>

        {/* Edit / Delete buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-700 ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <PencilSimple size={14} />
            편집
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-red-600 ring-1 ring-red-200/60 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-50 hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <TrashSimple size={14} />
            삭제
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tabbed content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-zinc-100/80 p-1">
            <button
              onClick={() => setActiveSection('history')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                activeSection === 'history'
                  ? 'bg-white text-zinc-900 shadow-soft'
                  : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              <Clock size={14} />
              시술 내역
              <span className="ml-0.5 text-[10px] font-mono text-zinc-400 tabular-nums">
                {visits.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection('photos')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                activeSection === 'photos'
                  ? 'bg-white text-zinc-900 shadow-soft'
                  : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              <Camera size={14} />
              시술 사진
            </button>
            <button
              onClick={() => setActiveSection('membership')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                activeSection === 'membership'
                  ? 'bg-white text-zinc-900 shadow-soft'
                  : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              <CurrencyCircleDollar size={14} />
              회원권/포인트
            </button>
          </div>

          {/* Treatment History */}
          {activeSection === 'history' && (
            <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden">
              {visits.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-zinc-400">시술 내역이 없습니다</p>
                </div>
              ) : (
                visits.map((visit: any, idx: number) => (
                  <div
                    key={visit.id}
                    className={cn(
                      'flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-[#FFF5F5]',
                      idx < visits.length - 1 && 'border-b border-zinc-50',
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center self-stretch">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#FF8080] ring-4 ring-[#FF6B6B15] flex-shrink-0" />
                      {idx < visits.length - 1 && (
                        <div className="w-px flex-1 bg-zinc-200/60 mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-zinc-800">
                            {visit.service?.name ?? visit.serviceName ?? '서비스'}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            담당: {visit.staff?.name ?? visit.staffName ?? '-'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-mono font-medium text-zinc-800 tabular-nums">
                            {formatCurrency(Number(visit.price ?? visit.amount ?? 0))}
                          </p>
                          <p className="mt-0.5 text-xs font-mono text-zinc-400 tabular-nums">
                            {formatDateKr(visit.treatmentDate ?? visit.date ?? visit.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Photos */}
          {activeSection === 'photos' && (
            <PhotoGallery customerId={customerId} />
          )}

          {/* Membership */}
          {activeSection === 'membership' && (
            <MembershipPanel customerId={customerId} />
          )}
        </div>

        {/* Right: Customer info card */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-800">
            고객 정보
          </h2>

          <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-6 space-y-5">
            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                  <Phone size={14} className="text-zinc-500" />
                </div>
                <span className="text-sm font-mono text-zinc-700 tabular-nums">
                  {customer.phone ?? '-'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                  <Envelope size={14} className="text-zinc-500" />
                </div>
                <span className="text-sm text-zinc-700">
                  {customer.email ?? '-'}
                </span>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* 총 방문수 */}
              <div className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0]">
                <div className="flex items-center gap-1.5 mb-1">
                  <CalendarDots size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    총 방문수
                  </span>
                </div>
                <p className="text-lg font-semibold font-mono text-zinc-900 tabular-nums">
                  {customer.visitCount ?? 0}
                  <span className="text-xs font-sans text-zinc-400 ml-0.5">
                    회
                  </span>
                </p>
              </div>

              {/* 총 매출 */}
              <div className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0]">
                <div className="flex items-center gap-1.5 mb-1">
                  <CurrencyCircleDollar size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    총 매출
                  </span>
                </div>
                <p className="text-lg font-semibold font-mono text-zinc-900 tabular-nums">
                  {formatCurrency(Number(customer.totalSpent ?? 0))}
                </p>
              </div>

              {/* 최근 방문일 */}
              <div className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0]">
                <div className="flex items-center gap-1.5 mb-1">
                  <CalendarCheck size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    최근 방문일
                  </span>
                </div>
                <p className="text-sm font-medium font-mono text-zinc-900 tabular-nums">
                  {customer.lastVisitDate
                    ? formatDateKr(customer.lastVisitDate)
                    : '-'}
                </p>
              </div>

              {/* 고객 등록일 */}
              <div className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    고객 등록일
                  </span>
                </div>
                <p className="text-sm font-medium font-mono text-zinc-900 tabular-nums">
                  {customer.createdAt
                    ? formatDateKr(customer.createdAt)
                    : '-'}
                </p>
              </div>
            </div>

            {/* No-show count */}
            {(customer.noShowCount ?? 0) > 0 && (
              <div className="rounded-xl bg-red-50 p-3 ring-1 ring-red-200/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <WarningCircle size={12} className="text-red-400" />
                  <span className="text-[10px] font-medium text-red-500 uppercase tracking-wider">
                    노쇼 횟수
                  </span>
                </div>
                <p className="text-lg font-semibold font-mono text-red-600 tabular-nums">
                  {customer.noShowCount ?? 0}
                  <span className="text-xs font-sans text-red-400 ml-0.5">
                    회
                  </span>
                </p>
              </div>
            )}

            {/* 담당자 (Primary Staff) */}
            {customer.primaryStaff && (
              <div className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0]">
                <div className="flex items-center gap-1.5 mb-1">
                  <UserCircle size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    담당자
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-900">
                  {customer.primaryStaff.name}
                </p>
              </div>
            )}

            {/* 정액권 정보 (Passes) */}
            {(customer.allPasses ?? customer.passes ?? []).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Ticket size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    정액권 정보
                  </span>
                </div>
                {(customer.allPasses ?? customer.passes ?? [])
                  .filter((pass: any) => pass.status === 'ACTIVE')
                  .map((pass: any) => (
                    <div
                      key={pass.id}
                      className="rounded-xl bg-[#FFF8F6] p-3 ring-1 ring-[#FFE4E0] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-800">
                          {pass.name}
                        </span>
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600 ring-1 ring-green-200/50">
                          이용중
                        </span>
                      </div>
                      {pass.totalAmount != null && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">금액</span>
                          <span className="font-mono text-zinc-700 tabular-nums">
                            {formatCurrency(Number(pass.remainingAmount ?? 0))} / {formatCurrency(Number(pass.totalAmount))}
                          </span>
                        </div>
                      )}
                      {pass.totalCount != null && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">횟수</span>
                          <span className="font-mono text-zinc-700 tabular-nums">
                            {pass.remainingCount ?? 0} / {pass.totalCount}회
                          </span>
                        </div>
                      )}
                      {(pass.totalAmount != null || pass.totalCount != null) && (
                        <div className="h-1.5 rounded-full bg-zinc-200/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#FF8080] to-[#FF6B6B] transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.min(
                                100,
                                pass.totalCount != null
                                  ? ((pass.remainingCount ?? 0) / pass.totalCount) * 100
                                  : pass.totalAmount != null && Number(pass.totalAmount) > 0
                                    ? (Number(pass.remainingAmount ?? 0) / Number(pass.totalAmount)) * 100
                                    : 0,
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            <div className="h-px bg-zinc-100" />

            {/* Tier & Progress */}
            {tierData && (
              <>
                <div>
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    멤버십 등급
                  </span>
                  <div className="mt-2 rounded-xl p-3 bg-[#FFF8F6] ring-1 ring-[#FFE4E0] space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-bold tracking-wider ring-1',
                          tierConfig[(tierData.tier as keyof typeof tierConfig)]?.bg ?? 'bg-zinc-100',
                          tierConfig[(tierData.tier as keyof typeof tierConfig)]?.text ?? 'text-zinc-600',
                          tierConfig[(tierData.tier as keyof typeof tierConfig)]?.ring ?? 'ring-[#FFE4E0]',
                        )}
                      >
                        {tierConfig[(tierData.tier as keyof typeof tierConfig)]?.label ?? tierData.tier}
                      </span>
                      <span className="text-xs font-mono font-medium text-[#FF6B6B]">
                        {tierData.discount}% 할인
                      </span>
                    </div>
                    {tierData.nextTier && tierData.amountToNext > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-zinc-500">
                            다음 등급: <span className="font-semibold">{tierConfig[(tierData.nextTier as keyof typeof tierConfig)]?.label ?? tierData.nextTier}</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {formatCurrency(tierData.amountToNext)} 남음
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-200/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#FF8080] to-[#FF6B6B] transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.min(100, ((tierData.totalSpent / (tierData.totalSpent + tierData.amountToNext)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-px bg-zinc-100" />
              </>
            )}

            {/* Tags */}
            <div>
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                태그
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(customer.tags ?? []).map((tag: string) => (
                  <span
                    key={tag}
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                      tagStyles[tag] || 'bg-zinc-100 text-zinc-600',
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Memo */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  메모
                </span>
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors duration-200"
                >
                  <NotePencil size={12} className="text-zinc-400" />
                </button>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {customer.memo ?? '메모가 없습니다'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <CustomerFormModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) refetch();
        }}
        customer={customer}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="고객 삭제"
        description="이 작업은 되돌릴 수 없습니다"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200/50">
            <WarningCircle size={18} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">{customer.name}</span> 고객을 삭제하시겠습니까?
              삭제된 고객의 데이터는 복구할 수 없습니다.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-200 active:scale-[0.98]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
            >
              {deleteCustomer.isPending && <SpinnerGap size={16} className="animate-spin" />}
              삭제
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

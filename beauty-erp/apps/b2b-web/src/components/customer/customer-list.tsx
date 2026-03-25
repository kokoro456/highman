'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlass,
  Plus,
  CaretLeft,
  CaretRight,
  Users,
  UserPlus,
  DownloadSimple,
  NotePencil,
  Check,
  X,
  SpinnerGap,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { useCustomers, useUpdateCustomer } from '@/hooks/use-customers';
import { CustomerFormModal } from './customer-form-modal';

const tagStyles: Record<string, string> = {
  VVIP: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  VIP: 'bg-[#FF6B6B15] text-[#FF6B6B] ring-1 ring-[#FF6B6B30]',
  '신규': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50',
};

type MainCategory = 'all' | 'uncategorized' | 'blacklist';
type SubCategory = 'all' | 'new' | 'returning' | 'regular' | 'vip' | 'needsAttention';

const mainCategories: { key: MainCategory; label: string }[] = [
  { key: 'all', label: '전체고객' },
  { key: 'uncategorized', label: '미분류' },
  { key: 'blacklist', label: '블랙리스트' },
];

const subCategories: { key: SubCategory; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'new', label: '신규고객' },
  { key: 'returning', label: '재방문고객' },
  { key: 'regular', label: '단골고객' },
  { key: 'vip', label: 'VIP' },
  { key: 'needsAttention', label: '관리필요' },
];

function formatDateRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function applyMainFilter(customers: any[], category: MainCategory): any[] {
  switch (category) {
    case 'uncategorized':
      return customers.filter((c) => !c.tags || c.tags.length === 0);
    case 'blacklist':
      return customers.filter((c) =>
        (c.tags ?? []).some((t: string) =>
          t.toLowerCase() === 'blacklist' || t === '블랙리스트',
        ),
      );
    default:
      return customers;
  }
}

function applySubFilter(customers: any[], category: SubCategory): any[] {
  const now = new Date();
  switch (category) {
    case 'new': {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return customers.filter(
        (c) => c.createdAt && new Date(c.createdAt) >= oneMonthAgo,
      );
    }
    case 'returning':
      return customers.filter(
        (c) => (c.visitCount ?? 0) >= 2 && (c.visitCount ?? 0) < 10,
      );
    case 'regular':
      return customers.filter((c) => (c.visitCount ?? 0) >= 10);
    case 'vip':
      return customers.filter(
        (c) =>
          c.tier === 'VIP' ||
          c.tier === 'VVIP' ||
          (c.tags ?? []).some(
            (t: string) => t.toUpperCase() === 'VIP' || t.toUpperCase() === 'VVIP',
          ),
      );
    case 'needsAttention': {
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      return customers.filter((c) => {
        const totalSpent = Number(c.totalSpent ?? 0);
        const visitCount = c.visitCount ?? 0;
        const lastVisit = c.lastVisitDate ? new Date(c.lastVisitDate) : null;
        return (
          totalSpent > 500000 &&
          (visitCount < 5 || (lastVisit && lastVisit < sixtyDaysAgo))
        );
      });
    }
    default:
      return customers;
  }
}

function InlineMemo({ customer }: { customer: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [memo, setMemo] = useState(customer.memo ?? '');
  const updateCustomer = useUpdateCustomer();

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await updateCustomer.mutateAsync({ id: customer.id, data: { memo } });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-zinc-100',
          customer.memo ? 'text-[#FF6B6B]' : 'text-zinc-400',
        )}
        title={customer.memo || '메모 추가'}
      >
        <NotePencil size={14} weight={customer.memo ? 'fill' : 'regular'} />
      </button>
    );
  }

  return (
    <div
      className="mt-2 rounded-xl bg-[#FFF8F6] ring-1 ring-[#FFE4E0] p-3 space-y-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모를 입력하세요..."
        rows={2}
        className="w-full rounded-lg bg-white px-3 py-2 text-sm text-zinc-700 ring-1 ring-zinc-200 placeholder:text-zinc-400 outline-none focus:ring-[#FF6B6B] resize-none"
        autoFocus
      />
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMemo(customer.memo ?? '');
            setIsOpen(false);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"
        >
          <X size={14} />
        </button>
        <button
          onClick={handleSave}
          disabled={updateCustomer.isPending}
          className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] px-3 py-1 text-xs font-medium text-white transition-all hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98] disabled:opacity-60"
        >
          {updateCustomer.isPending ? (
            <SpinnerGap size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
          저장
        </button>
      </div>
    </div>
  );
}

export function CustomerList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mainCategory, setMainCategory] = useState<MainCategory>('all');
  const [subCategory, setSubCategory] = useState<SubCategory>('all');

  // Fetch a large set for client-side filtering
  const perPage = 200;

  const {
    data: customerData,
    isLoading,
    error,
    refetch,
  } = useCustomers({ page: 1, limit: perPage, search: search || undefined });

  const allCustomers = customerData?.data ?? [];

  // Apply client-side filters
  const filteredCustomers = useMemo(() => {
    let result = allCustomers;
    result = applyMainFilter(result, mainCategory);
    result = applySubFilter(result, subCategory);
    return result;
  }, [allCustomers, mainCategory, subCategory]);

  // Client-side pagination on filtered results
  const clientPerPage = 6;
  const totalFiltered = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / clientPerPage));
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * clientPerPage,
    page * clientPerPage,
  );

  const handleExport = async () => {
    const token = useAuthStore.getState().accessToken;
    const shopId = useAuthStore.getState().shopId;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/api/export/customers?format=csv`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-shop-id': shopId || '',
      },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset page when filters change
  const handleMainCategory = (cat: MainCategory) => {
    setMainCategory(cat);
    setPage(1);
  };
  const handleSubCategory = (cat: SubCategory) => {
    setSubCategory(cat);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            고객 관리
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            고객 정보를 검색하고 관리하세요
          </p>
        </div>
        <div className="animate-fade-in space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-[#FFE4E0] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            고객 관리
          </h1>
        </div>
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200/50 text-center">
          <p className="text-sm text-red-600">
            데이터를 불러오는데 실패했습니다
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-xs text-red-500 underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              고객 관리
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              고객 정보를 검색하고 관리하세요
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-mono font-medium text-zinc-600 tabular-nums">
            {totalFiltered}명
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-[#FFE4E0] shadow-soft w-full sm:w-64 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-[#FF6B6B] focus-within:ring-2">
            <MagnifyingGlass
              size={16}
              className="text-zinc-400 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="이름, 전화번호, 태그 검색"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
            />
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap"
          >
            <DownloadSimple size={16} weight="bold" />
            내보내기
          </button>

          {/* Add button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_15px_rgba(255,107,107,0.3)] px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98] whitespace-nowrap"
          >
            <UserPlus size={16} weight="bold" />
            고객 등록
          </button>
        </div>
      </div>

      {/* Main Category Filters (대분류) */}
      <div className="flex flex-wrap items-center gap-2">
        {mainCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleMainCategory(cat.key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              mainCategory === cat.key
                ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)]'
                : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-[#FFE4E0] hover:text-zinc-800',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sub Category Filters (중분류) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {subCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleSubCategory(cat.key)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              subCategory === cat.key
                ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_2px_6px_rgba(255,107,107,0.25)]'
                : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-[#FFE4E0] hover:text-zinc-800',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Customer table */}
      {paginatedCustomers.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6B6B10] mb-6">
            <Users size={32} weight="regular" className="text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            {search || mainCategory !== 'all' || subCategory !== 'all'
              ? '검색 결과가 없습니다'
              : '등록된 고객이 없습니다'}
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">
            {search || mainCategory !== 'all' || subCategory !== 'all'
              ? '다른 키워드나 필터로 검색하거나, 새 고객을 등록해 주세요'
              : '첫 번째 고객을 등록해보세요'}
          </p>
          {!search && mainCategory === 'all' && subCategory === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_15px_rgba(255,107,107,0.3)] px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:from-[#FF5252] hover:to-[#FF7B7B] active:scale-[0.98]"
            >
              <UserPlus size={16} weight="bold" />
              고객 등록
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {paginatedCustomers.map((customer: any) => (
              <div key={customer.id}>
                <Link
                  href={`/customers/${customer.id}`}
                  className="block rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft p-4 transition-all duration-200 hover:shadow-soft-lg active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-600 flex-shrink-0">
                      {customer.name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-800 truncate">
                          {customer.name}
                        </span>
                        {(customer.tags ?? []).map((tag: string) => (
                          <span
                            key={tag}
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0',
                              tagStyles[tag] || 'bg-zinc-100 text-zinc-600',
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-mono text-zinc-500 tabular-nums mt-0.5">
                        {customer.phone}
                      </p>
                    </div>
                    <InlineMemo customer={customer} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>방문 {customer.visitCount ?? 0}회</span>
                    <span className="font-mono font-medium text-zinc-700 tabular-nums">
                      {formatCurrency(Number(customer.totalSpent ?? 0))}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden md:block rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_140px_100px_80px_120px_140px_48px] gap-4 px-6 py-3.5 border-b border-[#FFE4E0] bg-[#FFF8F6]">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                고객명
              </span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                전화번호
              </span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                최근 방문
              </span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-center">
                방문
              </span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">
                총 결제
              </span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                태그
              </span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-center">
                메모
              </span>
            </div>

            {/* Table rows */}
            {paginatedCustomers.map((customer: any) => (
              <div key={customer.id} className="border-b border-zinc-50 last:border-b-0">
                <div className="grid grid-cols-[1fr_140px_100px_80px_120px_140px_48px] gap-4 px-6 py-4 items-center transition-all duration-200 hover:bg-[#FFF8F6] group">
                  {/* Name */}
                  <Link
                    href={`/customers/${customer.id}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-600 flex-shrink-0 transition-all duration-300 group-hover:from-[#FF6B6B15] group-hover:to-[#FF6B6B20] group-hover:text-[#FF6B6B]">
                      {customer.name?.[0] ?? '?'}
                    </div>
                    <span className="text-sm font-medium text-zinc-800 truncate">
                      {customer.name}
                    </span>
                  </Link>

                  {/* Phone */}
                  <Link href={`/customers/${customer.id}`}>
                    <span className="text-sm font-mono text-zinc-600 tabular-nums">
                      {customer.phone}
                    </span>
                  </Link>

                  {/* Last visit */}
                  <Link href={`/customers/${customer.id}`}>
                    <span className="text-sm text-zinc-500">
                      {customer.lastVisitDate
                        ? formatDateRelative(customer.lastVisitDate)
                        : '-'}
                    </span>
                  </Link>

                  {/* Visit count */}
                  <Link href={`/customers/${customer.id}`} className="flex justify-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-700 tabular-nums">
                      {customer.visitCount ?? 0}
                    </span>
                  </Link>

                  {/* Total spent */}
                  <Link href={`/customers/${customer.id}`}>
                    <span className="text-sm font-mono font-medium text-zinc-800 tabular-nums text-right block">
                      {formatCurrency(Number(customer.totalSpent ?? 0))}
                    </span>
                  </Link>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(customer.tags ?? []).map((tag: string) => (
                      <span
                        key={tag}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-medium',
                          tagStyles[tag] || 'bg-zinc-100 text-zinc-600',
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Memo button */}
                  <div className="flex justify-center">
                    <InlineMemo customer={customer} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Customer create modal */}
      <CustomerFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:hover:shadow-soft disabled:hover:translate-y-0"
          >
            <CaretLeft size={14} className="text-zinc-600" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-mono font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                p === page
                  ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_4px_15px_rgba(255,107,107,0.3)] shadow-soft'
                  : 'bg-white text-zinc-600 ring-1 ring-[#FFE4E0] shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]',
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:hover:shadow-soft disabled:hover:translate-y-0"
          >
            <CaretRight size={14} className="text-zinc-600" />
          </button>
        </div>
      )}
    </div>
  );
}

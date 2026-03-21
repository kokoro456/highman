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
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';

const mockCustomers = [
  {
    id: '1',
    name: '정민서',
    phone: '010-4821-7293',
    lastVisit: '2026-03-19',
    visitCount: 12,
    totalSpent: 847000,
    tags: ['VIP', '속눈썹'],
  },
  {
    id: '2',
    name: '최유진',
    phone: '010-3847-1926',
    lastVisit: '2026-03-20',
    visitCount: 8,
    totalSpent: 562000,
    tags: ['네일'],
  },
  {
    id: '3',
    name: '한소희',
    phone: '010-9182-4637',
    lastVisit: '2026-03-18',
    visitCount: 23,
    totalSpent: 1834000,
    tags: ['VVIP', '왁싱', '속눈썹'],
  },
  {
    id: '4',
    name: '오서윤',
    phone: '010-2738-8461',
    lastVisit: '2026-03-15',
    visitCount: 3,
    totalSpent: 189000,
    tags: ['신규'],
  },
  {
    id: '5',
    name: '윤채원',
    phone: '010-6194-3728',
    lastVisit: '2026-03-21',
    visitCount: 15,
    totalSpent: 1247000,
    tags: ['VIP', '네일', '피부'],
  },
  {
    id: '6',
    name: '김나연',
    phone: '010-5283-9174',
    lastVisit: '2026-03-10',
    visitCount: 6,
    totalSpent: 423000,
    tags: ['속눈썹'],
  },
  {
    id: '7',
    name: '박지우',
    phone: '010-7392-4815',
    lastVisit: '2026-03-17',
    visitCount: 31,
    totalSpent: 2891000,
    tags: ['VVIP', '왁싱'],
  },
  {
    id: '8',
    name: '이수빈',
    phone: '010-8461-2739',
    lastVisit: '2026-03-12',
    visitCount: 1,
    totalSpent: 65000,
    tags: ['신규'],
  },
];

const tagStyles: Record<string, string> = {
  VVIP: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  VIP: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200/50',
  '신규': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50',
};

function formatDateRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date('2026-03-21');
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function CustomerList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    if (!search) return mockCustomers;
    const q = search.toLowerCase();
    return mockCustomers.filter(
      (c) =>
        c.name.includes(q) ||
        c.phone.includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

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
            {mockCustomers.length}명
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-zinc-200/50 shadow-soft w-full sm:w-64 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-brand-400 focus-within:ring-2">
            <MagnifyingGlass size={16} className="text-zinc-400 flex-shrink-0" />
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

          {/* Add button */}
          <button className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98] whitespace-nowrap">
            <UserPlus size={16} weight="bold" />
            고객 등록
          </button>
        </div>
      </div>

      {/* Customer table */}
      {paginated.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft p-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 mb-6">
            <Users size={32} weight="regular" className="text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            검색 결과가 없습니다
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs">
            다른 키워드로 검색하거나, 새 고객을 등록해 주세요
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_140px_100px_80px_120px_160px] gap-4 px-6 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
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
          </div>

          {/* Table rows */}
          {paginated.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="grid grid-cols-[1fr_140px_100px_80px_120px_160px] gap-4 px-6 py-4 items-center border-b border-zinc-50 last:border-b-0 transition-all duration-200 hover:bg-zinc-50/80 group cursor-pointer"
            >
              {/* Name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-600 flex-shrink-0 transition-all duration-300 group-hover:from-brand-50 group-hover:to-brand-100 group-hover:text-brand-700">
                  {customer.name[0]}
                </div>
                <span className="text-sm font-medium text-zinc-800 truncate">
                  {customer.name}
                </span>
              </div>

              {/* Phone */}
              <span className="text-sm font-mono text-zinc-600 tabular-nums">
                {customer.phone}
              </span>

              {/* Last visit */}
              <span className="text-sm text-zinc-500">
                {formatDateRelative(customer.lastVisit)}
              </span>

              {/* Visit count */}
              <div className="flex justify-center">
                <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-700 tabular-nums">
                  {customer.visitCount}
                </span>
              </div>

              {/* Total spent */}
              <span className="text-sm font-mono font-medium text-zinc-800 tabular-nums text-right">
                {formatCurrency(customer.totalSpent)}
              </span>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {customer.tags.map((tag) => (
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
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:hover:shadow-soft disabled:hover:translate-y-0"
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
                  ? 'bg-zinc-900 text-white shadow-soft'
                  : 'bg-white text-zinc-600 ring-1 ring-zinc-200/50 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]',
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:hover:shadow-soft disabled:hover:translate-y-0"
          >
            <CaretRight size={14} className="text-zinc-600" />
          </button>
        </div>
      )}
    </div>
  );
}

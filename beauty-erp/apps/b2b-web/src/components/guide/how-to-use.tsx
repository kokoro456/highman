'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Rocket,
  ChartBar,
  CalendarCheck,
  Users,
  CreditCard,
  ChatCircleDots,
  ChartPieSlice,
  UserCircle,
  Calculator,
  Ticket,
  Package,
  Gear,
  Globe,
  ArrowRight,
  List,
  X,
  EnvelopeSimple,
  Phone,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Section data                                                              */
/* -------------------------------------------------------------------------- */

interface GuideSection {
  id: string;
  number: number;
  title: string;
  icon: React.ElementType;
  description: string;
  items: string[];
}

const SECTIONS: GuideSection[] = [
  {
    id: 'getting-started',
    number: 1,
    title: '시작하기',
    icon: Rocket,
    description: '회원가입부터 대시보드 접속까지 3단계로 시작하세요.',
    items: [
      '회원가입: 이메일과 기본 정보를 입력하여 계정을 생성합니다.',
      '매장 등록: 매장 이름, 업종, 연락처 등 기본 정보를 등록합니다.',
      '대시보드 접속: 등록 완료 후 바로 대시보드에서 매장 관리를 시작합니다.',
      '테스트 계정: owner@beauty-erp.kr / owner1234 로 미리 체험해보세요.',
    ],
  },
  {
    id: 'dashboard',
    number: 2,
    title: '대시보드',
    icon: ChartBar,
    description: '매장 현황을 한눈에 파악하세요.',
    items: [
      '오늘 매출, 예약 건수, 신규 고객, 노쇼율을 한눈에 확인합니다.',
      '오늘의 예약 목록으로 하루 일정을 빠르게 파악합니다.',
      '최근 결제 내역을 실시간으로 모니터링합니다.',
      '다가오는 예약을 미리보기로 확인하여 사전 준비가 가능합니다.',
    ],
  },
  {
    id: 'bookings',
    number: 3,
    title: '예약 관리',
    icon: CalendarCheck,
    description: '캘린더 뷰로 예약을 직관적으로 관리하세요.',
    items: [
      '캘린더 뷰: 직원별 컬럼과 시간대별 예약 블록으로 한눈에 확인합니다.',
      '예약 등록: + 버튼을 눌러 고객, 직원, 서비스, 시간을 선택합니다.',
      '예약 상태 변경: 예약 블록을 클릭하여 확정, 진행중, 완료, 취소, 노쇼 상태를 변경합니다.',
    ],
  },
  {
    id: 'customers',
    number: 4,
    title: '고객 관리',
    icon: Users,
    description: '체계적인 고객 데이터 관리로 단골을 만드세요.',
    items: [
      '고객 목록: 대분류(전체/미분류/블랙리스트)와 중분류(신규/재방문/단골/VIP/관리필요) 필터로 빠르게 검색합니다.',
      '고객 등록: 이름, 전화번호, 이메일, 태그 정보를 입력합니다.',
      '고객 상세: 방문수, 매출, 노쇼횟수, 담당자, 정액권, 시술사진을 확인합니다.',
      '인라인 메모: 고객 목록에서 바로 메모를 추가하여 빠르게 기록합니다.',
    ],
  },
  {
    id: 'payments',
    number: 5,
    title: '매출/결제',
    icon: CreditCard,
    description: '매출을 한눈에 확인하고 결제를 간편하게 처리하세요.',
    items: [
      '일별 매출 요약 카드로 총매출, 카드, 현금, 이체 금액을 확인합니다.',
      '결제 등록: 고객, 서비스, 금액, 결제수단을 선택하여 결제를 처리합니다.',
      '쿠폰 적용 및 회원권 차감이 가능합니다.',
      '엑셀 내보내기로 매출 데이터를 외부에서 활용할 수 있습니다.',
    ],
  },
  {
    id: 'messages',
    number: 6,
    title: '고객연락망',
    icon: ChatCircleDots,
    description: '문자와 알림톡으로 고객과 소통하세요.',
    items: [
      '문자 및 단체문자 발송으로 고객에게 안내를 전달합니다.',
      '카카오 알림톡 발송으로 예약 알림을 자동 전송합니다.',
      '자동 알림 설정: 방문예정, 시술완료, 예약확인, 예약취소 알림을 설정합니다.',
      '발송 내역 조회로 발송 결과를 확인합니다.',
      '템플릿 관리로 자주 사용하는 메시지를 저장합니다.',
    ],
  },
  {
    id: 'reports',
    number: 7,
    title: '보고서',
    icon: ChartPieSlice,
    description: '데이터 기반으로 매장 성과를 분석하세요.',
    items: [
      '매출 분석: 실매출, 객단가, 전월 대비 변화율을 확인합니다.',
      '예약 현황: 완료, 노쇼, 취소 비율을 분석합니다.',
      '시간 활용률: 직원 가동률을 분석하여 효율을 높입니다.',
      '재방문 고객 비율과 직원별 매출 랭킹을 확인합니다.',
      '서비스 분석, 고객 분석, 시간대 분석 탭으로 세분화된 데이터를 제공합니다.',
    ],
  },
  {
    id: 'staff',
    number: 8,
    title: '직원 관리',
    icon: UserCircle,
    description: '직원 정보와 성과를 체계적으로 관리하세요.',
    items: [
      '직원 카드: 이번달 예약, 매출, 인센티브를 실시간으로 표시합니다.',
      '직원 상세: 서비스별 매출 차트와 근무 스케줄을 확인합니다.',
      '직원 등록 및 수정으로 인력을 관리합니다.',
    ],
  },
  {
    id: 'settlement',
    number: 9,
    title: '정산 관리',
    icon: Calculator,
    description: '직원 급여와 인센티브를 정확하게 정산하세요.',
    items: [
      '월별 직원 정산: 매출, 인센티브, 총급여를 한눈에 확인합니다.',
      '직원별 상세 정산: 서비스 매출 내역과 일별 매출을 상세하게 조회합니다.',
    ],
  },
  {
    id: 'coupons',
    number: 10,
    title: '쿠폰 관리',
    icon: Ticket,
    description: '할인 쿠폰으로 고객 재방문을 유도하세요.',
    items: [
      '할인 쿠폰 생성: 정액 할인과 정률 할인을 선택하여 쿠폰을 만듭니다.',
      '쿠폰 코드가 자동으로 생성됩니다.',
      '사용 현황 추적으로 쿠폰 효과를 분석합니다.',
    ],
  },
  {
    id: 'inventory',
    number: 11,
    title: '재고 관리',
    icon: Package,
    description: '시술 재료를 빠짐없이 관리하세요.',
    items: [
      '시술 재료 등록 및 수량 관리를 합니다.',
      '입고, 출고, 조정 기록을 추적합니다.',
      '재고 부족 알림으로 품절을 방지합니다.',
    ],
  },
  {
    id: 'settings',
    number: 12,
    title: '매장 설정',
    icon: Gear,
    description: '매장 기본 정보와 운영 환경을 설정하세요.',
    items: [
      '매장 정보: 이름, 업종, 전화번호, 주소를 등록합니다.',
      '영업시간을 설정하여 예약 가능 시간을 관리합니다.',
      '서비스 메뉴를 등록하고 관리합니다.',
      '외부 연동 상태: PG결제, 알림톡, 소셜로그인 연동을 확인합니다.',
    ],
  },
  {
    id: 'b2c-booking',
    number: 13,
    title: 'B2C 온라인 예약',
    icon: Globe,
    description: '고객이 직접 예약하는 온라인 예약 페이지를 운영하세요.',
    items: [
      '고객이 직접 예약할 수 있는 전용 페이지를 제공합니다.',
      '5단계 예약 프로세스: 서비스 선택 → 직원 선택 → 날짜/시간 → 정보 입력 → 확인',
      'URL: /book/[shopId] 형태로 매장별 고유 예약 링크가 생성됩니다.',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Intersection Observer hook for fade-in                                    */
/* -------------------------------------------------------------------------- */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* -------------------------------------------------------------------------- */
/*  Section card                                                              */
/* -------------------------------------------------------------------------- */

function SectionCard({ section }: { section: GuideSection }) {
  const { ref, visible } = useInView();
  const Icon = section.icon;

  return (
    <div
      id={section.id}
      ref={ref}
      className={cn(
        'scroll-mt-24 rounded-2xl bg-white shadow-soft border border-coral-100/60 p-6 sm:p-8 transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-coral-500 flex items-center justify-center text-white font-bold text-sm shadow-warm">
          {section.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <Icon size={22} weight="duotone" className="text-coral-500 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{section.title}</h2>
          </div>
          <p className="text-sm text-gray-500">{section.description}</p>
        </div>
      </div>

      {/* Content */}
      <ul className="space-y-3 ml-14">
        {section.items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-coral-300 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Screenshot placeholder */}
      <div className="mt-6 ml-14 rounded-xl border-2 border-dashed border-coral-200/60 bg-coral-50/30 p-6 flex items-center justify-center">
        <p className="text-xs text-coral-400 font-medium">
          {section.title} 화면 미리보기
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  TOC sidebar (desktop) / drawer (mobile)                                   */
/* -------------------------------------------------------------------------- */

function TableOfContents({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={onSelect}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
            activeId === s.id
              ? 'bg-coral-50 text-coral-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          )}
        >
          <span
            className={cn(
              'w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0',
              activeId === s.id
                ? 'bg-coral-500 text-white'
                : 'bg-gray-200 text-gray-500',
            )}
          >
            {s.number}
          </span>
          <span className="truncate">{s.title}</span>
        </a>
      ))}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function HowToUseGuide() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Track which section is in view */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-[100dvh] w-screen -mx-4 bg-[#FFF8F6] flex flex-col items-stretch overflow-x-hidden">
      {/* ------------------------------------------------------------------ */}
      {/*  Sticky header                                                     */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-coral-100/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <Link href="/" className="font-bold text-coral-500 text-base">
            Beauty ERP
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-coral-600 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-sm font-semibold text-white bg-coral-500 hover:bg-coral-600 rounded-lg transition-colors"
            >
              시작하기
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -mr-2 text-gray-600 hover:text-coral-500"
            aria-label="목차 열기"
          >
            <List size={22} weight="bold" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/*  Hero                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coral-400 via-coral-500 to-peach-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="relative max-w-3xl mx-auto text-center px-4 py-16 sm:py-24">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight animate-fade-in">
            Beauty ERP 사용 가이드
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/90 font-medium animate-slide-up">
            매장 운영의 모든 것을 한 곳에서 관리하세요
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-coral-600 font-semibold rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-shadow text-sm"
            >
              무료로 시작하기
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/20 text-white font-semibold rounded-xl backdrop-blur hover:bg-white/30 transition-colors text-sm"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Body: sidebar + content                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex gap-8 px-4 sm:px-6 py-10 sm:py-14">
        {/* Desktop sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
              목차
            </p>
            <TableOfContents activeId={activeId} />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-6">
          {SECTIONS.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </main>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Footer CTA                                                        */}
      {/* ------------------------------------------------------------------ */}
      <footer className="bg-white border-t border-coral-100/50">
        <div className="max-w-3xl mx-auto text-center px-4 py-14 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            지금 바로 시작하세요
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Beauty ERP로 매장 운영을 한 단계 업그레이드하세요.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3 bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-xl shadow-soft-lg transition-colors text-sm"
            >
              시작하기
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3 border border-coral-200 text-coral-600 font-semibold rounded-xl hover:bg-coral-50 transition-colors text-sm"
            >
              로그인
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <EnvelopeSimple size={14} weight="bold" />
              support@beauty-erp.kr
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Phone size={14} weight="bold" />
              02-1234-5678
            </span>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------------ */}
      {/*  Mobile TOC drawer                                                 */}
      {/* ------------------------------------------------------------------ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-5 overflow-y-auto animate-slide-down">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                목차
              </p>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="닫기"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <TableOfContents
              activeId={activeId}
              onSelect={() => setMobileMenuOpen(false)}
            />
            <div className="mt-6 space-y-2">
              <Link
                href="/register"
                className="block w-full text-center px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                시작하기
              </Link>
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2.5 border border-coral-200 text-coral-600 font-semibold rounded-lg text-sm hover:bg-coral-50 transition-colors"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

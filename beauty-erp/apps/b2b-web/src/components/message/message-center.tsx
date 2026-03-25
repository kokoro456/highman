'use client';

import { useState, useMemo } from 'react';
import {
  ChatCircleDots,
  PaperPlaneTilt,
  ClockCounterClockwise,
  Bell,
  FileText,
  MagnifyingGlass,
  SpinnerGap,
  CaretLeft,
  CaretRight,
  Plus,
  Trash,
  PaperPlaneRight,
  UsersThree,
  User,
  ChatTeardropText,
  Funnel,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { cn, formatPhone } from '@/lib/utils';
import {
  useMessages,
  useMessageStats,
  useMessageTemplates,
  useSendSms,
  useSendBulkSms,
  useSendAlimtalk,
  useSendVisitReminder,
  useSendPostVisitMessage,
  useCreateMessageTemplate,
  useDeleteMessageTemplate,
  type Message,
  type MessageTemplate,
  type MessageType,
} from '@/hooks/use-messages';
import { useCustomers } from '@/hooks/use-customers';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

// ─── Helpers ─────────────────────────────────────────────────

function formatDateKr(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  SENT: { label: '발송완료', className: 'bg-emerald-50 text-emerald-700' },
  FAILED: { label: '발송실패', className: 'bg-red-50 text-red-600' },
  PENDING: { label: '대기중', className: 'bg-yellow-50 text-yellow-700' },
  CANCELLED: { label: '취소', className: 'bg-zinc-100 text-zinc-500' },
};

const CHANNEL_BADGE: Record<string, { label: string; className: string }> = {
  SMS: { label: 'SMS', className: 'bg-blue-50 text-blue-600' },
  ALIMTALK: { label: '알림톡', className: 'bg-yellow-50 text-yellow-700' },
};

const TYPE_LABELS: Record<string, string> = {
  VISIT_REMINDER: '방문예정 알림',
  POST_VISIT: '시술완료 알림',
  PROMOTION: '프로모션',
  CUSTOM: '일반 메시지',
  BOOKING_CONFIRM: '예약확인',
  BOOKING_CANCEL: '예약취소',
};

const TIER_OPTIONS = [
  { value: 'ALL', label: '전체 고객' },
  { value: 'VIP', label: 'VIP' },
  { value: 'VVIP', label: 'VVIP' },
  { value: 'GOLD', label: 'GOLD' },
  { value: 'SILVER', label: 'SILVER' },
  { value: 'NORMAL', label: '일반' },
];

// ─── Tab definitions ─────────────────────────────────────────

const TABS = [
  { key: 'send', label: '문자 발송', icon: PaperPlaneTilt },
  { key: 'auto', label: '자동 알림', icon: Bell },
  { key: 'history', label: '발송 내역', icon: ClockCounterClockwise },
  { key: 'templates', label: '템플릿 관리', icon: FileText },
] as const;

type TabKey = typeof TABS[number]['key'];

// ─── Main Component ──────────────────────────────────────────

export function MessageCenter() {
  const [activeTab, setActiveTab] = useState<TabKey>('send');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] shadow-[0_2px_8px_rgba(255,107,107,0.3)]">
          <ChatCircleDots size={20} weight="fill" className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2D3436]">고객연락망</h1>
          <p className="text-xs text-[#636E72]">SMS, 알림톡 발송 및 관리</p>
        </div>
      </div>

      {/* Stats Banner */}
      <StatsBanner />

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-[#FFF8F6] p-1 ring-1 ring-[#FFE4E0]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white text-[#FF6B6B] shadow-soft ring-1 ring-[#FFE4E0]'
                  : 'text-[#636E72] hover:text-[#2D3436]',
              )}
            >
              <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'send' && <SendMessageTab />}
      {activeTab === 'auto' && <AutoNotificationsTab />}
      {activeTab === 'history' && <MessageHistoryTab />}
      {activeTab === 'templates' && <TemplateManagementTab />}
    </div>
  );
}

// ─── Stats Banner ────────────────────────────────────────────

function StatsBanner() {
  const { data: stats, isLoading } = useMessageStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-4 ring-1 ring-[#FFE4E0] animate-pulse">
            <div className="h-4 w-16 bg-[#FFE4E0] rounded mb-2" />
            <div className="h-7 w-12 bg-[#FFE4E0] rounded" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    { label: '이번달 발송', value: stats?.total ?? 0 },
    { label: 'SMS', value: stats?.smsCount ?? 0 },
    { label: '알림톡', value: stats?.alimtalkCount ?? 0 },
    { label: '발송 성공', value: stats?.sentCount ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-white p-4 ring-1 ring-[#FFE4E0] shadow-soft">
          <p className="text-xs text-[#636E72] mb-1">{item.label}</p>
          <p className="text-2xl font-bold text-[#2D3436]">{item.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Tab 1: Send Message ─────────────────────────────────────

function SendMessageTab() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState<'SMS' | 'ALIMTALK'>('SMS');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const sendSms = useSendSms();
  const sendBulkSms = useSendBulkSms();
  const sendAlimtalk = useSendAlimtalk();
  const { data: templates } = useMessageTemplates();
  const { data: customersData } = useCustomers({ search: customerSearch, limit: 10 });
  const customers = customersData?.data ?? [];

  const charCount = content.length;
  const isLongSms = charCount > 90;

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    const t = templates?.find((tpl) => tpl.id === templateId);
    if (t) setContent(t.content);
  }

  function toggleCustomer(customer: any) {
    setSelectedCustomerIds((prev) =>
      prev.includes(customer.id)
        ? prev.filter((id) => id !== customer.id)
        : [...prev, customer.id],
    );
  }

  async function handleSend() {
    if (!content.trim()) {
      toast('error', '메시지 내용을 입력해주세요');
      return;
    }

    try {
      if (mode === 'single') {
        if (!selectedCustomer) {
          toast('error', '수신자를 선택해주세요');
          return;
        }
        if (channel === 'SMS') {
          await sendSms.mutateAsync({
            customerId: selectedCustomer.id,
            recipientPhone: selectedCustomer.phone,
            recipientName: selectedCustomer.name,
            content,
            templateId: selectedTemplateId || undefined,
          });
        } else {
          await sendAlimtalk.mutateAsync({
            customerId: selectedCustomer.id,
            recipientPhone: selectedCustomer.phone,
            recipientName: selectedCustomer.name,
            content,
            templateId: selectedTemplateId || undefined,
          });
        }
        toast('success', '메시지가 발송되었습니다');
      } else {
        await sendBulkSms.mutateAsync({
          customerIds: selectedCustomerIds.length > 0 ? selectedCustomerIds : undefined,
          tier: selectedCustomerIds.length === 0 ? selectedTier : undefined,
          content,
          templateId: selectedTemplateId || undefined,
        });
        toast('success', '단체 메시지가 발송되었습니다');
      }
      setContent('');
      setSelectedCustomer(null);
      setSelectedCustomerIds([]);
      setSelectedTemplateId('');
    } catch (err: any) {
      toast('error', err.message || '발송에 실패했습니다');
    }
  }

  const isSending = sendSms.isPending || sendBulkSms.isPending || sendAlimtalk.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Compose */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft space-y-5">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('single')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                mode === 'single'
                  ? 'bg-[#FF6B6B15] text-[#FF6B6B] ring-1 ring-[#FF6B6B40]'
                  : 'text-[#636E72] hover:bg-[#FFF5F5]',
              )}
            >
              <User size={16} /> 개별 발송
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                mode === 'bulk'
                  ? 'bg-[#FF6B6B15] text-[#FF6B6B] ring-1 ring-[#FF6B6B40]'
                  : 'text-[#636E72] hover:bg-[#FFF5F5]',
              )}
            >
              <UsersThree size={16} /> 단체 발송
            </button>
          </div>

          {/* Channel */}
          <div>
            <label className="text-xs font-medium text-[#636E72] mb-1.5 block">발송 채널</label>
            <div className="flex gap-2">
              {(['SMS', 'ALIMTALK'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                    channel === ch
                      ? 'bg-[#FF6B6B15] text-[#FF6B6B] ring-1 ring-[#FF6B6B40]'
                      : 'text-[#636E72] hover:bg-[#FFF5F5] ring-1 ring-[#FFE4E0]',
                  )}
                >
                  {ch === 'SMS' ? 'SMS' : '카카오 알림톡'}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Selection */}
          {mode === 'single' ? (
            <div className="relative">
              <label className="text-xs font-medium text-[#636E72] mb-1.5 block">수신자</label>
              {selectedCustomer ? (
                <div className="flex items-center gap-2 rounded-xl bg-[#FFF8F6] px-3 py-2.5 ring-1 ring-[#FFE4E0]">
                  <span className="text-sm font-medium text-[#2D3436]">{selectedCustomer.name}</span>
                  <span className="text-xs text-[#636E72]">{formatPhone(selectedCustomer.phone)}</span>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="ml-auto text-xs text-[#FF6B6B] hover:underline"
                  >
                    변경
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#636E72]/50" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="고객명 또는 전화번호 검색..."
                    className="w-full rounded-xl bg-[#FFF8F6] pl-9 pr-3 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none"
                  />
                  {showCustomerDropdown && customers.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-white ring-1 ring-[#FFE4E0] shadow-soft-lg max-h-48 overflow-y-auto">
                      {customers.map((c: any) => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#FFF5F5] transition-colors"
                        >
                          <span className="text-sm font-medium text-[#2D3436]">{c.name}</span>
                          <span className="text-xs text-[#636E72]">{formatPhone(c.phone)}</span>
                          {c.tier !== 'NORMAL' && (
                            <span className="ml-auto text-[10px] font-medium text-[#FF6B6B] bg-[#FF6B6B15] rounded px-1.5 py-0.5">{c.tier}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-medium text-[#636E72] mb-1.5 block">수신 대상</label>
              <select
                value={selectedTier}
                onChange={(e) => { setSelectedTier(e.target.value); setSelectedCustomerIds([]); }}
                className="w-full rounded-xl bg-[#FFF8F6] px-3 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none"
              >
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {selectedCustomerIds.length > 0 && (
                <p className="text-xs text-[#636E72]">{selectedCustomerIds.length}명 선택됨</p>
              )}
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="text-xs font-medium text-[#636E72] mb-1.5 block">템플릿 선택 (선택사항)</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full rounded-xl bg-[#FFF8F6] px-3 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none"
            >
              <option value="">직접 입력</option>
              {(templates ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Message Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#636E72]">메시지 내용</label>
              <span className={cn(
                'text-xs',
                charCount > 2000 ? 'text-red-500' : isLongSms ? 'text-yellow-600' : 'text-[#636E72]',
              )}>
                {charCount}자 {isLongSms ? '(장문)' : `(단문 ${90 - charCount}자 남음)`}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={2000}
              placeholder="메시지 내용을 입력하세요...&#10;&#10;변수: {고객명}, {매장명}, {예약일시}, {서비스명}"
              className="w-full rounded-xl bg-[#FFF8F6] px-3 py-3 text-sm ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none resize-none"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isSending || !content.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FFA07A] px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)] hover:shadow-[0_4px_12px_rgba(255,107,107,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <SpinnerGap size={18} className="animate-spin" />
            ) : (
              <PaperPlaneRight size={18} weight="fill" />
            )}
            {mode === 'single' ? '발송' : '단체 발송'}
          </button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[#FFE4E0] shadow-soft">
          <h3 className="text-sm font-semibold text-[#2D3436] mb-3">미리보기</h3>
          <div className="rounded-xl bg-[#FFF8F6] p-4 ring-1 ring-[#FFE4E0] min-h-[200px]">
            {content ? (
              <p className="text-sm text-[#2D3436] whitespace-pre-wrap break-words">{content}</p>
            ) : (
              <p className="text-sm text-[#636E72]/50 text-center mt-16">메시지를 입력하면 미리보기가 표시됩니다</p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#636E72]">
            <span>{channel === 'SMS' ? 'SMS' : '카카오 알림톡'}</span>
            <span>{charCount}자</span>
          </div>
        </div>

        {/* Variable hint */}
        <div className="rounded-2xl bg-white p-4 ring-1 ring-[#FFE4E0] shadow-soft">
          <h3 className="text-xs font-semibold text-[#2D3436] mb-2">사용 가능한 변수</h3>
          <div className="space-y-1">
            {['{고객명}', '{매장명}', '{예약일시}', '{서비스명}'].map((v) => (
              <button
                key={v}
                onClick={() => setContent((prev) => prev + v)}
                className="block text-xs text-[#FF6B6B] hover:underline"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Auto Notifications ───────────────────────────────

function AutoNotificationsTab() {
  const sendReminder = useSendVisitReminder();
  const sendPostVisit = useSendPostVisitMessage();

  const autoItems = [
    {
      key: 'visit-reminder',
      title: '방문예정 알림',
      description: '내일 예약이 있는 고객에게 자동으로 알림을 발송합니다',
      schedule: '예약 전날 오전 10시',
      icon: Bell,
      onTest: () => sendReminder.mutateAsync().then(() => toast('success', '방문 알림이 발송되었습니다')).catch((e: any) => toast('error', e.message)),
      isPending: sendReminder.isPending,
    },
    {
      key: 'post-visit',
      title: '시술완료 알림',
      description: '오늘 시술을 받은 고객에게 감사 메시지를 발송합니다',
      schedule: '시술 완료 후 2시간',
      icon: ChatTeardropText,
      onTest: () => sendPostVisit.mutateAsync().then(() => toast('success', '시술완료 알림이 발송되었습니다')).catch((e: any) => toast('error', e.message)),
      isPending: sendPostVisit.isPending,
    },
    {
      key: 'booking-confirm',
      title: '예약확인 알림',
      description: '새 예약이 생성되면 고객에게 확인 메시지를 발송합니다',
      schedule: '예약 생성 즉시',
      icon: PaperPlaneTilt,
      onTest: undefined,
      isPending: false,
    },
    {
      key: 'booking-cancel',
      title: '예약취소 알림',
      description: '예약이 취소되면 고객에게 안내 메시지를 발송합니다',
      schedule: '예약 취소 즉시',
      icon: ClockCounterClockwise,
      onTest: undefined,
      isPending: false,
    },
  ];

  return (
    <div className="space-y-4">
      {autoItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="rounded-2xl bg-white p-5 ring-1 ring-[#FFE4E0] shadow-soft">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6B6B15]">
                <Icon size={20} className="text-[#FF6B6B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#2D3436]">{item.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">활성</span>
                </div>
                <p className="text-xs text-[#636E72] mb-2">{item.description}</p>
                <p className="text-[11px] text-[#636E72]/70">발송 시점: {item.schedule}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.onTest && (
                  <button
                    onClick={item.onTest}
                    disabled={item.isPending}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-[#FF6B6B] ring-1 ring-[#FF6B6B40] hover:bg-[#FF6B6B10] transition-all disabled:opacity-50"
                  >
                    {item.isPending ? (
                      <SpinnerGap size={14} className="animate-spin" />
                    ) : (
                      <PaperPlaneRight size={14} />
                    )}
                    테스트 발송
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="rounded-2xl bg-[#FFF8F6] p-4 ring-1 ring-[#FFE4E0]">
        <p className="text-xs text-[#636E72]">
          자동 알림은 시스템이 설정된 시점에 자동으로 발송합니다. 예약확인/취소 알림은 예약 생성/취소 시 즉시 발송됩니다.
          SMS API 키가 설정되지 않은 경우 시뮬레이션 모드로 동작합니다.
        </p>
      </div>
    </div>
  );
}

// ─── Tab 3: Message History ──────────────────────────────────

function MessageHistoryTab() {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: messagesData, isLoading } = useMessages({
    type: filterType || undefined,
    channel: filterChannel || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: 20,
  });

  const messages = messagesData?.data ?? [];
  const meta = messagesData?.meta;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-[#FFE4E0] shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <Funnel size={16} className="text-[#636E72]" />
          <span className="text-xs font-semibold text-[#2D3436]">필터</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-[#636E72] mb-1 block">채널</label>
            <select
              value={filterChannel}
              onChange={(e) => { setFilterChannel(e.target.value); setPage(1); }}
              className="w-full rounded-lg bg-[#FFF8F6] px-2.5 py-2 text-xs ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none"
            >
              <option value="">전체</option>
              <option value="SMS">SMS</option>
              <option value="ALIMTALK">알림톡</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[#636E72] mb-1 block">유형</label>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="w-full rounded-lg bg-[#FFF8F6] px-2.5 py-2 text-xs ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none"
            >
              <option value="">전체</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[#636E72] mb-1 block">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full rounded-lg bg-[#FFF8F6] px-2.5 py-2 text-xs ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#636E72] mb-1 block">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full rounded-lg bg-[#FFF8F6] px-2.5 py-2 text-xs ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-4 ring-1 ring-[#FFE4E0] animate-pulse">
              <div className="h-4 w-32 bg-[#FFE4E0] rounded mb-2" />
              <div className="h-3 w-64 bg-[#FFE4E0] rounded" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 ring-1 ring-[#FFE4E0] shadow-soft text-center">
          <ChatCircleDots size={48} className="mx-auto text-[#FFE4E0] mb-3" />
          <p className="text-sm font-medium text-[#636E72]">발송 내역이 없습니다</p>
          <p className="text-xs text-[#636E72]/70 mt-1">메시지를 발송하면 여기에 내역이 표시됩니다</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl bg-white ring-1 ring-[#FFE4E0] shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FFE4E0] bg-[#FFF8F6]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#636E72]">수신자</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#636E72]">내용</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[#636E72]">채널</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[#636E72]">상태</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#636E72]">발송일시</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => {
                  const status = STATUS_BADGE[msg.status] || STATUS_BADGE.PENDING;
                  const ch = CHANNEL_BADGE[msg.channel] || CHANNEL_BADGE.SMS;
                  return (
                    <tr key={msg.id} className="border-b border-[#FFE4E0] last:border-0 hover:bg-[#FFF8F6] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#2D3436]">{msg.recipientName || '-'}</p>
                        <p className="text-xs text-[#636E72]">{formatPhone(msg.recipientPhone)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#2D3436] truncate max-w-[300px]">{msg.content}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-block text-[11px] font-medium px-2 py-0.5 rounded-full', ch.className)}>
                          {ch.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-block text-[11px] font-medium px-2 py-0.5 rounded-full', status.className)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-[#636E72]">
                        {msg.sentAt ? formatDateKr(msg.sentAt) : formatDateKr(msg.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {messages.map((msg) => {
              const status = STATUS_BADGE[msg.status] || STATUS_BADGE.PENDING;
              const ch = CHANNEL_BADGE[msg.channel] || CHANNEL_BADGE.SMS;
              return (
                <div key={msg.id} className="rounded-2xl bg-white p-4 ring-1 ring-[#FFE4E0] shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-[#2D3436]">{msg.recipientName || '-'}</span>
                      <span className="ml-2 text-xs text-[#636E72]">{formatPhone(msg.recipientPhone)}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', ch.className)}>{ch.label}</span>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', status.className)}>{status.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#2D3436] line-clamp-2 mb-2">{msg.content}</p>
                  <p className="text-[11px] text-[#636E72]">{msg.sentAt ? formatDateKr(msg.sentAt) : formatDateKr(msg.createdAt)}</p>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-[#FFE4E0] hover:bg-[#FFF5F5] disabled:opacity-30 transition-all"
              >
                <CaretLeft size={14} />
              </button>
              <span className="text-xs text-[#636E72]">{page} / {meta.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-[#FFE4E0] hover:bg-[#FFF5F5] disabled:opacity-30 transition-all"
              >
                <CaretRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Tab 4: Template Management ──────────────────────────────

function TemplateManagementTab() {
  const { data: templates, isLoading } = useMessageTemplates();
  const createTemplate = useCreateMessageTemplate();
  const deleteTemplate = useDeleteMessageTemplate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#636E72]">자주 사용하는 메시지를 템플릿으로 저장하여 빠르게 발송할 수 있습니다</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FFA07A] px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)] hover:shadow-[0_4px_12px_rgba(255,107,107,0.4)] transition-all"
        >
          <Plus size={16} weight="bold" />
          새 템플릿
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-4 ring-1 ring-[#FFE4E0] animate-pulse">
              <div className="h-4 w-24 bg-[#FFE4E0] rounded mb-2" />
              <div className="h-3 w-48 bg-[#FFE4E0] rounded" />
            </div>
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 ring-1 ring-[#FFE4E0] shadow-soft text-center">
          <FileText size={48} className="mx-auto text-[#FFE4E0] mb-3" />
          <p className="text-sm font-medium text-[#636E72]">저장된 템플릿이 없습니다</p>
          <p className="text-xs text-[#636E72]/70 mt-1">새 템플릿을 추가하여 메시지 발송을 효율적으로 관리하세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <div key={tpl.id} className="rounded-2xl bg-white p-5 ring-1 ring-[#FFE4E0] shadow-soft">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#2D3436]">{tpl.name}</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FF6B6B15] text-[#FF6B6B]">
                    {TYPE_LABELS[tpl.type] || tpl.type}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await deleteTemplate.mutateAsync(tpl.id);
                      toast('success', '템플릿이 삭제되었습니다');
                    } catch (e: any) {
                      toast('error', e.message);
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#636E72] hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash size={16} />
                </button>
              </div>
              <p className="text-xs text-[#636E72] whitespace-pre-wrap">{tpl.content}</p>
              <p className="text-[11px] text-[#636E72]/50 mt-2">
                {formatDateShort(tpl.createdAt)} 생성
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      <CreateTemplateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}

// ─── Create Template Modal ───────────────────────────────────

function CreateTemplateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createTemplate = useCreateMessageTemplate();
  const [form, setForm] = useState({
    name: '',
    content: '',
    type: 'CUSTOM' as string,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '템플릿 이름을 입력하세요';
    if (!form.content.trim()) errs.content = '템플릿 내용을 입력하세요';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    try {
      await createTemplate.mutateAsync(form);
      toast('success', '템플릿이 생성되었습니다');
      onOpenChange(false);
      setForm({ name: '', content: '', type: 'CUSTOM' });
      setErrors({});
    } catch (err: any) {
      toast('error', err.message || '생성에 실패했습니다');
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="새 템플릿 만들기" size="md">
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-[#636E72] mb-1 block">템플릿 이름</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="예: 방문 감사 메시지"
            className={cn(
              'w-full rounded-xl bg-[#FFF8F6] px-3 py-2.5 text-sm ring-1 focus:outline-none transition-all',
              errors.name ? 'ring-red-300 focus:ring-red-400' : 'ring-[#FFE4E0] focus:ring-[#FF6B6B]',
            )}
          />
          {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-medium text-[#636E72] mb-1 block">유형</label>
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            className="w-full rounded-xl bg-[#FFF8F6] px-3 py-2.5 text-sm ring-1 ring-[#FFE4E0] focus:ring-[#FF6B6B] focus:outline-none"
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-[#636E72]">내용</label>
            <span className="text-[11px] text-[#636E72]">{form.content.length}자</span>
          </div>
          <textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            rows={5}
            placeholder="템플릿 내용을 입력하세요...&#10;변수: {고객명}, {매장명}, {예약일시}, {서비스명}"
            className={cn(
              'w-full rounded-xl bg-[#FFF8F6] px-3 py-3 text-sm ring-1 focus:outline-none resize-none transition-all',
              errors.content ? 'ring-red-300 focus:ring-red-400' : 'ring-[#FFE4E0] focus:ring-[#FF6B6B]',
            )}
          />
          {errors.content && <p className="text-[11px] text-red-500 mt-1">{errors.content}</p>}
        </div>

        {/* Variable hint */}
        <div className="rounded-xl bg-[#FFF8F6] px-3 py-2.5 ring-1 ring-[#FFE4E0]">
          <p className="text-[11px] text-[#636E72] mb-1">사용 가능한 변수:</p>
          <div className="flex flex-wrap gap-1.5">
            {['{고객명}', '{매장명}', '{예약일시}', '{서비스명}'].map((v) => (
              <button
                key={v}
                onClick={() => setForm((p) => ({ ...p, content: p.content + v }))}
                className="text-[11px] text-[#FF6B6B] bg-white px-2 py-0.5 rounded-md ring-1 ring-[#FFE4E0] hover:ring-[#FF6B6B40] transition-all"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-[#636E72] ring-1 ring-[#FFE4E0] hover:bg-[#FFF5F5] transition-all"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={createTemplate.isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FFA07A] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)] hover:shadow-[0_4px_12px_rgba(255,107,107,0.4)] transition-all disabled:opacity-50"
          >
            {createTemplate.isPending && <SpinnerGap size={16} className="animate-spin" />}
            저장
          </button>
        </div>
      </div>
    </Modal>
  );
}

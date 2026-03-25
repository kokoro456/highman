import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// ─── Types ───────────────────────────────────────────────────

export interface Message {
  id: string;
  shopId: string;
  customerId: string | null;
  type: MessageType;
  channel: MessageChannel;
  recipientPhone: string;
  recipientName: string | null;
  content: string;
  status: MessageStatus;
  sentAt: string | null;
  failReason: string | null;
  templateId: string | null;
  createdAt: string;
  customer?: { id: string; name: string; phone: string } | null;
}

export interface MessageTemplate {
  id: string;
  shopId: string;
  name: string;
  content: string;
  type: MessageType;
  isActive: boolean;
  createdAt: string;
}

export type MessageType = 'VISIT_REMINDER' | 'POST_VISIT' | 'PROMOTION' | 'CUSTOM' | 'BOOKING_CONFIRM' | 'BOOKING_CANCEL';
export type MessageChannel = 'SMS' | 'ALIMTALK';
export type MessageStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

interface MessageListResponse {
  data: Message[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  message: string;
}

interface MessageStatsResponse {
  data: {
    total: number;
    smsCount: number;
    alimtalkCount: number;
    sentCount: number;
    failedCount: number;
  };
  message: string;
}

interface TemplateListResponse {
  data: MessageTemplate[];
  message: string;
}

interface BulkSmsResponse {
  data: {
    total: number;
    sent: number;
    failed: number;
    messages: Message[];
  };
  message: string;
}

// ─── Hooks ───────────────────────────────────────────────────

export function useMessages(params: {
  type?: string;
  channel?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.set('type', params.type);
  if (params.channel) queryParams.set('channel', params.channel);
  if (params.startDate) queryParams.set('startDate', params.startDate);
  if (params.endDate) queryParams.set('endDate', params.endDate);
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));

  return useQuery({
    queryKey: ['messages', params],
    queryFn: () => api.get<MessageListResponse>(`/messages?${queryParams}`),
  });
}

export function useMessageStats() {
  return useQuery({
    queryKey: ['message-stats'],
    queryFn: () => api.get<MessageStatsResponse>('/messages/stats'),
    select: (data) => data.data,
  });
}

export function useMessageTemplates() {
  return useQuery({
    queryKey: ['message-templates'],
    queryFn: () => api.get<TemplateListResponse>('/messages/templates'),
    select: (data) => data.data,
  });
}

export function useSendSms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      customerId?: string;
      recipientPhone: string;
      recipientName?: string;
      content: string;
      type?: string;
      templateId?: string;
    }) => api.post<{ data: Message; message: string }>('/messages/sms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
    },
  });
}

export function useSendBulkSms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      customerIds?: string[];
      tier?: string;
      content: string;
      type?: string;
      templateId?: string;
    }) => api.post<BulkSmsResponse>('/messages/bulk-sms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
    },
  });
}

export function useSendAlimtalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      customerId?: string;
      recipientPhone: string;
      recipientName?: string;
      content: string;
      type?: string;
      templateId?: string;
    }) => api.post<{ data: Message; message: string }>('/messages/alimtalk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
    },
  });
}

export function useSendVisitReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<any>('/messages/visit-reminder', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
    },
  });
}

export function useSendPostVisitMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<any>('/messages/post-visit', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
    },
  });
}

export function useCreateMessageTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; content: string; type: string }) =>
      api.post<{ data: MessageTemplate; message: string }>('/messages/templates', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['message-templates'] }),
  });
}

export function useDeleteMessageTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ data: MessageTemplate; message: string }>(`/messages/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['message-templates'] }),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface Notification {
  id: string;
  shopId: string;
  userId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata: any;
  createdAt: string;
}

interface NotificationListResponse {
  data: Notification[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  message: string;
}

interface UnreadCountResponse {
  data: { count: number };
  message: string;
}

export function useNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  if (params.unreadOnly) queryParams.set('unreadOnly', 'true');

  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => api.get<NotificationListResponse>(`/notifications?${queryParams}`),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get<UnreadCountResponse>('/notifications/count'),
    select: (data) => data.data.count,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
}

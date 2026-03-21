import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<any>('/admin/stats'),
    select: (data) => data.data,
    refetchInterval: 60 * 1000,
  });
}

export function useAdminShops(search?: string) {
  return useQuery({
    queryKey: ['admin', 'shops', search],
    queryFn: () =>
      api.get<any>(`/admin/shops${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    select: (data) => data.data,
  });
}

export function useAdminShopDetail(shopId: string) {
  return useQuery({
    queryKey: ['admin', 'shops', shopId],
    queryFn: () => api.get<any>(`/admin/shops/${shopId}`),
    select: (data) => data.data,
    enabled: !!shopId,
  });
}

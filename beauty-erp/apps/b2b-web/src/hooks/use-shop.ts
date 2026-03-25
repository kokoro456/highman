import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useMyShops() {
  return useQuery({
    queryKey: ['my-shops'],
    queryFn: () => api.get<any>('/shops'),
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000, // Shop data rarely changes - 10 min cache
  });
}

export function useShop(id: string) {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: () => api.get<any>(`/shops/${id}`),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/shops/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop'] }),
  });
}

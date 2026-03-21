import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface InventoryItem {
  id: string;
  shopId: string;
  name: string;
  category: string | null;
  unit: string;
  quantity: number;
  minQuantity: number;
  price: number;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InventoryListResponse {
  data: InventoryItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  lowStockCount: number;
  message: string;
}

interface InventoryLog {
  id: string;
  itemId: string;
  type: string;
  quantity: number;
  memo: string | null;
  createdAt: string;
}

interface InventoryLogListResponse {
  data: InventoryLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  message: string;
}

export function useInventory(params: { page?: number; limit?: number; search?: string; lowStockOnly?: boolean } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  if (params.search) queryParams.set('search', params.search);
  if (params.lowStockOnly) queryParams.set('lowStockOnly', 'true');

  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => api.get<InventoryListResponse>(`/inventory?${queryParams}`),
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      category?: string;
      unit?: string;
      quantity?: number;
      minQuantity?: number;
      price?: number;
    }) => api.post('/inventory', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/inventory/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useAddInventoryLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { type: string; quantity: number; memo?: string } }) =>
      api.post(`/inventory/${id}/log`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
    },
  });
}

export function useInventoryLogs(itemId: string, params: { page?: number; limit?: number } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));

  return useQuery({
    queryKey: ['inventory-logs', itemId, params],
    queryFn: () => api.get<InventoryLogListResponse>(`/inventory/${itemId}/logs?${queryParams}`),
    enabled: !!itemId,
  });
}

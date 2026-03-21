import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface CreateOrderData {
  amount: number;
  productName: string;
  customerName?: string;
  customerPhone?: string;
}

interface ConfirmPaymentData {
  orderId: string;
  paymentKey: string;
  amount: number;
}

export function useClientKey() {
  return useQuery({
    queryKey: ['pg-client-key'],
    queryFn: () => api.get<any>('/pg/client-key'),
    select: (data) => data.data.clientKey as string,
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: CreateOrderData) => api.post<any>('/pg/orders', data),
  });
}

export function useConfirmPayment() {
  return useMutation({
    mutationFn: (data: ConfirmPaymentData) => api.post<any>('/pg/confirm', data),
  });
}

export function usePgHistory(page = 1) {
  return useQuery({
    queryKey: ['pg-history', page],
    queryFn: () => api.get<any>(`/pg/history?page=${page}`),
  });
}

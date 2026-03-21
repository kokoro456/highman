import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function usePayments(params: { page?: number; startDate?: string; endDate?: string } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', String(params.page));
  if (params.startDate) queryParams.set('startDate', params.startDate);
  if (params.endDate) queryParams.set('endDate', params.endDate);

  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => api.get<any>(`/payments?${queryParams}`),
  });
}

export function usePaymentSummary(date: string) {
  return useQuery({
    queryKey: ['payment-summary', date],
    queryFn: () => api.get<any>(`/payments/summary?date=${date}`),
    select: (data) => data.data,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
    },
  });
}

export function usePasses(customerId?: string) {
  const queryParams = customerId ? `?customerId=${customerId}` : '';
  return useQuery({
    queryKey: ['passes', customerId],
    queryFn: () => api.get<any>(`/payments/passes${queryParams}`),
    select: (data) => data.data,
  });
}

export function useCreatePass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/payments/passes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['passes'] }),
  });
}

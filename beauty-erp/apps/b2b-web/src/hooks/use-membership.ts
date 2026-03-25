import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// ==================== CARDS ====================

export function useMembershipCards(customerId: string) {
  return useQuery({
    queryKey: ['membership-cards', customerId],
    queryFn: () => api.get<any>(`/membership/cards?customerId=${customerId}`),
    select: (data) => data.data,
    enabled: !!customerId,
  });
}

export function useCreateMembershipCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/membership/cards', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['membership-cards'] }),
  });
}

export function useUseMembershipCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; amount: number; description: string }) =>
      api.post(`/membership/cards/${id}/use`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['membership-cards'] }),
  });
}

export function useChargeMembershipCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; amount?: number; count?: number }) =>
      api.post(`/membership/cards/${id}/charge`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['membership-cards'] }),
  });
}

// ==================== POINTS ====================

export function usePointBalance(customerId: string) {
  return useQuery({
    queryKey: ['point-balance', customerId],
    queryFn: () => api.get<any>(`/membership/points/balance?customerId=${customerId}`),
    select: (data) => data.data,
    enabled: !!customerId,
  });
}

export function usePointHistory(customerId: string) {
  return useQuery({
    queryKey: ['point-history', customerId],
    queryFn: () => api.get<any>(`/membership/points?customerId=${customerId}`),
    select: (data) => data.data,
    enabled: !!customerId,
  });
}

export function useEarnPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { customerId: string; points: number; description: string }) =>
      api.post('/membership/points/earn', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['point-balance', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['point-history', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
}

export function useSpendPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { customerId: string; points: number; description: string }) =>
      api.post('/membership/points/spend', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['point-balance', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['point-history', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
}

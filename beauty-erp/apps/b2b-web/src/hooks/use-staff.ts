import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => api.get<any>('/staff'),
    select: (data) => data.data,
  });
}

export function useStaffDetail(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => api.get<any>(`/staff/${id}`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/staff', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/staff/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useStaffStats(id: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['staff-stats', id, startDate, endDate],
    queryFn: () => api.get<any>(`/staff/${id}/stats?startDate=${startDate}&endDate=${endDate}`),
    select: (data) => data.data,
    enabled: !!id && !!startDate && !!endDate,
  });
}

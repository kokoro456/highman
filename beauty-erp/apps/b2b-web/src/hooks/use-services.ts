import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: () => api.get<any>('/services/categories'),
    select: (data) => data.data,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => api.get<any>('/services'),
    select: (data) => data.data,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

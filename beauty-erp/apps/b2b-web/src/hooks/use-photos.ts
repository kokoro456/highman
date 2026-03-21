import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface CustomerPhoto {
  id: string;
  shopId: string;
  customerId: string;
  treatmentId?: string;
  type: 'BEFORE' | 'AFTER' | 'PROGRESS';
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

interface PhotoListResponse {
  data: CustomerPhoto[];
  message: string;
}

interface PhotoResponse {
  data: CustomerPhoto;
  message: string;
}

export function usePhotos(customerId: string, type?: string) {
  const params = new URLSearchParams({ customerId });
  if (type) params.set('type', type);

  return useQuery({
    queryKey: ['photos', customerId, type],
    queryFn: () => api.get<PhotoListResponse>(`/photos?${params}`),
    select: (data) => data.data,
    enabled: !!customerId,
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      customerId: string;
      type: string;
      caption?: string;
      imageUrl: string;
      treatmentId?: string;
    }) => api.post<PhotoResponse>('/photos', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.customerId] });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId: string }) =>
      api.delete(`/photos/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.customerId] });
    },
  });
}

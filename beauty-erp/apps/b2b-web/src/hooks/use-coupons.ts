import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface Coupon {
  id: string;
  shopId: string;
  code: string;
  name: string;
  type: 'FIXED' | 'PERCENTAGE';
  value: string;
  minAmount: string | null;
  maxDiscount: string | null;
  startDate: string;
  endDate: string;
  maxUsage: number | null;
  usedCount: number;
  isActive: boolean;
  isExpired: boolean;
  usageCount: number;
  createdAt: string;
}

interface CouponListResponse {
  data: Coupon[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  message: string;
}

interface CouponDetailResponse {
  data: Coupon & { usages: any[] };
  message: string;
}

interface ValidateResponse {
  data: {
    coupon: Coupon;
    discount: number;
  };
  message: string;
}

export function useCoupons(params: { page?: number; limit?: number; status?: string } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  if (params.status) queryParams.set('status', params.status);

  return useQuery({
    queryKey: ['coupons', params],
    queryFn: () => api.get<CouponListResponse>(`/coupons?${queryParams}`),
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: () => api.get<CouponDetailResponse>(`/coupons/${id}`),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      type: 'FIXED' | 'PERCENTAGE';
      value: number;
      minAmount?: number;
      maxDiscount?: number;
      startDate: string;
      endDate: string;
      maxUsage?: number;
    }) => api.post('/coupons', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/coupons/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
}

export function useDeactivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (data: { code: string; amount?: number }) =>
      api.post<ValidateResponse>('/coupons/validate', data),
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; customerId: string; paymentId?: string; amount: number }) =>
      api.post('/coupons/apply', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
}

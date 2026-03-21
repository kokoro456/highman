import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface BookingResponse {
  data: any[];
  message: string;
}

export function useBookings(date: string) {
  return useQuery({
    queryKey: ['bookings', date],
    queryFn: () => api.get<BookingResponse>(`/bookings?date=${date}`),
    select: (data) => data.data,
  });
}

export function useBookingsByRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['bookings', 'range', startDate, endDate],
    queryFn: () => api.get<BookingResponse>(`/bookings?startDate=${startDate}&endDate=${endDate}`),
    select: (data) => data.data,
    enabled: !!startDate && !!endDate,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/bookings', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.get<any>('/dashboard/overview'),
    select: (data) => data.data,
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useRevenueChart(days: number = 7) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-chart', days],
    queryFn: () => api.get<any>(`/dashboard/revenue-chart?days=${days}`),
    select: (data) => data.data,
  });
}

export function useUpcomingBookings(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-bookings', limit],
    queryFn: () => api.get<any>(`/dashboard/upcoming-bookings?limit=${limit}`),
    select: (data) => data.data,
  });
}

export function useStaffPerformance(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['dashboard', 'staff-performance', startDate, endDate],
    queryFn: () => api.get<any>(`/dashboard/staff-performance?startDate=${startDate}&endDate=${endDate}`),
    select: (data) => data.data,
    enabled: !!startDate && !!endDate,
  });
}

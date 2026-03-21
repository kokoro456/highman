import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useRevenueReport(year: number, month: number) {
  return useQuery({
    queryKey: ['reports', 'revenue', year, month],
    queryFn: () =>
      api.get<any>(
        `/dashboard/reports/revenue?period=monthly&year=${year}&month=${month}`,
      ),
    select: (data) => data.data,
    enabled: !!year && !!month,
  });
}

export function useServiceReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'services', startDate, endDate],
    queryFn: () =>
      api.get<any>(
        `/dashboard/reports/services?startDate=${startDate}&endDate=${endDate}`,
      ),
    select: (data) => data.data,
    enabled: !!startDate && !!endDate,
  });
}

export function useCustomerReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'customers', startDate, endDate],
    queryFn: () =>
      api.get<any>(
        `/dashboard/reports/customers?startDate=${startDate}&endDate=${endDate}`,
      ),
    select: (data) => data.data,
    enabled: !!startDate && !!endDate,
  });
}

export function useHourlyReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'hourly', startDate, endDate],
    queryFn: () =>
      api.get<any>(
        `/dashboard/reports/hourly?startDate=${startDate}&endDate=${endDate}`,
      ),
    select: (data) => data.data,
    enabled: !!startDate && !!endDate,
  });
}

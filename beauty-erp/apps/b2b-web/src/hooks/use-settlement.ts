import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface StaffSettlement {
  staffId: string;
  name: string;
  role: string;
  totalBookings: number;
  totalRevenue: number;
  incentiveAmount: number;
  baseSalary: number;
  totalPay: number;
}

export interface StaffSettlementDetail extends StaffSettlement {
  serviceBreakdown: {
    serviceId: string;
    serviceName: string;
    bookingCount: number;
    revenue: number;
  }[];
  dailyRevenue: {
    date: string;
    revenue: number;
  }[];
  incentiveBreakdown: {
    type: string;
    serviceName: string | null;
    rate: number;
    amount: number;
  }[];
}

export function useSettlement(month: string) {
  return useQuery({
    queryKey: ['settlement', month],
    queryFn: () => api.get<{ data: StaffSettlement[] }>(`/staff/settlement?month=${month}`),
    select: (res) => res.data,
    enabled: !!month,
  });
}

export function useStaffSettlement(staffId: string, month: string) {
  return useQuery({
    queryKey: ['settlement', staffId, month],
    queryFn: () => api.get<{ data: StaffSettlementDetail }>(`/staff/${staffId}/settlement?month=${month}`),
    select: (res) => res.data,
    enabled: !!staffId && !!month,
  });
}

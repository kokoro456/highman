export interface DailySales {
  id: string;
  shopId: string;
  date: Date;
  totalRevenue: number;
  cardRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  passRevenue: number;
  refundAmount: number;
  bookingCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  newCustomerCount: number;
  returningCustomerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

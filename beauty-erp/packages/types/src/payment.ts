import { PaymentMethod, PaymentStatus, PassType, PassStatus, PassUsageType } from './enums';

export interface Payment {
  id: string;
  shopId: string;
  customerId: string;
  bookingId: string | null;
  staffId: string;
  amount: number;
  discount: number;
  finalAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  pgTransactionId: string | null;
  cardLastFour: string | null;
  passId: string | null;
  passAmount: number | null;
  memo: string | null;
  paidAt: Date;
  createdAt: Date;
}

export interface Pass {
  id: string;
  shopId: string;
  customerId: string;
  type: PassType;
  name: string;
  totalCount: number | null;
  remainingCount: number | null;
  totalAmount: number | null;
  remainingAmount: number | null;
  price: number;
  startDate: Date;
  expiryDate: Date | null;
  status: PassStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PassUsage {
  id: string;
  passId: string;
  paymentId: string;
  shopId: string;
  type: PassUsageType;
  countUsed: number | null;
  amountUsed: number | null;
  remainingCount: number | null;
  remainingAmount: number | null;
  memo: string | null;
  usedAt: Date;
  createdAt: Date;
}

import { BookingStatus, BookingSource } from './enums';

export interface Booking {
  id: string;
  shopId: string;
  customerId: string;
  staffId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  source: BookingSource;
  memo: string | null;
  naverBookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  shopId: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
  isActive: boolean;
}

import { StaffRole, IncentiveType } from './enums';

export interface Staff {
  id: string;
  shopId: string;
  userId: string | null;
  name: string;
  phone: string;
  email: string | null;
  role: StaffRole;
  specialties: string[];
  profileImageUrl: string | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
  hiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffIncentive {
  id: string;
  staffId: string;
  shopId: string;
  type: IncentiveType;
  serviceId: string | null;
  rate: number;
  isActive: boolean;
  createdAt: Date;
}

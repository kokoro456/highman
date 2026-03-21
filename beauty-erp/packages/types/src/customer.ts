import { Gender, CustomerTier, PhotoType } from './enums';

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  email: string | null;
  gender: Gender | null;
  birthDate: Date | null;
  firstVisitDate: Date;
  lastVisitDate: Date | null;
  visitCount: number;
  totalSpent: number;
  tier: CustomerTier;
  memo: string | null;
  tags: string[];
  consentMarketing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentHistory {
  id: string;
  shopId: string;
  customerId: string;
  bookingId: string | null;
  staffId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  notes: string | null;
  treatmentDate: Date;
  createdAt: Date;
}

export interface CustomerPhoto {
  id: string;
  customerId: string;
  treatmentId: string | null;
  type: PhotoType;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;
}

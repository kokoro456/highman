import { BusinessType, SubscriptionTier } from './enums';

export interface BusinessHours {
  [day: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  businessType: BusinessType;
  phone: string;
  address: string;
  addressDetail: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  businessHours: BusinessHours;
  closedDays: string[];
  subscriptionTier: SubscriptionTier;
  naverPlaceId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceCategory {
  id: string;
  shopId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Service {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  b2cPrice: number | null;
  isLinkedB2c: boolean;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

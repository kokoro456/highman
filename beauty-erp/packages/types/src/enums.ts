export enum UserRole {
  ADMIN = 'ADMIN',
  SHOP_OWNER = 'SHOP_OWNER',
  SHOP_STAFF = 'SHOP_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  PHONE = 'PHONE',
}

export enum BusinessType {
  NAIL = 'NAIL',
  EYELASH = 'EYELASH',
  WAXING = 'WAXING',
  HAIR = 'HAIR',
  SKIN = 'SKIN',
  SEMI_PERMANENT = 'SEMI_PERMANENT',
  TATTOO = 'TATTOO',
  MASSAGE = 'MASSAGE',
  BARBER = 'BARBER',
  TANNING = 'TANNING',
  SCALP = 'SCALP',
  MAKEUP = 'MAKEUP',
  PET_GROOMING = 'PET_GROOMING',
  OTHER = 'OTHER',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BookingStatus {
  READY = 'READY',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum BookingSource {
  DIRECT = 'DIRECT',
  NAVER = 'NAVER',
  B2C_WEB = 'B2C_WEB',
  B2C_APP = 'B2C_APP',
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  PASS = 'PASS',
  MIXED = 'MIXED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
}

export enum PassType {
  TICKET = 'TICKET',
  MEMBERSHIP = 'MEMBERSHIP',
}

export enum PassStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  EXHAUSTED = 'EXHAUSTED',
  CANCELLED = 'CANCELLED',
}

export enum StaffRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  DESIGNER = 'DESIGNER',
  ASSISTANT = 'ASSISTANT',
  INTERN = 'INTERN',
}

export enum IncentiveType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum CustomerTier {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
  VVIP = 'VVIP',
}

export enum PhotoType {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
  REFERENCE = 'REFERENCE',
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_CHANGED = 'BOOKING_CHANGED',
  MARKETING = 'MARKETING',
  SYSTEM = 'SYSTEM',
}

export enum NotificationChannel {
  KAKAO_ALIMTALK = 'KAKAO_ALIMTALK',
  FCM_PUSH = 'FCM_PUSH',
  SMS = 'SMS',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  DELIVERED = 'DELIVERED',
}

export enum PassUsageType {
  USE = 'USE',
  REFUND = 'REFUND',
}

export enum RecipientType {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
}

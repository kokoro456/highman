import { z } from 'zod';

export const createPaymentSchema = z.object({
  customerId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  staffId: z.string().uuid(),
  amount: z.number().min(0),
  discount: z.number().min(0).default(0),
  method: z.enum(['CARD', 'CASH', 'TRANSFER', 'PASS', 'MIXED']),
  passId: z.string().uuid().optional(),
  passAmount: z.number().min(0).optional(),
  memo: z.string().max(500).optional(),
});

export const createPassSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(['TICKET', 'MEMBERSHIP']),
  name: z.string().min(1).max(100),
  totalCount: z.number().int().min(1).optional(),
  totalAmount: z.number().min(0).optional(),
  price: z.number().min(0),
  startDate: z.string().date(),
  expiryDate: z.string().date().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreatePassInput = z.infer<typeof createPassSchema>;

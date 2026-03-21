import { z } from 'zod';

export const createBookingSchema = z.object({
  customerId: z.string().uuid(),
  staffId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  memo: z.string().max(500).optional(),
  source: z.enum(['DIRECT', 'NAVER', 'B2C_WEB', 'B2C_APP']).default('DIRECT'),
});

export const updateBookingSchema = z.object({
  staffId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  startTime: z.string().datetime().optional(),
  memo: z.string().max(500).optional(),
  status: z.enum([
    'READY', 'CONFIRMED', 'IN_PROGRESS',
    'COMPLETED', 'CANCELLED', 'NO_SHOW',
  ]).optional(),
});

export const createScheduleSchema = z.object({
  staffId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  breakEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  isActive: z.boolean().default(true),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

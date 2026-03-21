import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50),
  phone: z.string().min(1, '전화번호를 입력해주세요'),
  email: z.string().email().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  birthDate: z.string().date().optional(),
  memo: z.string().max(1000).optional(),
  tags: z.array(z.string().max(20)).max(10).optional(),
  consentMarketing: z.boolean().default(false),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createTreatmentHistorySchema = z.object({
  customerId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  staffId: z.string().uuid(),
  serviceId: z.string().uuid(),
  serviceName: z.string(),
  price: z.number().min(0),
  notes: z.string().max(2000).optional(),
  treatmentDate: z.string().datetime(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateTreatmentHistoryInput = z.infer<typeof createTreatmentHistorySchema>;

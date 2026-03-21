import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50),
  phone: z.string().min(1, '전화번호를 입력해주세요'),
  email: z.string().email().optional(),
  role: z.enum(['OWNER', 'MANAGER', 'DESIGNER', 'ASSISTANT', 'INTERN']),
  specialties: z.array(z.string().max(30)).max(20).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '유효한 색상 코드를 입력해주세요'),
  sortOrder: z.number().int().min(0).default(0),
  hiredAt: z.string().date(),
});

export const updateStaffSchema = createStaffSchema.partial();

export const createIncentiveSchema = z.object({
  staffId: z.string().uuid(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  serviceId: z.string().uuid().optional(),
  rate: z.number().min(0),
  isActive: z.boolean().default(true),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type CreateIncentiveInput = z.infer<typeof createIncentiveSchema>;

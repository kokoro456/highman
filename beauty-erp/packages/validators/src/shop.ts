import { z } from 'zod';

const businessHoursSchema = z.record(
  z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM 형식이어야 합니다'),
    close: z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM 형식이어야 합니다'),
    isOpen: z.boolean(),
  })
);

export const createShopSchema = z.object({
  name: z.string().min(1, '매장명을 입력해주세요').max(100),
  businessType: z.enum([
    'NAIL', 'EYELASH', 'WAXING', 'HAIR', 'SKIN',
    'SEMI_PERMANENT', 'TATTOO', 'MASSAGE', 'BARBER',
    'TANNING', 'SCALP', 'MAKEUP', 'PET_GROOMING', 'OTHER',
  ]),
  phone: z.string().min(1, '전화번호를 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
  addressDetail: z.string().optional(),
  description: z.string().max(500).optional(),
  businessHours: businessHoursSchema.optional(),
  closedDays: z.array(z.string()).optional(),
});

export const updateShopSchema = createShopSchema.partial();

export const createServiceCategorySchema = z.object({
  name: z.string().min(1, '카테고리명을 입력해주세요').max(50),
  sortOrder: z.number().int().min(0).default(0),
});

export const createServiceSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1, '서비스명을 입력해주세요').max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(5, '최소 5분 이상이어야 합니다').max(480),
  price: z.number().min(0, '가격은 0 이상이어야 합니다'),
  b2cPrice: z.number().min(0).optional(),
  isLinkedB2c: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

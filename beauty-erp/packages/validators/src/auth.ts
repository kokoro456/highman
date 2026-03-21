import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

export const registerSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      '비밀번호는 영문과 숫자를 포함해야 합니다'
    ),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다').max(50),
  phone: z
    .string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '유효한 전화번호를 입력해주세요')
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

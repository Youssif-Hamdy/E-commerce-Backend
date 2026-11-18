import { z } from 'zod';

const schema = z.object({
  NODE_ENV:              z.enum(['development', 'test', 'production']).default('development'),
  PORT:                  z.coerce.number().default(4000),
  CLIENT_URL:            z.string().default('http://localhost:5173'),
  DATABASE_URL:          z.string().min(1),
  DIRECT_URL:            z.string().optional(),   // مطلوب للـ migrations بس
  IMAGEKIT_PUBLIC_KEY:   z.string().min(1),
  IMAGEKIT_PRIVATE_KEY:  z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),
  ADMIN_API_KEY:         z.string().default('unused'),
  ADMIN_USERNAME:        z.string().min(1),
  ADMIN_PASSWORD_HASH:   z.string().min(1),
  JWT_SECRET:            z.string().min(32, 'JWT_SECRET لازم يكون 32 حرف على الأقل'),
  JWT_EXPIRES_IN:        z.string().default('8h'),
  PAYMENT_MODE:          z.enum(['test', 'live']).default('test'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ متغيرات البيئة ناقصة أو غلط:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

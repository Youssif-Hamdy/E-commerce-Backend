import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  IMAGEKIT_PUBLIC_KEY: z.string().min(1),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),
  // --- Legacy API-key auth (بيفضل موجود كـ fallback مؤقت) ---
  ADMIN_API_KEY: z.string().min(16, 'ADMIN_API_KEY لازم يكون 16 حرف على الأقل'),
  // --- JWT Admin Auth ---
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD_HASH: z.string().min(1, 'شغّل hashPassword() وحط الـ hash هنا'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET لازم يكون 32 حرف على الأقل'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  // --- Payments ---
  PAYMENT_MODE: z.enum(['test', 'live']).default('test'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ متغيرات البيئة ناقصة أو غلط:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

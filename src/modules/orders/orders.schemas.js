import { z } from 'zod';

export const createOrder = z.object({
  items: z
    .array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(100) }))
    .min(1)
    .max(50),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email(),
    // رقم مصري: 01xxxxxxxxx أو +201xxxxxxxxx
    phone: z.string().trim().regex(/^(\+20|0)?1[0125]\d{8}$/, 'رقم موبايل مصري غير صالح'),
    address: z.string().trim().min(5).max(500),
  }),
});

export const idParam = z.object({ id: z.string().uuid() });

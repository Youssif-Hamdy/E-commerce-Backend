import { z } from 'zod';

export const listQuery = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q:     z.string().trim().optional(),
});

export const idParam = z.object({ id: z.string().uuid() });

export const createCategory = z.object({
  name:        z.string().trim().min(2).max(200),
  slug:        z.string().trim().min(2).max(200).optional(),
  description: z.string().max(2000).default(''),
  is_active:   z.boolean().default(true),
});

export const updateCategory = z.object({
  name:        z.string().trim().min(2).max(200),
  slug:        z.string().trim().min(2).max(200),
  description: z.string().max(2000),
  is_active:   z.boolean(),
}).partial();

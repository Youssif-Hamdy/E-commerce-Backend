import { z } from 'zod';

export const listQuery = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  q:          z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
});

export const idParam     = z.object({ id: z.string().uuid() });
export const imageParams = z.object({ id: z.string().uuid(), imageId: z.string().uuid() });

export const createProduct = z.object({
  name:        z.string().trim().min(2).max(200),
  slug:        z.string().trim().min(2).max(200).optional(),
  description: z.string().max(5000).default(''),
  price_cents: z.number().int().min(0),
  stock:       z.number().int().min(0).default(0),
  is_active:   z.boolean().default(true),
  category_id: z.string().uuid().optional(),
});

export const updateProduct = z.object({
  name:        z.string().trim().min(2).max(200),
  slug:        z.string().trim().min(2).max(200),
  description: z.string().max(5000),
  price_cents: z.number().int().min(0),
  stock:       z.number().int().min(0),
  is_active:   z.boolean(),
  category_id: z.string().uuid().nullable(),
}).partial();

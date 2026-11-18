import { prisma } from '../../config/prisma.js';
import { notFound } from '../../utils/httpError.js';
import { slugify } from '../../utils/slugify.js';

// ─── List ───────────────────────────────────────────────────────
export async function listCategories({ page, limit, q } = {}, { onlyActive = true } = {}) {
  const where = {
    ...(onlyActive && { isActive: true }),
    ...(q && { name: { contains: q, mode: 'insensitive' } }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.category.count({ where }),
  ]);

  return { items, total, page, limit };
}

// ─── Get Single ─────────────────────────────────────────────────
export async function getCategory(idOrSlug, { onlyActive = true } = {}) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const category = await prisma.category.findFirst({
    where: {
      ...(isUuid ? { id: idOrSlug } : { slug: idOrSlug }),
      ...(onlyActive && { isActive: true }),
    },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw notFound('الكاتيجوري مش موجودة');
  return category;
}

// ─── Create ─────────────────────────────────────────────────────
export async function createCategory(data) {
  const slug = data.slug ?? slugify(data.name);
  return prisma.category.create({
    data: {
      slug,
      name: data.name,
      description: data.description ?? '',
      isActive: data.is_active ?? true,
    },
  });
}

// ─── Update ─────────────────────────────────────────────────────
export async function updateCategory(id, data) {
  try {
    return await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.is_active !== undefined && { isActive: data.is_active }),
      },
    });
  } catch (e) {
    if (e.code === 'P2025') throw notFound('الكاتيجوري مش موجودة');
    throw e;
  }
}

// ─── Delete ─────────────────────────────────────────────────────
export async function deleteCategory(id) {
  try {
    // products.category_id هيبقى null تلقائياً (ON DELETE SET NULL)
    await prisma.category.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw notFound('الكاتيجوري مش موجودة');
    throw e;
  }
}

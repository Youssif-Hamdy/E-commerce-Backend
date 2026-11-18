import { prisma } from '../../config/prisma.js';
import { imagekit } from '../../config/imagekit.js';
import { notFound } from '../../utils/httpError.js';
import { slugify } from '../../utils/slugify.js';

// ─── List Products ──────────────────────────────────────────────
export async function listProducts({ page, limit, q, categoryId } = {}, { onlyActive = true } = {}) {
  const where = {
    ...(onlyActive && { isActive: true }),
    ...(q && { name: { contains: q, mode: 'insensitive' } }),
    ...(categoryId && { categoryId }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: 'asc' } }, category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, limit };
}

// ─── Get Single Product ─────────────────────────────────────────
export async function getProduct(idOrSlug, { onlyActive = true } = {}) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const product = await prisma.product.findFirst({
    where: {
      ...(isUuid ? { id: idOrSlug } : { slug: idOrSlug }),
      ...(onlyActive && { isActive: true }),
    },
    include: {
      images: { orderBy: { position: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!product) throw notFound('المنتج مش موجود');
  return product;
}

// ─── Create Product ─────────────────────────────────────────────
export async function createProduct(data) {
  const slug = data.slug ?? slugify(data.name);
  return prisma.product.create({
    data: {
      slug,
      name: data.name,
      description: data.description ?? '',
      priceCents: data.price_cents,
      stock: data.stock ?? 0,
      isActive: data.is_active ?? true,
      ...(data.category_id && { categoryId: data.category_id }),
    },
    include: { images: true, category: { select: { id: true, name: true, slug: true } } },
  });
}

// ─── Update Product ─────────────────────────────────────────────
export async function updateProduct(id, data) {
  try {
    return await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price_cents !== undefined && { priceCents: data.price_cents }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.is_active !== undefined && { isActive: data.is_active }),
        // category_id: null ينفصل من الكاتيجوري
        ...('category_id' in data && { categoryId: data.category_id }),
      },
      include: { images: true, category: { select: { id: true, name: true, slug: true } } },
    });
  } catch (e) {
    if (e.code === 'P2025') throw notFound('المنتج مش موجود');
    throw e;
  }
}

// ─── Delete Product ─────────────────────────────────────────────
export async function deleteProduct(id) {
  try {
    const images = await prisma.productImage.findMany({ where: { productId: id }, select: { fileId: true } });
    await prisma.product.delete({ where: { id } });
    await Promise.allSettled(images.map((img) => imagekit.deleteFile(img.fileId)));
  } catch (e) {
    if (e.code === 'P2025') throw notFound('المنتج مش موجود');
    throw e;
  }
}

// ─── Images ────────────────────────────────────────────────────
export async function addImage(productId, file) {
  await getProduct(productId, { onlyActive: false });

  const uploaded = await imagekit.upload({
    file: file.buffer,
    fileName: file.originalname,
    folder: `/products/${productId}`,
    useUniqueFileName: true,
  });

  const maxPos = await prisma.productImage.aggregate({
    where: { productId },
    _max: { position: true },
  });
  const position = (maxPos._max.position ?? -1) + 1;

  return prisma.productImage.create({
    data: { productId, fileId: uploaded.fileId, filePath: uploaded.filePath, url: uploaded.url, position },
  });
}

export async function removeImage(productId, imageId) {
  try {
    const img = await prisma.productImage.delete({ where: { id: imageId, productId } });
    await imagekit.deleteFile(img.fileId).catch((e) => console.error('ImageKit delete failed', e.message));
  } catch (e) {
    if (e.code === 'P2025') throw notFound('الصورة مش موجودة');
    throw e;
  }
}

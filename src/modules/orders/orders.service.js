import { prisma } from '../../config/prisma.js';
import { badRequest, notFound } from '../../utils/httpError.js';

const ORDER_TTL_MINUTES = 30;

/**
 * السعر والإجمالي بيتحسبوا من الداتابيز دايمًا — مش من اللي جاي من الـ frontend.
 */
export async function createOrder({ items, customer }) {
  // ندمج أي منتج مكرر في السلة
  const qtyMap = new Map();
  for (const { productId, quantity } of items) {
    qtyMap.set(productId, (qtyMap.get(productId) ?? 0) + quantity);
  }

  return prisma.$transaction(async (tx) => {
    // lock المنتجات في transaction
    const products = await tx.$queryRaw`
      SELECT id, name, "price_cents" as price_cents, stock
      FROM products
      WHERE id = ANY(${[...qtyMap.keys()]}::uuid[])
        AND is_active = TRUE
      FOR UPDATE
    `;

    const byId = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const lines = [...qtyMap].map(([productId, quantity]) => {
      const p = byId.get(productId);
      if (!p) throw badRequest(`منتج غير متاح: ${productId}`);
      if (p.stock < quantity) throw badRequest(`الكمية المطلوبة من "${p.name}" غير متوفرة`);
      total += Number(p.price_cents) * quantity;
      return { p, quantity };
    });

    const expiresAt = new Date(Date.now() + ORDER_TTL_MINUTES * 60 * 1000);

    const order = await tx.order.create({
      data: {
        orderNumber: 0, // سيتولّد عبر sequence (نحتاج raw بسبب GENERATED ALWAYS)
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address,
        totalCents: total,
        expiresAt,
        items: {
          create: lines.map(({ p, quantity }) => ({
            productId: p.id,
            nameSnapshot: p.name,
            unitPriceCents: Number(p.price_cents),
            quantity,
          })),
        },
      },
      include: { items: true },
    });

    // حجز المخزون
    for (const { p, quantity } of lines) {
      await tx.$executeRaw`
        UPDATE products SET stock = stock - ${quantity} WHERE id = ${p.id}::uuid
      `;
    }

    return order;
  });
}

export async function getOrder(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw notFound('الأوردر مش موجود');
  return order;
}

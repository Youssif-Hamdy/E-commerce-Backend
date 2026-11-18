import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

import { publicRouter as productsPublic, adminRouter as productsAdmin } from './modules/products/products.routes.js';
import { publicRouter as categoriesPublic, adminRouter as categoriesAdmin } from './modules/categories/categories.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import webhooksRoutes from './modules/payments/webhooks.routes.js';
import uploadsRoutes from './modules/uploads/uploads.routes.js';
import authRoutes from './modules/auth/auth.routes.js';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ⚠️ الـ webhooks لازم قبل express.json() عشان نحافظ على الـ raw body
app.use('/webhooks', webhooksRoutes);

app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', env: env.NODE_ENV });
});

// ─── Public Routes ──────────────────────────────────────────────
app.use('/api/products',   productsPublic);
app.use('/api/categories', categoriesPublic);
app.use('/api/orders',     ordersRoutes);
app.use('/api/payments',   paymentsRoutes);

// ─── Admin Routes ───────────────────────────────────────────────
app.use('/api/admin',              authRoutes);           // login / refresh / logout
app.use('/api/admin/products',     productsAdmin);
app.use('/api/admin/categories',   categoriesAdmin);
app.use('/api/admin/uploads',      uploadsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

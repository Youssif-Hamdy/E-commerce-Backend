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
// إعدادات CORS المرنة لدعم الفرونت على localhost بأي port + أي دومين مضاف في CLIENT_URL
const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // السماح بطلبات الـ API tools (Postman, curl) أو طلبات بدون origin
      if (!origin) return callback(null, true);

      // السماح بأي بورت على localhost أو 127.0.0.1 (مثل 5173, 5174, 3000)
      if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // لو CLIENT_URL محطوط نجمة (*)
      if (allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // لو الـ origin موجود في الـ list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  }),
);
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ⚠️ الـ webhooks لازم قبل express.json() عشان نحافظ على الـ raw body
app.use('/webhooks', webhooksRoutes);

app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', env: env.NODE_ENV });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'E-Commerce API',
    version: '0.1.0',
    status: 'running',
    docs: '/health',
  });
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

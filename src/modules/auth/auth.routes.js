import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { adminLogin, refreshTokens, logout } from './auth.service.js';

const router = Router();

// 5 محاولات كل 15 دقيقة
const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'كتير محاولات، استنى ربع ساعة وحاول تاني' },
});

const loginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const refreshBody = z.object({
  refreshToken: z.string().min(1),
});

/**
 * POST /api/admin/login
 * Body: { username, password }
 * Response: { accessToken, accessExpiresIn, refreshToken, refreshExpiresAt }
 */
router.post('/login', loginLimiter, validate({ body: loginBody }), async (req, res) => {
  res.json(await adminLogin(req.body));
});

/**
 * POST /api/admin/refresh
 * Body: { refreshToken }
 * Response: { accessToken, accessExpiresIn, refreshToken, refreshExpiresAt }
 */
router.post('/refresh', validate({ body: refreshBody }), async (req, res) => {
  res.json(await refreshTokens(req.body.refreshToken));
});

/**
 * POST /api/admin/logout
 * Header: Authorization: Bearer <accessToken>  (للتعرف على الأدمن)
 * Body: { refreshToken }
 * Response: 204
 */
router.post('/logout', requireAdmin, validate({ body: refreshBody }), async (req, res) => {
  await logout(req.body.refreshToken);
  res.status(204).end();
});

export default router;

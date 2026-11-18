import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

/**
 * Middleware: يتحقق من JWT في الـ Authorization header.
 * يستخدم بدلاً من adminAuth (API Key) في جميع /api/admin routes.
 *
 * Header المطلوب:
 *   Authorization: Bearer <token>
 */
export function requireAdmin(req, _res, next) {
  const authHeader = req.headers['authorization'] ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return next(new HttpError(401, 'مفيش token — سجّل دخولك أول'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('ليس أدمن');
    req.admin = payload;
    next();
  } catch {
    next(new HttpError(401, 'الـ token غلط أو منتهي'));
  }
}

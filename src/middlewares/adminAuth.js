import { timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const expected = Buffer.from(env.ADMIN_API_KEY);

/** حماية مؤقتة للأدمن بمفتاح في الـ header: x-admin-key. هنستبدلها بـ JWT/roles بعدين */
export function adminAuth(req, _res, next) {
  const provided = Buffer.from(String(req.header('x-admin-key') ?? ''));
  const ok = provided.length === expected.length && timingSafeEqual(provided, expected);
  if (!ok) return next(new HttpError(401, 'غير مصرح'));
  next();
}

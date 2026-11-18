import { ZodError } from 'zod';
import multer from 'multer';
import { HttpError } from '../utils/httpError.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, _res, next) =>
  next(new HttpError(404, `المسار ${req.method} ${req.originalUrl} مش موجود`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'بيانات غير صالحة', details: err.flatten() });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `خطأ في رفع الملف: ${err.message}` });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'القيمة دي موجودة بالفعل', detail: err.detail });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'مرجع غير صحيح (foreign key)' });
  }

  console.error(err);
  res.status(500).json({
    error: 'حصل خطأ في السيرفر',
    ...(env.NODE_ENV !== 'production' && { message: err.message }),
  });
}

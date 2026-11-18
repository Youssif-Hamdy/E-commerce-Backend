import { Router } from 'express';
import { imagekit } from '../../config/imagekit.js';
import { env } from '../../config/env.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';

const router = Router();

/**
 * بديل للرفع من الباك إند: لوحة الأدمن (React) تنادي الـ endpoint ده
 * وتاخد توقيع مؤقت وترفع الصورة مباشرة لـ ImageKit من المتصفح.
 */
router.get('/imagekit-auth', requireAdmin, (_req, res) => {
  res.json({
    ...imagekit.getAuthenticationParameters(),
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  });
});

export default router;

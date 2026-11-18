import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.js';
import { HttpError } from '../../utils/httpError.js';

const router = Router();

const payBody = z.object({
  provider: z.enum(['paymob', 'kashier']),
  method: z.enum(['card', 'wallet']).default('card'),
});

// هيتنفذ في مرحلة الدفع: ينشئ payment_attempt ويرجّع رابط/iframe
router.post(
  '/:orderId/pay',
  validate({ params: z.object({ orderId: z.string().uuid() }), body: payBody }),
  () => {
    throw new HttpError(501, 'الدفع لسه مش متفعّل — المرحلة الجاية');
  },
);

export default router;

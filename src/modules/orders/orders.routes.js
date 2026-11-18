import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middlewares/validate.js';
import * as svc from './orders.service.js';
import * as s from './orders.schemas.js';

const router = Router();

const createLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.post('/', createLimiter, validate({ body: s.createOrder }), async (req, res) => {
  res.status(201).json(await svc.createOrder(req.body));
});

// الفرونت بيعمل polling على الـ endpoint ده بعد الدفع (بنرجّع حقول غير حساسة بس)
router.get('/:id', validate({ params: s.idParam }), async (req, res) => {
  const o = await svc.getOrder(req.params.id);
  res.json({
    id: o.id,
    order_number: o.order_number,
    total_cents: o.total_cents,
    currency: o.currency,
    order_status: o.order_status,
    payment_status: o.payment_status,
    expires_at: o.expires_at,
    items: o.items,
  });
});

export default router;

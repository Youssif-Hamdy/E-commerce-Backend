import { Router, raw } from 'express';
import { createHash } from 'node:crypto';
import { query } from '../../config/db.js';

const router = Router();

// raw body ضروري لحساب التوقيع (HMAC). الراوتر ده بيتركّب قبل express.json()
router.use(raw({ type: '*/*', limit: '1mb' }));

function handler(provider) {
  return async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
    const eventKey = createHash('sha256').update(provider + rawBody).digest('hex');

    // 1) خزّن الـ payload الخام (ON CONFLICT = تجاهل التكرار)
    await query(
      `INSERT INTO webhook_events (provider, event_key, raw_payload)
       VALUES ($1,$2,$3) ON CONFLICT (event_key) DO NOTHING`,
      [provider, eventKey, rawBody],
    );

    // TODO (مرحلة الدفع): verifyWebhook → قارن المبلغ → حدّث الحالة في transaction → job للإيميل/المخزون
    res.status(200).json({ received: true });
  };
}

router.post('/paymob', handler('paymob'));
router.post('/kashier', handler('kashier'));

export default router;

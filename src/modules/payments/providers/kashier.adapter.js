import { notImplemented } from './provider.interface.js';

// TODO: اتبع توثيق Kashier الرسمي (payment session / hash) والتحقق من التوقيع
export const kashier = {
  name: 'kashier',
  createPayment: notImplemented('kashier', 'createPayment'),
  verifyWebhook: notImplemented('kashier', 'verifyWebhook'),
  getStatus: notImplemented('kashier', 'getStatus'),
  refund: notImplemented('kashier', 'refund'),
};

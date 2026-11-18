import { notImplemented } from './provider.interface.js';

// TODO: اتبع توثيق Paymob الرسمي (auth → order → payment key → iframe) وحساب الـ HMAC
export const paymob = {
  name: 'paymob',
  createPayment: notImplemented('paymob', 'createPayment'),
  verifyWebhook: notImplemented('paymob', 'verifyWebhook'),
  getStatus: notImplemented('paymob', 'getStatus'),
  refund: notImplemented('paymob', 'refund'),
};

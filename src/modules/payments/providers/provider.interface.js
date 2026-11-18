/**
 * كل بوابة دفع لازم تنفذ الـ interface ده.
 *
 * createPayment({ order, attempt, method }) -> { paymentUrl?, iframeToken?, providerOrderId }
 * verifyWebhook({ rawBody, headers })       -> { valid: boolean, event?: NormalizedEvent }
 * getStatus({ providerOrderId })            -> { status: 'pending'|'paid'|'failed'|..., amountCents, txnId }
 * refund({ txnId, amountCents, reason })    -> { providerRefundId, status }
 *
 * NormalizedEvent = { providerOrderId, txnId, status, amountCents, method }
 */
export const notImplemented = (provider, fn) => () => {
  throw new Error(`${provider}.${fn} لسه مش متنفذة`);
};

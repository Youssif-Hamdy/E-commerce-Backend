import { paymob } from './paymob.adapter.js';
import { kashier } from './kashier.adapter.js';

export const providers = { paymob, kashier };

export function getProvider(name) {
  const p = providers[name];
  if (!p) throw new Error(`بوابة دفع غير معروفة: ${name}`);
  return p;
}

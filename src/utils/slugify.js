import { randomBytes } from 'node:crypto';

/** بيدعم عربي وإنجليزي. لو طلع فاضي بيطلع slug عشوائي قصير */
export function slugify(text) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return base || randomBytes(4).toString('hex');
}

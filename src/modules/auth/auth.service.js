import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../utils/httpError.js';

const REFRESH_TTL_DAYS = 30;

// ─── Login ──────────────────────────────────────────────────────
export async function adminLogin({ username, password }) {
  if (username !== env.ADMIN_USERNAME) throw new HttpError(401, 'بيانات غلط');

  const valid = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
  if (!valid) throw new HttpError(401, 'بيانات غلط');

  return issueTokens(username);
}

// ─── Refresh ────────────────────────────────────────────────────
export async function refreshTokens(rawToken) {
  const record = await prisma.refreshToken.findUnique({ where: { token: rawToken } });

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw new HttpError(401, 'الـ refresh token منتهي أو ملغي');
  }

  // Rotation: نلغي القديم وننشئ جديد
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(record.adminUser);
}

// ─── Logout ─────────────────────────────────────────────────────
export async function logout(rawToken) {
  await prisma.refreshToken.updateMany({
    where: { token: rawToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// ─── Helpers ────────────────────────────────────────────────────
async function issueTokens(username) {
  const accessToken = jwt.sign(
    { sub: username, role: 'admin' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  const rawRefresh = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token: rawRefresh, adminUser: username, expiresAt },
  });

  return {
    accessToken,
    accessExpiresIn: env.JWT_EXPIRES_IN,
    refreshToken: rawRefresh,
    refreshExpiresAt: expiresAt,
  };
}

// ─── Hash helper (للـ CLI) ──────────────────────────────────────
export async function hashPassword(plain) {
  const hash = await bcrypt.hash(plain, 12);
  console.log('ADMIN_PASSWORD_HASH=' + hash);
  return hash;
}

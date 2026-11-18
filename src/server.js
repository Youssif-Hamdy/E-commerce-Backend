import { app } from './app.js';
import { env } from './config/env.js';

// Vercel: بيستخدم الـ default export كـ serverless handler
export default app;

// Local dev: بنشغّل السيرفر عادي
if (process.env.VERCEL !== '1') {
  const { pool } = await import('./config/db.js');
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 http://localhost:${env.PORT}  (${env.NODE_ENV})`);
  });

  async function shutdown(signal) {
    console.log(`\n${signal} — بقفل السيرفر...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

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

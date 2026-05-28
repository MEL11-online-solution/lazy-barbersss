require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/db');
const { startReminderJob } = require('./jobs/bookingReminder');

const PORT = Number(process.env.PORT || 4000);

const server = app.listen(PORT, () => {
  console.log(`\n  Lazy Barbers API`);
  console.log(`  ────────────────`);
  console.log(`  Listening on  http://localhost:${PORT}`);
  console.log(`  Health check  http://localhost:${PORT}/api/v1/health`);
  console.log(`  Env           ${process.env.NODE_ENV || 'development'}`);
  console.log(`  SMS provider  ${process.env.SMS_PROVIDER || 'console'}\n`);

  // Background jobs
  startReminderJob();
});

// Graceful shutdown
function shutdown(signal) {
  return async () => {
    console.log(`\n${signal} received — shutting down…`);
    server.close(async () => {
      try {
        await pool.end();
        console.log('  ✓ DB pool closed');
      } catch (err) {
        console.error('  DB pool close error:', err.message);
      }
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => {
      console.error('  Force exit (10s timeout)');
      process.exit(1);
    }, 10_000).unref();
  };
}

process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));

/**
 * Drop all tables in the database — for a clean reset.
 *
 * Usage:  npm run db:reset
 *
 * This is destructive. Only use in dev. Reads the actual table list from
 * information_schema (rather than hardcoding) so it stays in sync with
 * any schema additions and also wipes Drizzle's `__drizzle_migrations`
 * tracking table.
 */
require('dotenv').config();
const { pool } = require('../config/db');

(async () => {
  const dbName = process.env.DB_NAME || 'lazybarbers';
  try {
    console.log(`▶ Dropping all tables in \`${dbName}\`…`);

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT table_name AS t FROM information_schema.tables WHERE table_schema = ?`,
        [dbName]
      );

      if (!rows.length) {
        console.log('  (no tables to drop)');
      } else {
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const r of rows) {
          const tableName = r.t || r.T || r.table_name || r.TABLE_NAME;
          await conn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
          console.log(`  dropped: ${tableName}`);
        }
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
      }

      console.log('✓ Reset complete');
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('✗ Reset failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

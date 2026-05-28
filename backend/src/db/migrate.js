/**
 * Run Drizzle migrations.
 *
 * Usage:
 *   1. `npm run db:generate` — Drizzle Kit reads schema.js and writes
 *      SQL migration files into ./src/db/migrations/.
 *   2. `npm run db:migrate`  — this script applies them to MySQL.
 *
 * The first time you run db:generate, it creates the initial migration
 * containing all CREATE TABLE statements. Subsequent schema edits just
 * regenerate, producing diff migrations.
 */
require('dotenv').config();

const path = require('path');
const { migrate } = require('drizzle-orm/mysql2/migrator');
const { db, pool } = require('../config/db');

(async () => {
  try {
    console.log('▶ Running migrations…');
    await migrate(db, {
      migrationsFolder: path.resolve(__dirname, 'migrations'),
    });
    console.log('✓ Migrations complete');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

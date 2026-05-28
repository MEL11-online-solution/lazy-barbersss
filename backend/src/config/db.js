/**
 * Database connection.
 *   - mysql2/promise pool (connection pooling)
 *   - Drizzle ORM wrapper
 *
 * Two named exports:
 *   - `db`   → Drizzle instance (used by repos and services)
 *   - `pool` → raw mysql2 pool (used by reset.js and migrate.js)
 *
 * `dateStrings: true` keeps TIMESTAMP columns as strings end-to-end so
 * we never accidentally pull JS Date objects with local-tz surprises.
 */
require('dotenv').config();

const mysql = require('mysql2/promise');
const { drizzle } = require('drizzle-orm/mysql2');
const schema = require('../db/schema');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'lazy',
  password: process.env.DB_PASSWORD || 'lazypass',
  database: process.env.DB_NAME || 'lazybarbers',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  // CRITICAL: receive TIMESTAMP/DATE as ISO-style strings, not JS Date.
  // Avoids server-tz contamination during TIMESTAMP round-tripping.
  dateStrings: true,
  // Force the session timezone to UTC so TIMESTAMP literals are stored
  // and read consistently regardless of the host machine.
  timezone: 'Z',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,

});

const db = drizzle(pool, { schema, mode: 'default' });

module.exports = { db, pool, schema };

require('dotenv').config();

/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: './src/db/schema.js',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'lazy',
    password: process.env.DB_PASSWORD || 'lazypass',
    database: process.env.DB_NAME || 'lazybarbers',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
  verbose: true,
  strict: true,
};

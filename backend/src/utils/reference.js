const { sql } = require('drizzle-orm');
const { BOOKING_REF_PREFIX } = require('../config/constants');

/**
 * Generate the next booking reference for the current year, atomically.
 * MUST be called inside the booking transaction so the counter row is
 * locked alongside the booking insert.
 *
 * Pattern: INSERT ... ON DUPLICATE KEY UPDATE value = value + 1, then
 * read the new value via LAST_INSERT_ID(value) trick. This is fully
 * atomic in MySQL (single statement) and gives us a gap-free per-year
 * sequence.
 *
 * Format: LB-2026-0001
 *
 * @param {object} tx - Drizzle transaction handle
 * @returns {Promise<string>}
 */
async function nextBookingRef(tx) {
  const year = new Date().getUTCFullYear();

  // The classic MySQL atomic-counter trick:
  //   INSERT ... ON DUPLICATE KEY UPDATE value = LAST_INSERT_ID(value + 1)
  // After this statement, LAST_INSERT_ID() returns the new value whether
  // the row was inserted or updated.
  await tx.execute(sql`
    INSERT INTO booking_counters (year, value) VALUES (${year}, 1)
    ON DUPLICATE KEY UPDATE value = LAST_INSERT_ID(value + 1)
  `);

  const result = await tx.execute(sql`SELECT LAST_INSERT_ID() AS seq`);
  // mysql2 returns [rows, fields]; Drizzle's tx.execute also returns rows.
  // Normalize to handle both shapes.
  const rows = Array.isArray(result) ? result[0] : result.rows || result;
  const seq = Number(rows[0].seq);

  return `${BOOKING_REF_PREFIX}-${year}-${String(seq).padStart(4, '0')}`;
}

/** Fake Stripe-like transaction ID: TXN-XXXXXXXX. */
function generateTransactionId() {
  const rnd = Math.floor(Math.random() * 1_000_000_000)
    .toString(36)
    .toUpperCase()
    .padStart(8, '0')
    .slice(0, 8);
  return `TXN-${rnd}`;
}

/** 6-digit verification code (zero-padded string). */
function generateVerificationCode() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

module.exports = {
  nextBookingRef,
  generateTransactionId,
  generateVerificationCode,
};

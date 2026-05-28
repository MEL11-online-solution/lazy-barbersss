const { sql, eq, desc, and, gte } = require('drizzle-orm');
const { db, schema } = require('../config/db');
const { mysqlToIso } = require('../utils/time');

const { payments, bookings, services, users } = schema;

/**
 * Convert the `since` lower-bound — which is allowed in as either a JS
 * Date OR a MySQL-format string ('YYYY-MM-DD HH:MM:SS') — into a Date.
 * Drizzle's timestamp gte/lte requires a Date.
 */
function coerceSinceToDate(since) {
  if (since == null) return null;
  if (since instanceof Date) return since;
  if (typeof since === 'string') {
    // 'YYYY-MM-DD HH:MM:SS' → ISO → Date
    const iso = since.includes('T') ? since : `${since.replace(' ', 'T')}Z`;
    return new Date(iso);
  }
  return new Date(since);
}

function toPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    booking_id: row.booking_id,
    transaction_id: row.transaction_id,
    amount_cents: row.amount_cents,
    amount: row.amount_cents / 100,
    method: row.method,
    status: row.status,
    card_last4: row.card_last4,
    processed_at: row.processed_at,
    customer_name: row.customer_name,
    service_name: row.service_name,
  };
}

async function listRecent({ page = 1, pageSize = 20, method = null } = {}) {
  const offset = (page - 1) * pageSize;

  let where;
  if (method) where = eq(payments.method, method);

  const baseQ = db
    .select({
      id: payments.id,
      booking_id: payments.bookingId,
      transaction_id: payments.transactionId,
      amount_cents: payments.amountCents,
      method: payments.method,
      status: payments.status,
      card_last4: payments.cardLast4,
      processed_at: payments.processedAt,
      customer_name: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as('customer_name'),
      service_name: services.name,
    })
    .from(payments)
    .leftJoin(bookings, eq(bookings.id, payments.bookingId))
    .leftJoin(services, eq(services.id, bookings.serviceId))
    .leftJoin(users, eq(users.id, bookings.customerId));

  const rows = where
    ? await baseQ.where(where).orderBy(desc(payments.processedAt)).limit(pageSize).offset(offset)
    : await baseQ.orderBy(desc(payments.processedAt)).limit(pageSize).offset(offset);

  const countQ = db.select({ n: sql`COUNT(*)`.as('n') }).from(payments);
  const [{ n: total }] = where ? await countQ.where(where) : await countQ;

  return { rows: rows.map(toPublic), total: Number(total), page, pageSize };
}

/**
 * Aggregate revenue stats. `since` is a JS Date OR a MySQL-format string
 * lower bound (inclusive). Pass null for all-time.
 */
async function aggregateSince(since = null) {
  const sinceDate = coerceSinceToDate(since);

  const filters = [eq(payments.status, 'succeeded')];
  if (sinceDate) filters.push(gte(payments.processedAt, sinceDate));
  const where = filters.length === 1 ? filters[0] : and(...filters);

  const [agg] = await db
    .select({
      total: sql`COALESCE(SUM(${payments.amountCents}), 0)`.as('total'),
      count: sql`COUNT(*)`.as('count'),
      online: sql`COALESCE(SUM(CASE WHEN ${payments.method} = 'online' THEN ${payments.amountCents} ELSE 0 END), 0)`.as('online'),
      counter: sql`COALESCE(SUM(CASE WHEN ${payments.method} = 'counter' THEN ${payments.amountCents} ELSE 0 END), 0)`.as('counter'),
    })
    .from(payments)
    .where(where);

  return {
    total_cents: Number(agg.total),
    total: Number(agg.total) / 100,
    count: Number(agg.count),
    online_cents: Number(agg.online),
    online: Number(agg.online) / 100,
    counter_cents: Number(agg.counter),
    counter: Number(agg.counter) / 100,
    average: Number(agg.count) ? Number(agg.total) / 100 / Number(agg.count) : 0,
  };
}

async function revenueByService(since = null) {
  const sinceDate = coerceSinceToDate(since);

  const filters = [eq(payments.status, 'succeeded')];
  if (sinceDate) filters.push(gte(payments.processedAt, sinceDate));
  const where = filters.length === 1 ? filters[0] : and(...filters);

  const rows = await db
    .select({
      service_id: services.id,
      service_name: services.name,
      total_cents: sql`COALESCE(SUM(${payments.amountCents}), 0)`.as('total_cents'),
    })
    .from(payments)
    .innerJoin(bookings, eq(bookings.id, payments.bookingId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .where(where)
    .groupBy(services.id, services.name)
    .orderBy(sql`total_cents DESC`);

  return rows.map((r) => ({
    service_id: r.service_id,
    service_name: r.service_name,
    total_cents: Number(r.total_cents),
    total: Number(r.total_cents) / 100,
  }));
}

/**
 * Daily revenue series for the trailing N days (inclusive of today).
 * Returns rows with zero-revenue days filled in so the chart has a
 * continuous x-axis instead of gaps.
 *
 * Uses DATE() on the UTC timestamp to bucket per day. We force the
 * SQL session timezone to UTC at connection time (see config/db.js)
 * so DATE() lines up with the dates the frontend builds.
 *
 * @param {number} days  e.g. 7, 30, 90
 * @returns {Array<{ date: string, revenue: number }>}  date is 'YYYY-MM-DD'
 */
async function dailySeries(days = 30) {
  // Lower bound: start of (today - (days-1)) UTC
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const rows = await db
    .select({
      date: sql`DATE(${payments.processedAt})`.as('date'),
      cents: sql`COALESCE(SUM(${payments.amountCents}), 0)`.as('cents'),
    })
    .from(payments)
    .where(
      and(
        eq(payments.status, 'succeeded'),
        gte(payments.processedAt, since)
      )
    )
    .groupBy(sql`DATE(${payments.processedAt})`)
    .orderBy(sql`DATE(${payments.processedAt})`);

  // Index by date string for O(1) lookup while filling gaps
  const byDate = new Map();
  for (const r of rows) {
    // mysql2 returns DATE as 'YYYY-MM-DD' string when dateStrings: true
    const key = typeof r.date === 'string' ? r.date : r.date.toISOString().slice(0, 10);
    byDate.set(key, Number(r.cents));
  }

  // Build the full series (zero-fill missing days)
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const cents = byDate.get(key) || 0;
    out.push({ date: key, revenue: cents / 100, revenue_cents: cents });
  }
  return out;
}

module.exports = { listRecent, aggregateSince, revenueByService, dailySeries };
// Note: mysqlToIso intentionally imported (used elsewhere in tests/scripts)
void mysqlToIso;
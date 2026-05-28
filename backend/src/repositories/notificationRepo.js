const { sql, desc } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const { notifications } = schema;

async function log({
  user_id = null,
  booking_id = null,
  channel,
  recipient,
  subject = null,
  body,
  provider = 'console',
  status = 'sent',
  error = null,
}) {
  const [result] = await db.insert(notifications).values({
    userId: user_id,
    bookingId: booking_id,
    channel,
    recipient,
    subject,
    body,
    provider,
    status,
    error,
  });
  return result.insertId;
}

async function list({ page = 1, pageSize = 50 } = {}) {
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ n: total }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(notifications);

  return { rows, total: Number(total), page, pageSize };
}

module.exports = { log, list };

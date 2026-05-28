const { eq, sql, desc } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const { contactMessages } = schema;

function toPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    full_name: row.fullName,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    is_read: !!row.isRead,
    created_at: row.createdAt,
  };
}

async function insert({ full_name, email, phone, subject, message }) {
  const [result] = await db.insert(contactMessages).values({
    fullName: full_name,
    email,
    phone: phone || null,
    subject: subject || null,
    message,
  });
  return result.insertId;
}

async function list({ page = 1, pageSize = 20 } = {}) {
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ n: total }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(contactMessages);

  return { rows: rows.map(toPublic), total: Number(total), page, pageSize };
}

async function findById(id) {
  const rows = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  return toPublic(rows[0]);
}

async function markRead(id) {
  await db.update(contactMessages).set({ isRead: 1 }).where(eq(contactMessages.id, id));
}

async function countUnread() {
  const [{ n }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(contactMessages)
    .where(eq(contactMessages.isRead, 0));
  return Number(n);
}

module.exports = { insert, list, findById, markRead, countUnread };

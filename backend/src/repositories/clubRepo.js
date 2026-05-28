const { eq, sql, or, like, desc } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const { clubMembers } = schema;

async function findByEmail(email) {
  const rows = await db
    .select()
    .from(clubMembers)
    .where(eq(clubMembers.email, email.toLowerCase()))
    .limit(1);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await db.select().from(clubMembers).where(eq(clubMembers.id, id)).limit(1);
  return rows[0] || null;
}

async function insert({ email, firstName }) {
  const [result] = await db.insert(clubMembers).values({
    email: email.toLowerCase(),
    firstName: firstName || null,
  });
  return result.insertId;
}

async function listAll({ q = '', page = 1, pageSize = 20 }) {
  const offset = (page - 1) * pageSize;
  const term = `%${q.toLowerCase()}%`;

  const where = q
    ? or(
        like(sql`LOWER(${clubMembers.email})`, term),
        like(sql`LOWER(${clubMembers.firstName})`, term)
      )
    : undefined;

  const rows = await db
    .select({
      id: clubMembers.id,
      email: clubMembers.email,
      first_name: clubMembers.firstName,
      created_at: clubMembers.createdAt,
    })
    .from(clubMembers)
    .where(where)
    .orderBy(desc(clubMembers.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ n: total }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(clubMembers)
    .where(where);

  return { rows, total: Number(total), page, pageSize };
}

async function remove(id) {
  await db.delete(clubMembers).where(eq(clubMembers.id, id));
}

module.exports = { findByEmail, findById, insert, listAll, remove };

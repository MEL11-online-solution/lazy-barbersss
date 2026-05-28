const { eq, sql, and, or, like, desc } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const { users, bookings } = schema;

async function findById(id) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] || null;
}

async function findByEmail(email) {
  const rows = await db
    .select()
    .from(users)
    .where(sql`LOWER(${users.email}) = LOWER(${email})`)
    .limit(1);
  return rows[0] || null;
}

async function insert({ first_name, last_name, email, phone, password_hash, role, email_verified = 0 }) {
  const [result] = await db.insert(users).values({
    firstName: first_name,
    lastName: last_name,
    email,
    phone: phone || null,
    passwordHash: password_hash,
    role,
    emailVerified: email_verified ? 1 : 0,
  });
  return result.insertId;
}

async function setEmailVerified(id) {
  await db.update(users).set({ emailVerified: 1 }).where(eq(users.id, id));
}

async function updatePassword(id, password_hash) {
  await db.update(users).set({ passwordHash: password_hash }).where(eq(users.id, id));
}

async function updateProfile({ id, first_name, last_name, phone }) {
  await db
    .update(users)
    .set({
      firstName: first_name,
      lastName: last_name,
      phone: phone ?? null,
    })
    .where(eq(users.id, id));
}

async function searchCustomers({ q = '', page = 1, pageSize = 10 }) {
  const offset = (page - 1) * pageSize;
  const term = `%${q.toLowerCase()}%`;

  const where = q
    ? and(
        eq(users.role, 'customer'),
        or(
          like(sql`LOWER(${users.firstName})`, term),
          like(sql`LOWER(${users.lastName})`, term),
          like(sql`LOWER(${users.email})`, term),
          like(users.phone, `%${q}%`)
        )
      )
    : eq(users.role, 'customer');

  const rows = await db
    .select({
      id: users.id,
      first_name: users.firstName,
      last_name: users.lastName,
      email: users.email,
      phone: users.phone,
      created_at: users.createdAt,
      total_bookings: sql`(SELECT COUNT(*) FROM ${bookings} WHERE ${bookings.customerId} = ${users.id})`.as('total_bookings'),
      last_visit: sql`(SELECT MAX(${bookings.startAt}) FROM ${bookings} WHERE ${bookings.customerId} = ${users.id})`.as('last_visit'),
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ n: total }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(users)
    .where(where);

  return { rows, total: Number(total), page, pageSize };
}

async function countByRole(role) {
  const [{ n }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(users)
    .where(eq(users.role, role));
  return Number(n);
}

/**
 * Public DTO — strips password_hash and converts to snake_case keys for
 * the API contract.
 */
function toPublic(user) {
  if (!user) return null;
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    email_verified: !!user.emailVerified,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

module.exports = {
  findById,
  findByEmail,
  insert,
  setEmailVerified,
  updatePassword,
  updateProfile,
  searchCustomers,
  countByRole,
  toPublic,
};

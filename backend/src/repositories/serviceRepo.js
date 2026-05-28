const { eq, and, asc } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const { services } = schema;

function toPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    price_cents: row.priceCents,
    price: row.priceCents / 100,
    duration_minutes: row.durationMinutes,
    is_active: !!row.isActive,
    display_order: row.displayOrder,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

async function listAll() {
  const rows = await db
    .select()
    .from(services)
    .orderBy(asc(services.displayOrder), asc(services.id));
  return rows.map(toPublic);
}

async function listActive() {
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.isActive, 1))
    .orderBy(asc(services.displayOrder), asc(services.id));
  return rows.map(toPublic);
}

async function findById(id) {
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return toPublic(rows[0]);
}

async function findActiveById(id) {
  const rows = await db
    .select()
    .from(services)
    .where(and(eq(services.id, id), eq(services.isActive, 1)))
    .limit(1);
  return toPublic(rows[0]);
}

async function findRawById(id) {
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return rows[0] || null;
}

async function insert(svc) {
  const [result] = await db.insert(services).values({
    name: svc.name,
    description: svc.description ?? null,
    category: svc.category ?? null,
    priceCents: svc.price_cents,
    durationMinutes: svc.duration_minutes,
    isActive: svc.is_active === false ? 0 : 1,
    displayOrder: svc.display_order ?? 0,
  });
  return result.insertId;
}

async function update(id, svc) {
  await db
    .update(services)
    .set({
      name: svc.name,
      description: svc.description ?? null,
      category: svc.category ?? null,
      priceCents: svc.price_cents,
      durationMinutes: svc.duration_minutes,
      isActive: svc.is_active === false ? 0 : 1,
      displayOrder: svc.display_order ?? 0,
    })
    .where(eq(services.id, id));
}

async function softDelete(id) {
  await db.update(services).set({ isActive: 0 }).where(eq(services.id, id));
}

module.exports = {
  listAll,
  listActive,
  findById,
  findActiveById,
  findRawById,
  insert,
  update,
  softDelete,
  toPublic,
};

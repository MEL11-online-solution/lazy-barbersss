const { eq, and, sql, desc, gte, lte, inArray } = require('drizzle-orm');
const { db, schema } = require('../config/db');
const { isoToMysql, mysqlToIso } = require('../utils/time');

const { bookings, services, barbers, users } = schema;

const ACTIVE_STATUSES = ['pending', 'confirmed'];

/**
 * Build a [start-of-day, end-of-day) Date pair from a 'YYYY-MM-DD' UTC
 * date string. We pass these to Drizzle's gte/lte directly — Drizzle
 * needs JS Date objects on `timestamp` columns, not pre-formatted
 * MySQL strings (it calls .toISOString() internally).
 */
function dayBoundsUtc(dateStr) {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
}

/**
 * Convert a raw DB row (camelCase) to the API public shape (snake_case).
 * Datetimes are converted from MySQL strings back to ISO.
 */
function toPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.reference,
    customer_id: row.customerId,
    barber_id: row.barberId,
    service_id: row.serviceId,
    start_at: mysqlToIso(row.startAt),
    end_at: mysqlToIso(row.endAt),
    status: row.status,
    payment_method: row.paymentMethod,
    payment_status: row.paymentStatus,
    price_cents: row.priceCents,
    price: row.priceCents / 100,
    notes: row.notes,
    cancelled_at: row.cancelledAt ? mysqlToIso(row.cancelledAt) : null,
    cancelled_by: row.cancelledBy,
    created_at: row.createdAt ? mysqlToIso(row.createdAt) : null,
    updated_at: row.updatedAt ? mysqlToIso(row.updatedAt) : null,
  };
}

/**
 * Hydrated booking row including service + barber + customer info.
 * Used by listing endpoints.
 */
function toHydrated(row) {
  if (!row) return null;
  return {
    ...toPublic(row),
    service_name: row.service_name,
    service_duration_minutes: row.service_duration_minutes,
    barber_first_name: row.barber_first_name,
    barber_last_name: row.barber_last_name,
    customer_first_name: row.customer_first_name,
    customer_last_name: row.customer_last_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
  };
}

const customers = users; // alias for clarity in joins

function selectHydrated() {
  return db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      customerId: bookings.customerId,
      barberId: bookings.barberId,
      serviceId: bookings.serviceId,
      startAt: bookings.startAt,
      endAt: bookings.endAt,
      status: bookings.status,
      paymentMethod: bookings.paymentMethod,
      paymentStatus: bookings.paymentStatus,
      priceCents: bookings.priceCents,
      notes: bookings.notes,
      cancelledAt: bookings.cancelledAt,
      cancelledBy: bookings.cancelledBy,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      service_name: services.name,
      service_duration_minutes: services.durationMinutes,
      barber_first_name: sql`barber_user.first_name`.as('barber_first_name'),
      barber_last_name: sql`barber_user.last_name`.as('barber_last_name'),
      customer_first_name: customers.firstName,
      customer_last_name: customers.lastName,
      customer_email: customers.email,
      customer_phone: customers.phone,
    })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(barbers, eq(barbers.id, bookings.barberId))
    .innerJoin(sql`users AS barber_user`, sql`barber_user.id = ${barbers.userId}`)
    .innerJoin(customers, eq(customers.id, bookings.customerId));
}

async function findById(id) {
  const rows = await selectHydrated().where(eq(bookings.id, id)).limit(1);
  return toHydrated(rows[0]);
}

async function findByReference(reference) {
  const rows = await selectHydrated().where(eq(bookings.reference, reference)).limit(1);
  return toHydrated(rows[0]);
}

async function listForCustomer(customerId) {
  const rows = await selectHydrated()
    .where(eq(bookings.customerId, customerId))
    .orderBy(desc(bookings.startAt));
  return rows.map(toHydrated);
}

async function listForBarber(barberId, { status } = {}) {
  let where = eq(bookings.barberId, barberId);
  if (status) {
    if (status === 'scheduled') {
      where = and(where, inArray(bookings.status, ['pending', 'confirmed']));
    } else {
      where = and(where, eq(bookings.status, status));
    }
  }
  const rows = await selectHydrated().where(where).orderBy(bookings.startAt);
  return rows.map(toHydrated);
}

/**
 * dateStr is 'YYYY-MM-DD' (UTC).
 * FIX: Pass Date objects to gte/lte, not MySQL-formatted strings.
 */
async function listForBarberOnDate(barberId, dateStr) {
  const { start, end } = dayBoundsUtc(dateStr);
  const rows = await selectHydrated()
    .where(
      and(
        eq(bookings.barberId, barberId),
        gte(bookings.startAt, start),
        lte(bookings.startAt, end)
      )
    )
    .orderBy(bookings.startAt);
  return rows.map(toHydrated);
}

/**
 * Admin filter list. All filters optional.
 * FIX: Pass Date objects to gte/lte.
 */
/**
 * Recently-created bookings, newest first. Optionally only those created
 * after `sinceIso` (UTC ISO string). Used by the admin notification bell.
 */
async function listRecentCreated({ sinceIso = null, limit = 10 } = {}) {
  const q = selectHydrated();
  const rows = sinceIso
    ? await q.where(gte(bookings.createdAt, new Date(sinceIso))).orderBy(desc(bookings.createdAt)).limit(limit)
    : await q.orderBy(desc(bookings.createdAt)).limit(limit);
  return rows.map(toHydrated);
}

async function listFiltered({ date, status, barberId, page = 1, pageSize = 20 } = {}) {
  const offset = (page - 1) * pageSize;
  const filters = [];
  if (date) {
    const { start, end } = dayBoundsUtc(date);
    filters.push(gte(bookings.startAt, start));
    filters.push(lte(bookings.startAt, end));
  }
  if (status) filters.push(eq(bookings.status, status));
  if (barberId) filters.push(eq(bookings.barberId, barberId));

  const where = filters.length ? and(...filters) : undefined;

  const q = selectHydrated();
  const rows = where
    ? await q.where(where).orderBy(desc(bookings.startAt)).limit(pageSize).offset(offset)
    : await q.orderBy(desc(bookings.startAt)).limit(pageSize).offset(offset);

  const countQ = db.select({ n: sql`COUNT(*)`.as('n') }).from(bookings);
  const [{ n: total }] = where ? await countQ.where(where) : await countQ;

  return { rows: rows.map(toHydrated), total: Number(total), page, pageSize };
}

/**
 * Get a barber's active (pending/confirmed) bookings for a given UTC date.
 * Used by availability calculation to mark slots as taken.
 * FIX: Pass Date objects to gte/lte.
 */
async function listActiveByBarberAndDate(barberId, dateStr, utcStart = null, utcEnd = null) {
  const { start, end } = dayBoundsUtc(dateStr);
  const qStart = utcStart ? new Date(utcStart) : start;
  const qEnd = utcEnd ? new Date(utcEnd) : end;
  return db
    .select({
      id: bookings.id,
      startAt: bookings.startAt,
      endAt: bookings.endAt,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.barberId, barberId),
        inArray(bookings.status, ACTIVE_STATUSES),
        gte(bookings.startAt, qStart),
        lte(bookings.startAt, qEnd)
      )
    );
}

async function updateStatus(id, status, by = null) {
  const set = { status };
  if (status === 'cancelled') {
    set.cancelledAt = sql`NOW()`;
    if (by != null) set.cancelledBy = by;
  }
  await db.update(bookings).set(set).where(eq(bookings.id, id));
}

async function updateTime(id, startAtIso, endAtIso) {
  // bookingService still passes ISO strings here; isoToMysql is fine
  // for raw .update().set() because Drizzle accepts strings on writes
  // when not going through column-typed operators. But to stay
  // consistent with the rule "Date objects everywhere", convert here.
  await db
    .update(bookings)
    .set({
      startAt: new Date(startAtIso),
      endAt: new Date(endAtIso),
    })
    .where(eq(bookings.id, id));
}

async function updatePaymentStatus(id, payment_status) {
  await db.update(bookings).set({ paymentStatus: payment_status }).where(eq(bookings.id, id));
}

async function hasCompletedForCustomer(customerId) {
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(eq(bookings.customerId, customerId), eq(bookings.status, 'completed')))
    .limit(1);
  return rows.length > 0;
}

module.exports = {
  ACTIVE_STATUSES,
  toPublic,
  toHydrated,
  findById,
  findByReference,
  listForCustomer,
  listForBarber,
  listForBarberOnDate,
  listFiltered,
  listRecentCreated,
  listActiveByBarberAndDate,
  updateStatus,
  updateTime,
  updatePaymentStatus,
  hasCompletedForCustomer,
};

// Keep isoToMysql import — used elsewhere in the codebase
void isoToMysql;
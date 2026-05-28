const { eq, and, sql, desc } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const { reviews, bookings } = schema;

function toPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    customer_id: row.customerId,
    booking_id: row.bookingId,
    customer_name: row.customerName,
    rating: row.rating,
    comment: row.comment,
    service_name: row.serviceName,
    is_published: !!row.isPublished,
    created_at: row.createdAt,
  };
}

async function listPublished({ page = 1, pageSize = 12 } = {}) {
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.isPublished, 1))
    .orderBy(desc(reviews.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ n: total }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(reviews)
    .where(eq(reviews.isPublished, 1));

  return { rows: rows.map(toPublic), total: Number(total), page, pageSize };
}

async function summary() {
  const [{ avg, total }] = await db
    .select({
      avg: sql`COALESCE(AVG(${reviews.rating}), 0)`.as('avg'),
      total: sql`COUNT(*)`.as('total'),
    })
    .from(reviews)
    .where(eq(reviews.isPublished, 1));

  return {
    average_rating: Number(Number(avg).toFixed(2)),
    total_count: Number(total),
  };
}

async function insert({ customer_id, booking_id, customer_name, rating, comment, service_name }) {
  const [result] = await db.insert(reviews).values({
    customerId: customer_id,
    bookingId: booking_id,
    customerName: customer_name,
    rating,
    comment,
    serviceName: service_name || null,
    isPublished: 1,
  });
  return result.insertId;
}

async function findById(id) {
  const rows = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return toPublic(rows[0]);
}

/**
 * Has the given customer left a review for the given booking already?
 */
async function existsForBooking(customerId, bookingId) {
  const rows = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.customerId, customerId), eq(reviews.bookingId, bookingId)))
    .limit(1);
  return rows.length > 0;
}

/**
 * Validate that the customer actually had this booking and it's completed.
 */
async function customerHasCompletedBooking(customerId, bookingId) {
  const rows = await db
    .select({ id: bookings.id, status: bookings.status, serviceName: sql`NULL`.as('serviceName') })
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.customerId, customerId)))
    .limit(1);
  return rows[0] && rows[0].status === 'completed';
}

module.exports = {
  listPublished,
  summary,
  insert,
  findById,
  existsForBooking,
  customerHasCompletedBooking,
  toPublic,
};

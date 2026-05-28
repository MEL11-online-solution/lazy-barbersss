const { eq, and, sql, desc, asc, lte, gte } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const { barbers, users, barberSchedules, barberTimeOff } = schema;

function rowToBarber(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    specialty: row.specialty,
    bio: row.bio,
    avatar_url: row.avatar_url,
    rating: row.rating != null ? Number(row.rating) : 0,
    review_count: row.review_count,
    status: row.status,
    notes: row.notes,
  };
}

function selectBarberWithUser() {
  return db
    .select({
      id: barbers.id,
      user_id: barbers.userId,
      first_name: users.firstName,
      last_name: users.lastName,
      email: users.email,
      phone: users.phone,
      specialty: barbers.specialty,
      bio: barbers.bio,
      avatar_url: barbers.avatarUrl,
      rating: barbers.rating,
      review_count: barbers.reviewCount,
      status: barbers.status,
      notes: barbers.notes,
    })
    .from(barbers)
    .innerJoin(users, eq(users.id, barbers.userId));
}

async function findById(id) {
  const rows = await selectBarberWithUser().where(eq(barbers.id, id)).limit(1);
  return rowToBarber(rows[0]);
}

async function findByUserId(userId) {
  const rows = await selectBarberWithUser().where(eq(barbers.userId, userId)).limit(1);
  return rowToBarber(rows[0]);
}

async function listActive() {
  const rows = await selectBarberWithUser()
    .where(eq(barbers.status, 'active'))
    .orderBy(asc(users.firstName));
  return rows.map(rowToBarber);
}

async function listAll() {
  const rows = await selectBarberWithUser().orderBy(asc(users.firstName));
  return rows.map(rowToBarber);
}

async function insert(b) {
  const [result] = await db.insert(barbers).values({
    userId: b.user_id,
    specialty: b.specialty ?? null,
    bio: b.bio ?? null,
    avatarUrl: b.avatar_url ?? null,
    status: b.status ?? 'active',
    notes: b.notes ?? null,
    rating: String(b.rating ?? 0),
    reviewCount: b.review_count ?? 0,
  });
  return result.insertId;
}

async function updateExtras(id, b) {
  await db
    .update(barbers)
    .set({
      specialty: b.specialty ?? null,
      bio: b.bio ?? null,
      avatarUrl: b.avatar_url ?? null,
      status: b.status ?? 'active',
      notes: b.notes ?? null,
    })
    .where(eq(barbers.id, id));
}

// ---- Schedule ----

async function getSchedule(barberId) {
  const rows = await db
    .select()
    .from(barberSchedules)
    .where(eq(barberSchedules.barberId, barberId))
    .orderBy(asc(barberSchedules.dayOfWeek));

  return rows.map((r) => ({
    day_of_week: r.dayOfWeek,
    start_time: r.startTime,
    end_time: r.endTime,
    is_working: !!r.isWorking,
  }));
}

async function upsertScheduleDay({ barber_id, day_of_week, start_time, end_time, is_working }) {
  // MySQL upsert via INSERT ... ON DUPLICATE KEY UPDATE
  await db.execute(sql`
    INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time, is_working)
    VALUES (${barber_id}, ${day_of_week}, ${start_time}, ${end_time}, ${is_working ? 1 : 0})
    ON DUPLICATE KEY UPDATE
      start_time = VALUES(start_time),
      end_time   = VALUES(end_time),
      is_working = VALUES(is_working)
  `);
}

// ---- Time off ----

async function listTimeOff(barberId) {
  return db
    .select()
    .from(barberTimeOff)
    .where(eq(barberTimeOff.barberId, barberId))
    .orderBy(desc(barberTimeOff.startDate));
}

async function listTimeOffOverlapping(barberId, dateStr) {
  return db
    .select()
    .from(barberTimeOff)
    .where(
      and(
        eq(barberTimeOff.barberId, barberId),
        eq(barberTimeOff.status, 'approved'),
        lte(barberTimeOff.startDate, dateStr),
        gte(barberTimeOff.endDate, dateStr)
      )
    );
}

async function listPendingTimeOff() {
  const rows = await db
    .select({
      id: barberTimeOff.id,
      barber_id: barberTimeOff.barberId,
      start_date: barberTimeOff.startDate,
      end_date: barberTimeOff.endDate,
      reason: barberTimeOff.reason,
      status: barberTimeOff.status,
      created_at: barberTimeOff.createdAt,
      first_name: users.firstName,
      last_name: users.lastName,
    })
    .from(barberTimeOff)
    .innerJoin(barbers, eq(barbers.id, barberTimeOff.barberId))
    .innerJoin(users, eq(users.id, barbers.userId))
    .where(eq(barberTimeOff.status, 'pending'))
    .orderBy(desc(barberTimeOff.createdAt));
  return rows;
}

async function insertTimeOff(t) {
  const [result] = await db.insert(barberTimeOff).values({
    barberId: t.barber_id,
    startDate: t.start_date,
    endDate: t.end_date,
    reason: t.reason ?? null,
    status: 'pending',
  });
  return result.insertId;
}

async function reviewTimeOff(id, { status, reviewed_by }) {
  await db
    .update(barberTimeOff)
    .set({
      status,
      reviewedAt: sql`NOW()`,
      reviewedBy: reviewed_by,
    })
    .where(eq(barberTimeOff.id, id));
}

async function findTimeOffById(id) {
  const rows = await db.select().from(barberTimeOff).where(eq(barberTimeOff.id, id)).limit(1);
  return rows[0] || null;
}

module.exports = {
  findById,
  findByUserId,
  listActive,
  listAll,
  insert,
  updateExtras,
  getSchedule,
  upsertScheduleDay,
  listTimeOff,
  listTimeOffOverlapping,
  listPendingTimeOff,
  insertTimeOff,
  reviewTimeOff,
  findTimeOffById,
};

/**
 * barberService — admin-facing operations on barbers.
 * Creating a barber requires creating both a `users` row (role='barber',
 * with email_verified=1) and a `barbers` row in one transaction.
 */
const { eq } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const userRepo = require('../repositories/userRepo');
const barberRepo = require('../repositories/barberRepo');
const { hashPassword } = require('../utils/hash');
const { HttpError } = require('../middleware/errorHandler');
const { BUSINESS_HOURS } = require('../config/constants');

const { users, barbers } = schema;

/**
 * Create a barber. Admin-only.
 *   - Hashes the temporary password
 *   - Sets email_verified = 1 (admin-created accounts are pre-verified)
 *   - Inserts barber profile
 *   - Seeds a default 7-day schedule (9–5 every day) using BUSINESS_HOURS
 */
async function createBarber({
  first_name,
  last_name,
  email,
  phone,
  password,
  specialty,
  bio,
  avatar_url,
  notes,
  status = 'active',
}) {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new HttpError(409, 'EMAIL_IN_USE', 'An account with that email already exists');
  }

  const password_hash = await hashPassword(password);

  const result = await db.transaction(async (tx) => {
    // Insert user
    const [userInsert] = await tx.insert(users).values({
      firstName: first_name,
      lastName: last_name,
      email,
      phone: phone || null,
      passwordHash: password_hash,
      role: 'barber',
      emailVerified: 1,
    });
    const userId = userInsert.insertId;

    // Insert barber profile
    const [barberInsert] = await tx.insert(barbers).values({
      userId,
      specialty: specialty || null,
      bio: bio || null,
      avatarUrl: avatar_url || null,
      status,
      notes: notes || null,
      rating: '0.00',
      reviewCount: 0,
    });
    const barberId = barberInsert.insertId;

    // Seed default schedule from BUSINESS_HOURS
    for (let dow = 0; dow < 7; dow++) {
      const hours = BUSINESS_HOURS[dow];
      await tx.insert(schema.barberSchedules).values({
        barberId,
        dayOfWeek: dow,
        startTime: hours.start,
        endTime: hours.end,
        isWorking: 1,
      });
    }

    return { userId, barberId };
  });

  return barberRepo.findById(result.barberId);
}

async function updateBarber(barberId, patch, actor) {
  const barber = await barberRepo.findById(barberId);
  if (!barber) throw new HttpError(404, 'BARBER_NOT_FOUND', 'Barber not found');

  // Only admin OR the barber themselves can update
  if (actor.role !== 'admin') {
    if (actor.role !== 'barber') {
      throw new HttpError(403, 'FORBIDDEN', 'Only admins or the barber themselves can update');
    }
    const me = await barberRepo.findByUserId(actor.id);
    if (!me || me.id !== barberId) {
      throw new HttpError(403, 'FORBIDDEN', 'Cannot edit another barber\'s profile');
    }
  }

  // Update barbers table fields
  await barberRepo.updateExtras(barberId, {
    specialty: patch.specialty ?? barber.specialty,
    bio: patch.bio ?? barber.bio,
    avatar_url: patch.avatar_url ?? barber.avatar_url,
    status: actor.role === 'admin' ? (patch.status ?? barber.status) : barber.status,
    notes: actor.role === 'admin' ? (patch.notes ?? barber.notes) : barber.notes,
  });

  // Update users table fields
  if (patch.first_name || patch.last_name || patch.phone !== undefined) {
    await userRepo.updateProfile({
      id: barber.user_id,
      first_name: patch.first_name ?? barber.first_name,
      last_name: patch.last_name ?? barber.last_name,
      phone: patch.phone ?? barber.phone,
    });
  }

  return barberRepo.findById(barberId);
}

async function setStatus(barberId, status) {
  const barber = await barberRepo.findById(barberId);
  if (!barber) throw new HttpError(404, 'BARBER_NOT_FOUND', 'Barber not found');
  if (!['active', 'on_leave', 'inactive'].includes(status)) {
    throw new HttpError(400, 'INVALID_STATUS', 'Status must be active, on_leave, or inactive');
  }
  await db.update(barbers).set({ status }).where(eq(barbers.id, barberId));
  return barberRepo.findById(barberId);
}

/**
 * Replace a barber's full week schedule.
 * Input: array of 7 entries { day_of_week, start_time, end_time, is_working }.
 */
async function replaceSchedule(barberId, scheduleArray) {
  const barber = await barberRepo.findById(barberId);
  if (!barber) throw new HttpError(404, 'BARBER_NOT_FOUND', 'Barber not found');

  for (const entry of scheduleArray) {
    await barberRepo.upsertScheduleDay({
      barber_id: barberId,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      is_working: entry.is_working,
    });
  }
  return barberRepo.getSchedule(barberId);
}

module.exports = {
  createBarber,
  updateBarber,
  setStatus,
  replaceSchedule,
};

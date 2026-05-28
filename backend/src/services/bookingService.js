/**
 * bookingService — the heart of the system.
 *
 * Double-booking prevention strategy
 * ----------------------------------
 * 1. The booking insert runs inside a MySQL transaction.
 * 2. We `SELECT ... FOR UPDATE` the barber row first. This serializes
 *    concurrent booking attempts against the same barber: a second
 *    transaction trying to book the same barber will block until the
 *    first commits or rolls back.
 * 3. With that lock held, we run an overlap query against the bookings
 *    table for the requested time window. If any row exists with
 *    status IN ('pending','confirmed') and overlaps, we throw 409.
 * 4. Otherwise we insert. The transaction commits, the lock releases,
 *    and the next waiting transaction's overlap check will now see the
 *    new row and correctly reject.
 *
 * This is deterministic — there is no window in which two clients can
 * each pass the overlap check before either inserts.
 *
 * For "any available barber" (barber_id == null), we iterate active
 * barbers and try the same locked overlap-check on each, taking the
 * first one that succeeds. Each attempt uses its own short transaction
 * so we don't hold long-running locks.
 */

const { sql, eq, and, inArray, lt, gt } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const serviceRepo = require('../repositories/serviceRepo');
const barberRepo = require('../repositories/barberRepo');
const bookingRepo = require('../repositories/bookingRepo');
const auditRepo = require('../repositories/auditRepo');
const smsService = require('./sms');
const emailService = require('./email');
const { nextBookingRef, generateTransactionId } = require('../utils/reference');
const {
  isoToMysql,
  mysqlToIso,
  addMinutesIso,
  diffMinutes,
  combineDateTimeUtc,
  isoToDateStr,
  isoToTimeStr,
  timeToMinutes,
  dayOfWeekUtc,
  nowIso,
  isValidIso,
} = require('../utils/time');
const {
  MIN_ADVANCE_MINUTES,
  MAX_ADVANCE_DAYS,
  CANCEL_CUTOFF_MINUTES,
  RESCHEDULE_CUTOFF_MINUTES,
} = require('../config/constants');
const { HttpError } = require('../middleware/errorHandler');

const { bookings, barbers, payments } = schema;

const ACTIVE_STATUSES = ['pending', 'confirmed'];

const SHOP_TIMEZONE = process.env.SHOP_TIMEZONE || 'Australia/Sydney';
const BUSINESS_ADDRESS = process.env.BUSINESS_ADDRESS || '15 Good St, Granville NSW';

/**
 * Given a UTC ISO datetime, return { dow, minutes } where:
 *   dow      = day of week IN SHOP-LOCAL TIME (0=Sun..6=Sat)
 *   minutes  = minutes since shop-local midnight (0..1439)
 *
 * This is what we compare against barber_schedules rows, since those
 * store wall-clock times like '09:00' that the admin entered locally.
 */
function shopLocalDowAndMinutes(iso) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(iso));
  const weekday = parts.find((p) => p.type === 'weekday').value;
  const hour = Number(parts.find((p) => p.type === 'hour').value);
  const minute = Number(parts.find((p) => p.type === 'minute').value);
  const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dow: DOW[weekday], minutes: hour * 60 + minute };
}

// -------------------------------------------------------------------
// Pre-flight validation (stateless rules only — DB checks happen in tx)
// -------------------------------------------------------------------

function assertWithinAdvanceWindow(startAtIso) {
  const minutesAhead = diffMinutes(nowIso(), startAtIso);
  if (minutesAhead < MIN_ADVANCE_MINUTES) {
    throw new HttpError(
      400,
      'TOO_SOON',
      `Bookings must be at least ${MIN_ADVANCE_MINUTES} minutes in advance`
    );
  }
  const dayMs = 24 * 60 * 60 * 1000;
  const daysAhead = (new Date(startAtIso).getTime() - Date.now()) / dayMs;
  if (daysAhead > MAX_ADVANCE_DAYS) {
    throw new HttpError(
      400,
      'TOO_FAR',
      `Bookings cannot be more than ${MAX_ADVANCE_DAYS} days in advance`
    );
  }
}

async function assertFitsBarberSchedule(barberId, startAtIso, endAtIso) {
  // Read the slot's day-of-week + minutes IN SHOP-LOCAL TIME, since that's
  // how barber_schedules is stored (wall-clock '09:00'..'19:00').
  const startLocal = shopLocalDowAndMinutes(startAtIso);
  const endLocal = shopLocalDowAndMinutes(endAtIso);

  const schedule = await barberRepo.getSchedule(barberId);
  const day = schedule.find((d) => d.day_of_week === startLocal.dow);
  if (!day || !day.is_working) {
    throw new HttpError(400, 'BARBER_NOT_WORKING', 'Selected barber is not working that day');
  }

  const startMin = timeToMinutes(day.start_time);
  const endMin = timeToMinutes(day.end_time);

  if (startLocal.minutes < startMin || endLocal.minutes > endMin) {
    throw new HttpError(400, 'OUT_OF_HOURS', 'Selected time is outside the barber\'s working hours');
  }
}

async function assertNotInTimeOff(barberId, startAtIso) {
  const dateStr = isoToDateStr(startAtIso);
  const overlapping = await barberRepo.listTimeOffOverlapping(barberId, dateStr);
  if (overlapping.length > 0) {
    throw new HttpError(400, 'BARBER_ON_LEAVE', 'Selected barber is on leave that day');
  }
}

// -------------------------------------------------------------------
// The locked overlap check (runs inside a transaction)
// -------------------------------------------------------------------


/**
 * Check whether the requested window overlaps with an existing
 * pending/confirmed booking for `barberId`.
 *
 * startAt/endAt must be JS Date objects (Drizzle timestamp columns
 * require Date, not strings).
 */
async function findConflict(tx, barberId, startAt, endAt, excludeBookingId = null) {
  const filters = [
    eq(bookings.barberId, barberId),
    inArray(bookings.status, ACTIVE_STATUSES),
    lt(bookings.startAt, endAt),
    gt(bookings.endAt, startAt),
  ];
  if (excludeBookingId != null) {
    filters.push(sql`${bookings.id} <> ${excludeBookingId}`);
  }
  const rows = await tx.select({ id: bookings.id }).from(bookings).where(and(...filters)).limit(1);
  return rows[0] ? rows[0].id : null;
}

/**
 * Lock the barber row to serialize concurrent booking attempts against
 * the same barber. This is the cornerstone of double-booking prevention.
 */
async function lockBarberRow(tx, barberId) {
  await tx.execute(sql`SELECT id FROM barbers WHERE id = ${barberId} FOR UPDATE`);
}

// -------------------------------------------------------------------
// CREATE BOOKING (the critical path)
// -------------------------------------------------------------------

async function createBooking({
  customer,
  service_id,
  barber_id, // may be null/undefined → any-available
  start_at,
  payment_method = 'counter',
  notes = null,
  payment_intent_id = null,
  card_last4 = null,
}) {
  if (!isValidIso(start_at)) {
    throw new HttpError(400, 'INVALID_START_AT', 'start_at must be ISO-8601 UTC');
  }
  if (!['online', 'counter'].includes(payment_method)) {
    throw new HttpError(400, 'INVALID_PAYMENT', 'payment_method must be online or counter');
  }

  // Service / pricing (stateless lookups)
  const service = await serviceRepo.findActiveById(service_id);
  if (!service) {
    throw new HttpError(404, 'SERVICE_NOT_FOUND', 'Service not found or inactive');
  }

  const end_at = addMinutesIso(start_at, service.duration_minutes);

  assertWithinAdvanceWindow(start_at);

  if (barber_id) {
    return _createForSpecificBarber({
      customer,
      service,
      barberId: barber_id,
      start_at,
      end_at,
      payment_method,
      notes,
      payment_intent_id,
      card_last4,
    });
  }
  return _createAnyAvailable({
    customer,
    service,
    start_at,
    end_at,
    payment_method,
    notes,
    payment_intent_id,
    card_last4,
  });
}

async function _createForSpecificBarber({
  customer,
  service,
  barberId,
  start_at,
  end_at,
  payment_method,
  notes,
  payment_intent_id = null,
  card_last4 = null,
}) {
  const barber = await barberRepo.findById(barberId);
  if (!barber) {
    throw new HttpError(404, 'BARBER_NOT_FOUND', 'Barber not found');
  }
  if (barber.status !== 'active') {
    throw new HttpError(400, 'BARBER_INACTIVE', 'Selected barber is not currently available');
  }

  await assertFitsBarberSchedule(barberId, start_at, end_at);
  await assertNotInTimeOff(barberId, start_at);

  // Drizzle timestamp columns need Date objects, not MySQL strings
  const startDate = new Date(start_at);
  const endDate = new Date(end_at);

  // ---- THE TRANSACTION ----
  const result = await db.transaction(async (tx) => {
    // 1. Lock the barber row → serializes concurrent attempts on this barber
    await lockBarberRow(tx, barberId);

    // 2. With the lock held, do the authoritative overlap check
    const conflictId = await findConflict(tx, barberId, startDate, endDate);
    if (conflictId) {
      throw new HttpError(
        409,
        'SLOT_TAKEN',
        'That time slot was just taken. Please pick another.'
      );
    }

    // 3. Generate per-year reference (atomic counter)
    const reference = await nextBookingRef(tx);

    // 4. Insert the booking
    const [insertResult] = await tx.insert(bookings).values({
      reference,
      customerId: customer.id,
      barberId,
      serviceId: service.id,
      startAt: startDate,
      endAt: endDate,
      status: 'confirmed',
      paymentMethod: payment_method,
      paymentStatus: payment_method === 'online' && payment_intent_id ? 'paid' : 'unpaid',
      priceCents: service.price_cents,
      notes,
    });
    const bookingId = insertResult.insertId;

    // 5. Record the Stripe payment inside the same transaction
    if (payment_method === 'online' && payment_intent_id) {
      await tx.insert(payments).values({
        bookingId,
        transactionId: payment_intent_id,
        amountCents: service.price_cents,
        method: 'online',
        status: 'succeeded',
        cardLast4: card_last4 ?? null,
      });
    }

    return { bookingId, reference };
  });

  // ---- Post-commit (out-of-transaction): SMS + email ----
  const created = await bookingRepo.findById(result.bookingId);
  const smsBody = await smsService.sendBookingConfirmation({
    to: customer.phone,
    customerId: customer.id,
    booking: {
      id: created.id,
      reference: created.reference,
      start_at: created.start_at,
    },
    service: { name: service.name },
    barber: { first_name: barber.first_name },
  });

  // Booking confirmation email (fire-and-forget)
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Valued Customer';
  emailService.sendBookingConfirmation({
    to: customer.email,
    customerName,
    serviceName: service.name,
    barberName: barber.first_name,
    dateTime: created.start_at,
    duration: service.duration_minutes,
    location: BUSINESS_ADDRESS,
    reference: created.reference,
    total: service.price_cents / 100,
  }).catch(() => {});

  // Admin notification of the new booking (fire-and-forget)
  emailService.sendAdminNewBooking({
    reference: created.reference,
    customerName,
    customerEmail: customer.email,
    customerPhone: customer.phone || null,
    serviceName: service.name,
    barberName: barber.first_name,
    dateTime: created.start_at,
    paymentMethod: payment_method,
    total: service.price_cents / 100,
  }).catch(() => {});

  // Payment receipt email for online payments only (fire-and-forget)
  if (payment_method === 'online' && payment_intent_id) {
    emailService.sendPaymentReceipt({
      to: customer.email,
      customerName,
      customerEmail: customer.email,
      customerPhone: customer.phone || null,
      serviceName: service.name,
      barberName: barber.first_name,
      dateTime: created.start_at,
      reference: created.reference,
      total: service.price_cents / 100,
      paymentMethod: 'online',
      cardLast4: card_last4,
      transactionId: payment_intent_id,
    }).catch(() => {});
  }

  auditRepo.log({
    userId: customer.id,
    action: 'booking.created',
    entityType: 'booking',
    entityId: created.id,
    details: { reference: created.reference, service: service.name },
  });

  return { booking: created, sms_body: smsBody };
}

async function _createAnyAvailable({
  customer,
  service,
  start_at,
  end_at,
  payment_method,
  notes,
  payment_intent_id = null,
  card_last4 = null,
}) {
  const activeBarbers = await barberRepo.listActive();
  if (activeBarbers.length === 0) {
    throw new HttpError(409, 'NO_BARBER_AVAILABLE', 'No barbers are currently available');
  }

  let lastErr = null;
  for (const b of activeBarbers) {
    try {
      // Each per-barber attempt uses its own transaction (short, scoped lock)
      return await _createForSpecificBarber({
        customer,
        service,
        barberId: b.id,
        start_at,
        end_at,
        payment_method,
        notes,
        payment_intent_id,
        card_last4,
      });
    } catch (err) {
      // Any of these mean "this barber can't take it, try the next one"
      const skippable = ['SLOT_TAKEN', 'BARBER_NOT_WORKING', 'OUT_OF_HOURS', 'BARBER_ON_LEAVE', 'BARBER_INACTIVE'];
      if (err instanceof HttpError && skippable.includes(err.code)) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr || new HttpError(409, 'NO_SLOT', 'No barber available at that time');
}

// -------------------------------------------------------------------
// CANCEL BOOKING
// -------------------------------------------------------------------

async function cancelBooking({ bookingId, actor, reason = null }) {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');

  // Permission: customer (owner) or admin
  if (actor.role !== 'admin' && booking.customer_id !== actor.id) {
    throw new HttpError(403, 'FORBIDDEN', 'Cannot cancel another customer\'s booking');
  }

  if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
    throw new HttpError(400, 'INVALID_STATE', `Cannot cancel a ${booking.status} booking`);
  }

  // Cancellation cutoff (admins bypass)
  if (actor.role !== 'admin') {
    const minsToStart = diffMinutes(nowIso(), booking.start_at);
    if (minsToStart < CANCEL_CUTOFF_MINUTES) {
      throw new HttpError(
        400,
        'CANCEL_TOO_LATE',
        `Cancellations must be made at least ${CANCEL_CUTOFF_MINUTES} minutes before the appointment`
      );
    }
  }

  await bookingRepo.updateStatus(bookingId, 'cancelled', actor.id);
  const updated = await bookingRepo.findById(bookingId);

  // Notify: SMS + email (fire-and-forget on email)
  await smsService.sendBookingCancelled({
    to: updated.customer_phone,
    customerId: updated.customer_id,
    booking: {
      id: updated.id,
      reference: updated.reference,
      start_at: updated.start_at,
    },
    service: { name: updated.service_name },
  });

  emailService.sendBookingCancellation({
    to: updated.customer_email,
    customerName: `${updated.customer_first_name} ${updated.customer_last_name}`,
    serviceName: updated.service_name,
    reference: updated.reference,
    dateTime: updated.start_at,
  }).catch(() => {});

  // Admin notification when a customer cancels (fire-and-forget)
  if (actor.role !== 'admin') {
    emailService.sendAdminBookingCancelled({
      reference: updated.reference,
      customerName: `${updated.customer_first_name} ${updated.customer_last_name}`,
      serviceName: updated.service_name,
      dateTime: updated.start_at,
      reason,
    }).catch(() => {});
  }

  auditRepo.log({
    userId: actor.id,
    action: 'booking.cancelled',
    entityType: 'booking',
    entityId: bookingId,
    details: { reference: updated.reference },
  });

  return updated;
}

// -------------------------------------------------------------------
// RESCHEDULE BOOKING
// -------------------------------------------------------------------

async function rescheduleBooking({ bookingId, new_start_at, actor }) {
  if (!isValidIso(new_start_at)) {
    throw new HttpError(400, 'INVALID_START_AT', 'new_start_at must be ISO-8601 UTC');
  }

  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');

  if (actor.role !== 'admin' && booking.customer_id !== actor.id) {
    throw new HttpError(403, 'FORBIDDEN', 'Cannot reschedule another customer\'s booking');
  }
  if (!ACTIVE_STATUSES.includes(booking.status)) {
    throw new HttpError(400, 'INVALID_STATE', `Cannot reschedule a ${booking.status} booking`);
  }

  if (actor.role !== 'admin') {
    const minsToStart = diffMinutes(nowIso(), booking.start_at);
    if (minsToStart < RESCHEDULE_CUTOFF_MINUTES) {
      throw new HttpError(
        400,
        'RESCHEDULE_TOO_LATE',
        `Reschedules must be made at least ${RESCHEDULE_CUTOFF_MINUTES} minutes before the appointment`
      );
    }
  }

  assertWithinAdvanceWindow(new_start_at);

  const service = await serviceRepo.findRawById(booking.service_id);
  if (!service) throw new HttpError(404, 'SERVICE_NOT_FOUND', 'Service no longer exists');

  const new_end_at = addMinutesIso(new_start_at, service.durationMinutes);

  await assertFitsBarberSchedule(booking.barber_id, new_start_at, new_end_at);
  await assertNotInTimeOff(booking.barber_id, new_start_at);

  const previousStartAt = booking.start_at;
  const startDate = new Date(new_start_at);
  const endDate = new Date(new_end_at);

  await db.transaction(async (tx) => {
    await lockBarberRow(tx, booking.barber_id);

    // Overlap check excludes this booking's own row
    const conflictId = await findConflict(tx, booking.barber_id, startDate, endDate, booking.id);
    if (conflictId) {
      throw new HttpError(409, 'SLOT_TAKEN', 'That time slot was just taken. Please pick another.');
    }

    await tx
      .update(bookings)
      .set({ startAt: startDate, endAt: endDate })
      .where(eq(bookings.id, booking.id));
  });

  const updated = await bookingRepo.findById(booking.id);

  await smsService.sendBookingRescheduled({
    to: updated.customer_phone,
    customerId: updated.customer_id,
    booking: {
      id: updated.id,
      reference: updated.reference,
      start_at: updated.start_at,
    },
    service: { name: updated.service_name },
    barber: { first_name: updated.barber_first_name },
    previousStartAt,
  });

  emailService.sendBookingRescheduled({
    to: updated.customer_email,
    customerName: `${updated.customer_first_name} ${updated.customer_last_name}`,
    serviceName: updated.service_name,
    barberName: updated.barber_first_name,
    oldDateTime: previousStartAt,
    newDateTime: updated.start_at,
    reference: updated.reference,
  }).catch(() => {});

  auditRepo.log({
    userId: actor.id,
    action: 'booking.rescheduled',
    entityType: 'booking',
    entityId: bookingId,
    details: { reference: updated.reference, from: previousStartAt, to: updated.start_at },
  });

  return updated;
}

// -------------------------------------------------------------------
// STATUS UPDATE (barber/admin marks completed/no_show)
// -------------------------------------------------------------------

async function updateStatus({ bookingId, status, actor }) {
  const allowed = ['confirmed', 'completed', 'no_show'];
  if (!allowed.includes(status)) {
    throw new HttpError(400, 'INVALID_STATUS', `Status must be one of: ${allowed.join(', ')}`);
  }

  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');

  // Permissions: admin, or the assigned barber
  if (actor.role === 'barber') {
    const myBarber = await barberRepo.findByUserId(actor.id);
    if (!myBarber || myBarber.id !== booking.barber_id) {
      throw new HttpError(403, 'FORBIDDEN', 'You are not assigned to this booking');
    }
  } else if (actor.role !== 'admin') {
    throw new HttpError(403, 'FORBIDDEN', 'Only barber/admin can change status');
  }

  await bookingRepo.updateStatus(bookingId, status, actor.id);
  return bookingRepo.findById(bookingId);
}

// -------------------------------------------------------------------
// Receipt-ready data
// -------------------------------------------------------------------

async function getReceiptData(bookingId, actor) {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');

  if (actor.role === 'customer' && booking.customer_id !== actor.id) {
    throw new HttpError(403, 'FORBIDDEN', 'Cannot view another customer\'s receipt');
  }
  if (actor.role === 'barber') {
    const myBarber = await barberRepo.findByUserId(actor.id);
    if (!myBarber || myBarber.id !== booking.barber_id) {
      throw new HttpError(403, 'FORBIDDEN', 'Cannot view this receipt');
    }
  }

  // Fetch Stripe payment details for online bookings
  let card_last4 = null;
  let transaction_id = null;
  if (booking.payment_method === 'online') {
    const [pRow] = await db
      .select({ cardLast4: payments.cardLast4, transactionId: payments.transactionId })
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .limit(1);
    if (pRow) {
      card_last4 = pRow.cardLast4;
      transaction_id = pRow.transactionId;
    }
  }

  return { ...booking, card_last4, transaction_id };
}

module.exports = {
  createBooking,
  cancelBooking,
  rescheduleBooking,
  updateStatus,
  getReceiptData,
};

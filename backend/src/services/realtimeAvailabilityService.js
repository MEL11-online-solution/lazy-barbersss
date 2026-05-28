/**
 * realtimeAvailabilityService — "who is available RIGHT NOW?"
 *
 * A barber is available iff:
 *   1. status = 'active'
 *   2. their schedule today (in SHOP-LOCAL TIME) covers right now
 *   3. they have no pending/confirmed booking overlapping "now"
 *
 * IMPORTANT: schedules in barber_schedules are STRINGS like '09:00'.
 * We treat them as the SHOP's local wall-clock time (Australia/Sydney
 * by default), NOT UTC, because that's how a barber thinks about hours.
 *
 * Bookings still compare in UTC because start_at / end_at are TIMESTAMPs.
 */
const { and, eq, lt, gt, inArray } = require('drizzle-orm');
const { db, schema } = require('../config/db');
const barberRepo = require('../repositories/barberRepo');
const { timeToMinutes } = require('../utils/time');

const { bookings } = schema;

const SHOP_TIMEZONE = process.env.SHOP_TIMEZONE || 'Australia/Sydney';

/**
 * Return { dow, minutes } for "right now" in the shop's local timezone.
 * dow: 0=Sun … 6=Sat
 * minutes: minutes since local midnight
 */
function localNow() {
  const now = new Date();

  // Use Intl to extract weekday + HH:MM in shop tz reliably
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday').value;
  const hour = Number(parts.find((p) => p.type === 'hour').value);
  const minute = Number(parts.find((p) => p.type === 'minute').value);

  const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    dow: DOW[weekday],
    minutes: hour * 60 + minute,
    iso: now.toISOString(),
    dateObj: now,
  };
}

/**
 * Returns the list of barbers available right now.
 */
async function whoIsAvailableNow() {
  const { dow, minutes, iso, dateObj } = localNow();

  // 1. Active barbers only
  const activeBarbers = await barberRepo.listActive();
  if (activeBarbers.length === 0) {
    return { now: iso, available: [] };
  }

  const available = [];
  for (const barber of activeBarbers) {
    // 2. Schedule check (compared in shop-local time)
    const schedule = await barberRepo.getSchedule(barber.id);
    const today = schedule.find((d) => d.day_of_week === dow);
    if (!today || !today.is_working) continue;

    const startMin = timeToMinutes(today.start_time);
    const endMin = timeToMinutes(today.end_time);
    if (minutes < startMin || minutes >= endMin) continue;

    // 3. Overlapping booking check (UTC, since bookings are TIMESTAMPs)
    const conflict = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.barberId, barber.id),
          inArray(bookings.status, ['pending', 'confirmed']),
          lt(bookings.startAt, dateObj),
          gt(bookings.endAt, dateObj)
        )
      )
      .limit(1);

    if (conflict.length > 0) continue;

    available.push({
      id: barber.id,
      first_name: barber.first_name,
      last_name: barber.last_name,
      specialty: barber.specialty,
      rating: Number(barber.rating),
      ends_at_minute: endMin,
    });
  }

  return { now: iso, available };
}

module.exports = { whoIsAvailableNow };
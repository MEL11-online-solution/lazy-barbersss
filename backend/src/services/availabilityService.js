/**
 * Availability calculation.
 *
 * For a given (barber_id, date, service_id):
 *   1. Look up the barber's schedule for that day-of-week.
 *   2. If barber is on approved time-off that day → no slots.
 *   3. Generate 30-minute slots between schedule start and (end - service_duration).
 *   4. Mark each slot unavailable if it overlaps an existing
 *      pending/confirmed booking, or is too close to "now"
 *      (MIN_ADVANCE_MINUTES rule).
 *
 * NOTE on "barber_id is null" (any barber):
 *   The bookingService picks a real barber at insert time — availability
 *   for "any" is computed by aggregating per-barber availability.
 */

const serviceRepo = require('../repositories/serviceRepo');
const barberRepo = require('../repositories/barberRepo');
const bookingRepo = require('../repositories/bookingRepo');

const {
  SLOT_MINUTES,
  MIN_ADVANCE_MINUTES,
  MAX_ADVANCE_DAYS,
} = require('../config/constants');

const {
  timeToMinutes,
  minutesToTime,
  combineDateTimeUtc,
  isValidDateStr,
  dayOfWeekUtc,
  diffMinutes,
  nowIso,
  addMinutesIso,
} = require('../utils/time');

const { HttpError } = require('../middleware/errorHandler');

const SHOP_TIMEZONE = process.env.SHOP_TIMEZONE || 'Australia/Sydney';

/**
 * Combine a 'YYYY-MM-DD' date + 'HH:MM' wall-clock time, interpreting the
 * wall-clock as SHOP-LOCAL (Sydney), and return a real UTC ISO string.
 */
function localToUtcIso(dateStr, hhmm) {
  const naiveUtc = new Date(`${dateStr}T${hhmm}:00.000Z`);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    timeZoneName: 'shortOffset',
  });
  const tz = fmt.formatToParts(naiveUtc).find((p) => p.type === 'timeZoneName').value;
  const m = tz.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!m) return naiveUtc.toISOString();
  const sign = m[1] === '+' ? 1 : -1;
  const offsetMin = sign * (Number(m[2]) * 60 + Number(m[3] || 0));
  return new Date(naiveUtc.getTime() - offsetMin * 60 * 1000).toISOString();
}

function assertDateInRange(dateStr) {
  if (!isValidDateStr(dateStr)) {
    throw new HttpError(400, 'INVALID_DATE', 'Invalid date format (expected YYYY-MM-DD)');
  }
  const requested = new Date(`${dateStr}T00:00:00.000Z`).getTime();
  const today = new Date(`${nowIso().slice(0, 10)}T00:00:00.000Z`).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const daysAhead = (requested - today) / dayMs;
  if (daysAhead < 0) {
    throw new HttpError(400, 'DATE_IN_PAST', 'Cannot view availability for past dates');
  }
  if (daysAhead > MAX_ADVANCE_DAYS) {
    throw new HttpError(400, 'DATE_TOO_FAR', `Cannot book more than ${MAX_ADVANCE_DAYS} days ahead`);
  }
}

/**
 * Compute slots for one specific barber.
 */
async function getSlotsForBarber({ barberId, serviceId, date }) {
  assertDateInRange(date);

  const service = await serviceRepo.findActiveById(serviceId);
  if (!service) {
    throw new HttpError(404, 'SERVICE_NOT_FOUND', 'Service not found or inactive');
  }
  const barber = await barberRepo.findById(barberId);
  if (!barber) {
    throw new HttpError(404, 'BARBER_NOT_FOUND', 'Barber not found');
  }
  if (barber.status !== 'active') {
    return { date, barber_id: barberId, service_id: serviceId, slots: [] };
  }

  // Check time-off (approved only)
  const timeOff = await barberRepo.listTimeOffOverlapping(barberId, date);
  if (timeOff.length > 0) {
    return { date, barber_id: barberId, service_id: serviceId, slots: [] };
  }

  // Schedule for this day
  const dow = new Date(`${date}T12:00:00`).getDay();
  const schedule = await barberRepo.getSchedule(barberId);
  const day = schedule.find((d) => d.day_of_week === dow);
  if (!day || !day.is_working) {
    return { date, barber_id: barberId, service_id: serviceId, slots: [] };
  }

  const startMin = timeToMinutes(day.start_time);
  const endMin = timeToMinutes(day.end_time);
  const dur = service.duration_minutes;

  // Compute UTC bounds that cover the full LOCAL day (not the UTC calendar day).
  // e.g., Sydney UTC+10 May 9 spans UTC May 8 14:00 → May 9 13:59:59.999.
  // Using a naive UTC calendar range would miss morning slots whose UTC
  // timestamp falls on the previous UTC date.
  const dayStartUtc = localToUtcIso(date, '00:00');
  const dayEndMs = new Date(dayStartUtc).getTime() + 24 * 60 * 60 * 1000 - 1;
  const dayEndUtc = new Date(dayEndMs).toISOString();

  // Existing bookings on that date
  const existing = await bookingRepo.listActiveByBarberAndDate(barberId, date, dayStartUtc, dayEndUtc);

  const slots = [];
  for (let t = startMin; t + dur <= endMin; t += SLOT_MINUTES) {
    const slotStart = localToUtcIso(date, minutesToTime(t));
    const slotEnd = addMinutesIso(slotStart, dur);

    // Min-advance rule
    let available = diffMinutes(nowIso(), slotStart) >= MIN_ADVANCE_MINUTES;

    // Overlap with existing bookings.
    // b.startAt/endAt come back as Date objects from Drizzle 0.36 —
    // numeric ms comparison avoids the silent Date < string = false trap.
    if (available) {
      const slotStartMs = new Date(slotStart).getTime();
      const slotEndMs = new Date(slotEnd).getTime();
      for (const b of existing) {
        const eStartMs = new Date(b.startAt).getTime();
        const eEndMs = new Date(b.endAt).getTime();
        if (eStartMs < slotEndMs && eEndMs > slotStartMs) {
          available = false;
          break;
        }
      }
    }

    slots.push({
      time: minutesToTime(t),
      start_at: slotStart,
      end_at: slotEnd,
      available,
    });
  }

  return {
    date,
    barber_id: barberId,
    service_id: serviceId,
    slots,
  };
}

/**
 * "Any available barber" — combine availability across active barbers.
 * A slot is available if at least one active barber can take it.
 */
async function getSlotsAnyBarber({ serviceId, date }) {
  assertDateInRange(date);

  const service = await serviceRepo.findActiveById(serviceId);
  if (!service) {
    throw new HttpError(404, 'SERVICE_NOT_FOUND', 'Service not found or inactive');
  }

  const activeBarbers = await barberRepo.listActive();
  if (activeBarbers.length === 0) {
    return { date, barber_id: null, service_id: serviceId, slots: [] };
  }

  const perBarber = await Promise.all(
    activeBarbers.map((b) =>
      getSlotsForBarber({ barberId: b.id, serviceId, date }).catch(() => ({ slots: [] }))
    )
  );

  // Merge by time — available iff any barber's slot is available
  const map = new Map();
  for (const result of perBarber) {
    for (const slot of result.slots) {
      const cur = map.get(slot.time);
      if (!cur) {
        map.set(slot.time, { ...slot });
      } else if (slot.available && !cur.available) {
        map.set(slot.time, { ...slot });
      }
    }
  }

  const slots = Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
  return { date, barber_id: null, service_id: serviceId, slots };
}

module.exports = {
  getSlotsForBarber,
  getSlotsAnyBarber,
};

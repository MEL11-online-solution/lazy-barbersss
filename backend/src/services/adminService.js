/**
 * adminService — aggregated stats for the admin dashboard.
 *
 * Drizzle's `timestamp` column type expects JS Date objects when used
 * inside operators like gte/lte/eq. Passing pre-formatted MySQL strings
 * triggers `value.toISOString is not a function` because Drizzle calls
 * .toISOString() on whatever you give it.
 *
 * Rule of thumb in this file:
 *   - Build ranges as Date objects → pass to gte/lte directly.
 *   - Convert to MySQL-format strings ONLY when calling paymentRepo,
 *     because paymentRepo.aggregateSince accepts a string lower bound.
 */
const { sql, and, eq, gte, lte, inArray } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const userRepo = require('../repositories/userRepo');
const paymentRepo = require('../repositories/paymentRepo');
const { isoToMysql } = require('../utils/time');

const { bookings, barbers } = schema;

/** Today at 00:00:00 UTC, as a Date. */
function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** End of today (23:59:59.999) UTC, as a Date. */
function endOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/** N days ago at 00:00:00 UTC, as a Date. */
function startOfDaysAgoUtc(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

/** First day of current month at 00:00:00 UTC, as a Date. */
function startOfMonthUtc() {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function dashboardStats() {
  // Date objects for Drizzle (gte/lte on timestamp columns)
  const todayStart = startOfTodayUtc();
  const todayEnd = endOfTodayUtc();
  const yesterdayStart = startOfDaysAgoUtc(1);
  const weekAgoStart = startOfDaysAgoUtc(7);
  const monthStart = startOfMonthUtc();

  // MySQL-format strings for paymentRepo.aggregateSince
  const weekAgoMy = isoToMysql(weekAgoStart.toISOString());
  const monthStartMy = isoToMysql(monthStart.toISOString());

  // Bookings today (any status except cancelled)
  const [{ n: bookingsToday }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(bookings)
    .where(
      and(
        gte(bookings.startAt, todayStart),
        lte(bookings.startAt, todayEnd),
        inArray(bookings.status, ['pending', 'confirmed', 'completed', 'no_show'])
      )
    );

  // Bookings yesterday for comparison delta
  const [{ n: bookingsYesterday }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(bookings)
    .where(
      and(
        gte(bookings.startAt, yesterdayStart),
        lte(bookings.startAt, todayStart),
        inArray(bookings.status, ['pending', 'confirmed', 'completed', 'no_show'])
      )
    );

  // Revenue (paymentRepo expects MySQL-string lower bound)
  const weekly = await paymentRepo.aggregateSince(weekAgoMy);
  const monthly = await paymentRepo.aggregateSince(monthStartMy);

  // Customer / barber counts
  const totalCustomers = await userRepo.countByRole('customer');
  const totalBarbers = await userRepo.countByRole('barber');

  const [{ n: activeBarbers }] = await db
    .select({ n: sql`COUNT(*)`.as('n') })
    .from(barbers)
    .where(eq(barbers.status, 'active'));

  return {
    bookings_today: Number(bookingsToday),
    bookings_yesterday_delta: Number(bookingsToday) - Number(bookingsYesterday),
    weekly_revenue: weekly.total,
    weekly_revenue_cents: weekly.total_cents,
    monthly_revenue: monthly.total,
    monthly_revenue_cents: monthly.total_cents,
    total_customers: totalCustomers,
    total_barbers: totalBarbers,
    active_barbers: Number(activeBarbers),
  };
}

module.exports = { dashboardStats };
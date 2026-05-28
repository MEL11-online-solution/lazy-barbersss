/**
 * Booking reminder job — runs every 5 minutes.
 *
 * Finds confirmed bookings starting within the next 65 minutes that have
 * not yet received a reminder notification, then sends a reminder email
 * and logs a simulated SMS to the console.
 *
 * Dedup strategy: before sending, check the notifications table for any
 * email notification with this booking_id whose subject starts with
 * "Appointment Reminder". This survives server restarts.
 */

const { eq, and, gte, lte, like } = require('drizzle-orm');
const { sql } = require('drizzle-orm');
const { db, schema } = require('../config/db');
const emailService = require('../services/email');
const notificationRepo = require('../repositories/notificationRepo');

const { bookings, services, barbers, users, notifications } = schema;
const customers = users;

const REMINDER_SUBJECT = 'Appointment Reminder — Lazy Barbers';
const BUSINESS_ADDRESS = process.env.BUSINESS_ADDRESS || '15 Good St, Granville NSW';
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function runReminderJob() {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 65 * 60 * 1000);

    // Hydrated bookings in the reminder window
    const upcoming = await db
      .select({
        id: bookings.id,
        reference: bookings.reference,
        startAt: bookings.startAt,
        customerId: bookings.customerId,
        customer_first_name: customers.firstName,
        customer_last_name: customers.lastName,
        customer_email: customers.email,
        customer_phone: customers.phone,
        service_name: services.name,
        barber_first_name: sql`barber_user.first_name`.as('barber_first_name'),
      })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(barbers, eq(barbers.id, bookings.barberId))
      .innerJoin(sql`users AS barber_user`, sql`barber_user.id = ${barbers.userId}`)
      .innerJoin(customers, eq(customers.id, bookings.customerId))
      .where(
        and(
          eq(bookings.status, 'confirmed'),
          gte(bookings.startAt, now),
          lte(bookings.startAt, cutoff)
        )
      );

    for (const booking of upcoming) {
      try {
        // Dedup: skip if reminder already logged for this booking
        const [existing] = await db
          .select({ id: notifications.id })
          .from(notifications)
          .where(
            and(
              eq(notifications.bookingId, booking.id),
              eq(notifications.channel, 'email'),
              like(notifications.subject, 'Appointment Reminder%')
            )
          )
          .limit(1);

        if (existing) continue;

        const customerName = [booking.customer_first_name, booking.customer_last_name]
          .filter(Boolean).join(' ') || 'Valued Customer';

        // Fire-and-forget email
        emailService.sendBookingReminder({
          to: booking.customer_email,
          customerName,
          serviceName: booking.service_name,
          barberName: booking.barber_first_name,
          dateTime: booking.startAt,
          location: BUSINESS_ADDRESS,
        }).catch(() => {});

        // Simulated SMS to console
        console.log(
          `[SMS REMINDER] → ${booking.customer_phone || 'no-phone'} | ` +
          `Booking #${booking.reference} | ${booking.service_name} in ~1 hr`
        );

        // Log to notifications so we don't send again
        await notificationRepo.log({
          user_id: booking.customerId,
          booking_id: booking.id,
          channel: 'email',
          recipient: booking.customer_email,
          subject: REMINDER_SUBJECT,
          body: `Appointment reminder for ${customerName} — ${booking.service_name}`,
          provider: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'console',
          status: 'sent',
        });
      } catch (err) {
        console.error(`[Reminder Job] Failed for booking #${booking.reference}:`, err.message);
        // Continue to next booking
      }
    }
  } catch (err) {
    console.error('[Reminder Job] Query failed:', err.message);
  }
}

function startReminderJob() {
  console.log('[Reminder Job] Started — checking every 5 minutes for upcoming appointments');
  runReminderJob(); // immediate first run
  return setInterval(runReminderJob, INTERVAL_MS);
}

module.exports = { startReminderJob };

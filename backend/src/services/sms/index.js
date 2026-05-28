/**
 * smsService — the public API used by the rest of the backend.
 *
 * Responsibilities:
 *   1. Pick a provider based on SMS_PROVIDER env var.
 *   2. Hold the message templates (booking confirmed, cancelled, rescheduled, reminder).
 *   3. Always log every send to the `notifications` table so the admin
 *      audit log stays intact regardless of which provider is used.
 *
 * Swapping to Twilio later is a .env change only:  SMS_PROVIDER=twilio
 */
const ConsoleSmsProvider = require('./ConsoleSmsProvider');
const TwilioSmsProvider = require('./TwilioSmsProvider');
const notificationRepo = require('../../repositories/notificationRepo');

require('dotenv').config();

let _provider = null;
function provider() {
  if (_provider) return _provider;
  const name = (process.env.SMS_PROVIDER || 'console').toLowerCase();
  if (name === 'twilio') {
    _provider = new TwilioSmsProvider();
  } else {
    _provider = new ConsoleSmsProvider();
  }
  return _provider;
}

// -----------------------------------------------------------------
// Templates
// -----------------------------------------------------------------

const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Lazy Barbers';
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || '+61 416 065 592';
const BUSINESS_ADDRESS = process.env.BUSINESS_ADDRESS || '15 Good St, Granville NSW';

/**
 * Format an ISO datetime as a human-readable local string for SMS.
 * Example: "Thu 9 Apr 2026 at 10:30 AM"
 */
function formatWhen(isoStartAt) {
  const d = new Date(isoStartAt);
  const weekday = d.toLocaleDateString('en-AU', { weekday: 'short', timeZone: 'UTC' });
  const dayMonth = d.toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
  const time = d.toLocaleTimeString('en-AU', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  });
  return `${weekday} ${dayMonth} at ${time}`;
}

function bookingConfirmationBody({ booking, service, barber }) {
  return (
`${BUSINESS_NAME}: Your booking is confirmed! ✂️
Ref: ${booking.reference}
${formatWhen(booking.start_at)}
Service: ${service.name}
Barber: ${barber.first_name}
${BUSINESS_ADDRESS}
Reply CANCEL to cancel. Questions? Call ${BUSINESS_PHONE}`
  );
}

function bookingCancelledBody({ booking, service }) {
  return (
`${BUSINESS_NAME}: Your booking ${booking.reference} (${service.name}) on ${formatWhen(booking.start_at)} has been cancelled. We hope to see you again soon!`
  );
}

function bookingRescheduledBody({ booking, service, barber, previousStartAt }) {
  return (
`${BUSINESS_NAME}: Your booking ${booking.reference} has been rescheduled.
Service: ${service.name}
Barber: ${barber.first_name}
Previously: ${formatWhen(previousStartAt)}
New: ${formatWhen(booking.start_at)}
${BUSINESS_ADDRESS}`
  );
}

// -----------------------------------------------------------------
// Core send (private)
// -----------------------------------------------------------------

async function _send({ to, body, userId = null, bookingId = null, subject = null }) {
  if (!to) {
    // Log as failed but don't throw — SMS is non-critical
    notificationRepo.log({
      user_id: userId,
      booking_id: bookingId,
      channel: 'sms',
      recipient: '(missing)',
      subject,
      body,
      provider: (process.env.SMS_PROVIDER || 'console').toLowerCase(),
      status: 'failed',
      error: 'No recipient phone number',
    });
    return { status: 'failed', error: 'No recipient phone number' };
  }

  let result;
  try {
    result = await provider().send(to, body, { booking_ref: null });
  } catch (err) {
    result = { status: 'failed', error: err.message };
  }

  notificationRepo.log({
    user_id: userId,
    booking_id: bookingId,
    channel: 'sms',
    recipient: to,
    subject,
    body,
    provider: result.provider || (process.env.SMS_PROVIDER || 'console').toLowerCase(),
    status: result.status === 'sent' ? 'sent' : 'failed',
    error: result.error || null,
  });

  return result;
}

// -----------------------------------------------------------------
// Public API (used by bookingService / controllers)
// -----------------------------------------------------------------

/**
 * Send booking confirmation SMS. Returns the body so the controller can
 * also include it in the HTTP response for the confirmation screen.
 */
async function sendBookingConfirmation({ to, customerId, booking, service, barber }) {
  const body = bookingConfirmationBody({ booking, service, barber });
  await _send({
    to,
    body,
    userId: customerId,
    bookingId: booking.id,
    subject: 'Booking confirmed',
  });
  return body;
}

async function sendBookingCancelled({ to, customerId, booking, service }) {
  const body = bookingCancelledBody({ booking, service });
  await _send({
    to,
    body,
    userId: customerId,
    bookingId: booking.id,
    subject: 'Booking cancelled',
  });
  return body;
}

async function sendBookingRescheduled({ to, customerId, booking, service, barber, previousStartAt }) {
  const body = bookingRescheduledBody({ booking, service, barber, previousStartAt });
  await _send({
    to,
    body,
    userId: customerId,
    bookingId: booking.id,
    subject: 'Booking rescheduled',
  });
  return body;
}

/**
 * Generic send — used by chatbot, custom admin messages, etc.
 */
async function send({ to, body, userId = null, bookingId = null, subject = null }) {
  return _send({ to, body, userId, bookingId, subject });
}

module.exports = {
  sendBookingConfirmation,
  sendBookingCancelled,
  sendBookingRescheduled,
  send,
  // Exposed for testing
  _bookingConfirmationBody: bookingConfirmationBody,
  _formatWhen: formatWhen,
};

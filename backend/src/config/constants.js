/**
 * Central business rules. Tweak here — nowhere else.
 */
module.exports = {
  // Slot length in minutes
  SLOT_MINUTES: 30,

  // Business hours (24h). Applied Mon–Sun by default but a barber's own
  // schedule (barber_schedules) overrides this.
  BUSINESS_HOURS: {
    0: { start: '09:00', end: '19:00' }, // Sun
    1: { start: '09:00', end: '19:00' }, // Mon
    2: { start: '09:00', end: '19:00' }, // Tue
    3: { start: '09:00', end: '19:00' }, // Wed
    4: { start: '09:00', end: '19:00' }, // Thu
    5: { start: '09:00', end: '19:00' }, // Fri
    6: { start: '09:00', end: '19:00' }, // Sat
  },

  // How far in advance bookings are allowed
  MIN_ADVANCE_MINUTES: 60, // at least 1 hour ahead
  MAX_ADVANCE_DAYS: 30,

  // Cancellation cutoff — 2 hours before the appointment
  CANCEL_CUTOFF_MINUTES: 120,

  // Reschedule uses the same cutoff
  RESCHEDULE_CUTOFF_MINUTES: 120,

  // Verification code
  VERIFICATION_CODE_LENGTH: 6,
  EMAIL_VERIFY_TTL_MINUTES: 1440,   // 24 hours — comfortable window for email verification
  PASSWORD_RESET_TTL_MINUTES: 10,   // 10 minutes — tight window for password reset
  // Legacy alias kept for any direct imports still referencing it
  VERIFICATION_CODE_TTL_MINUTES: 10,

  // Booking reference format: LB-YYYY-XXXX (zero-padded sequence)
  BOOKING_REF_PREFIX: 'LB',

  // Password rules
  PASSWORD_MIN_LENGTH: 8,
};

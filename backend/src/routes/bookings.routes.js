const express = require('express');
const { z } = require('zod');
const Stripe = require('stripe');
const bookingService = require('../services/bookingService');
const bookingRepo = require('../repositories/bookingRepo');
const barberRepo = require('../repositories/barberRepo');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { ok, created } = require('../utils/response');

const router = express.Router();

const idParam = z.object({ id: z.coerce.number().int().positive() });

const createSchema = z.object({
  service_id: z.number().int().positive(),
  barber_id: z.number().int().positive().nullable().optional(),
  start_at: z.string().min(20), // ISO-8601; deeper check happens in service
  payment_method: z.enum(['online', 'counter']).default('counter'),
  notes: z.string().trim().max(2000).optional().nullable(),
  payment_intent_id: z.string().optional().nullable(),
  card_last4: z.string().max(4).optional().nullable(),
});

const rescheduleSchema = z.object({
  new_start_at: z.string().min(20),
});

const statusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'no_show']),
});

// Customer or admin: create booking
router.post(
  '/',
  requireAuth,
  requireRole('customer', 'admin'),
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const result = await bookingService.createBooking({
      customer: req.user,
      service_id: req.body.service_id,
      barber_id: req.body.barber_id ?? null,
      start_at: req.body.start_at,
      payment_method: req.body.payment_method,
      notes: req.body.notes,
      payment_intent_id: req.body.payment_intent_id ?? null,
      card_last4: req.body.card_last4 ?? null,
    });
    return created(res, {
      booking: result.booking,
      sms_body: result.sms_body, // Frontend uses this on the confirmation screen
    });
  })
);

// Customer: list my bookings
router.get(
  '/me',
  requireAuth,
  requireRole('customer'),
  asyncHandler(async (req, res) => {
    const list = await bookingRepo.listForCustomer(req.user.id);
    return ok(res, list);
  })
);

// Create a Stripe PaymentIntent.
// Called BEFORE the booking is created (payment-first flow), so `reference`
// is optional — it is included as metadata only when already known.
router.post(
  '/create-payment-intent',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { amount_cents, reference } = req.body;
    if (!amount_cents) {
      throw new HttpError(400, 'INVALID_PARAMS', 'amount_cents is required');
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: 'aud',
      ...(reference ? { metadata: { reference } } : {}),
    });
    return ok(res, { clientSecret: paymentIntent.client_secret });
  })
);

// Get a single booking. Permission: owner, assigned barber, or admin.
router.get(
  '/:id',
  requireAuth,
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking) throw new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');

    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      throw new HttpError(403, 'FORBIDDEN', 'Cannot view another customer\'s booking');
    }
    if (req.user.role === 'barber') {
      const me = await barberRepo.findByUserId(req.user.id);
      if (!me || me.id !== booking.barber_id) {
        throw new HttpError(403, 'FORBIDDEN', 'Not assigned to this booking');
      }
    }
    return ok(res, booking);
  })
);

// Cancel booking
router.patch(
  '/:id/cancel',
  requireAuth,
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const updated = await bookingService.cancelBooking({
      bookingId: req.params.id,
      actor: req.user,
      reason: typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 500) || null : null,
    });
    return ok(res, updated);
  })
);

// Reschedule booking
router.patch(
  '/:id/reschedule',
  requireAuth,
  validate({ params: idParam, body: rescheduleSchema }),
  asyncHandler(async (req, res) => {
    const updated = await bookingService.rescheduleBooking({
      bookingId: req.params.id,
      new_start_at: req.body.new_start_at,
      actor: req.user,
    });
    return ok(res, updated);
  })
);

// Update status (barber/admin only)
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('barber', 'admin'),
  validate({ params: idParam, body: statusSchema }),
  asyncHandler(async (req, res) => {
    const updated = await bookingService.updateStatus({
      bookingId: req.params.id,
      status: req.body.status,
      actor: req.user,
    });
    return ok(res, updated);
  })
);

// Receipt-ready data
router.get(
  '/:id/receipt',
  requireAuth,
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const data = await bookingService.getReceiptData(req.params.id, req.user);
    return ok(res, data);
  })
);

module.exports = router;

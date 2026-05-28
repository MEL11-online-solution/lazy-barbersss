const express = require('express');
const { z } = require('zod');
const reviewRepo = require('../repositories/reviewRepo');
const bookingRepo = require('../repositories/bookingRepo');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { ok, created } = require('../utils/response');

const router = express.Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(12),
});

const createSchema = z.object({
  booking_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(2000),
});

// Public: list published reviews + summary
router.get(
  '/',
  validate({ query: listQuerySchema }),
  asyncHandler(async (req, res) => {
    const { page, page_size } = req.query;
    const list = await reviewRepo.listPublished({ page, pageSize: page_size });
    const summary = await reviewRepo.summary();
    return ok(res, list.rows, {
      page: list.page,
      page_size: list.pageSize,
      total: list.total,
      summary,
    });
  })
);

// Customer: leave a review for a completed booking
router.post(
  '/',
  requireAuth,
  requireRole('customer'),
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const { booking_id, rating, comment } = req.body;

    // Must have at least one completed booking
    const hasCompleted = await bookingRepo.hasCompletedForCustomer(req.user.id);
    if (!hasCompleted) {
      throw new HttpError(403, 'NO_COMPLETED_BOOKINGS', 'You can only review after completing a booking');
    }

    const booking = await bookingRepo.findById(booking_id);
    if (!booking) throw new HttpError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
    if (booking.customer_id !== req.user.id) {
      throw new HttpError(403, 'FORBIDDEN', 'You did not make this booking');
    }
    if (booking.status !== 'completed') {
      throw new HttpError(400, 'NOT_COMPLETED', "This booking hasn't been completed yet");
    }
    const already = await reviewRepo.existsForBooking(req.user.id, booking_id);
    if (already) {
      throw new HttpError(409, 'ALREADY_REVIEWED', "You've already reviewed this booking");
    }

    const customerName = `${req.user.firstName} ${req.user.lastName.charAt(0)}.`;
    const id = await reviewRepo.insert({
      customer_id: req.user.id,
      booking_id,
      customer_name: customerName,
      rating,
      comment,
      service_name: booking.service_name,
    });
    return created(res, await reviewRepo.findById(id));
  })
);

module.exports = router;

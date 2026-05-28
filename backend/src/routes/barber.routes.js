/**
 * Barber portal — endpoints scoped to the authenticated barber.
 * All resolve `req.user` → the barber row by user_id.
 */
const express = require('express');
const { z } = require('zod');
const barberRepo = require('../repositories/barberRepo');
const bookingRepo = require('../repositories/bookingRepo');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { ok, created } = require('../utils/response');
const { isValidDateStr } = require('../utils/time');

const router = express.Router();

async function resolveMyBarber(req) {
  const me = await barberRepo.findByUserId(req.user.id);
  if (!me) throw new HttpError(404, 'BARBER_PROFILE_MISSING', 'No barber profile linked to this account');
  return me;
}

// GET /api/v1/barber/me  → my barber profile
router.get(
  '/me',
  requireAuth,
  requireRole('barber'),
  asyncHandler(async (req, res) => ok(res, await resolveMyBarber(req)))
);

// GET /api/v1/barber/me/schedule
router.get(
  '/me/schedule',
  requireAuth,
  requireRole('barber'),
  asyncHandler(async (req, res) => {
    const me = await resolveMyBarber(req);
    return ok(res, await barberRepo.getSchedule(me.id));
  })
);

// GET /api/v1/barber/me/appointments?status=scheduled|completed
const apptsQuerySchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
});
router.get(
  '/me/appointments',
  requireAuth,
  requireRole('barber'),
  validate({ query: apptsQuerySchema }),
  asyncHandler(async (req, res) => {
    const me = await resolveMyBarber(req);
    const list = await bookingRepo.listForBarber(me.id, { status: req.query.status });
    return ok(res, list);
  })
);

// GET /api/v1/barber/me/appointments/today
router.get(
  '/me/appointments/today',
  requireAuth,
  requireRole('barber'),
  asyncHandler(async (req, res) => {
    const me = await resolveMyBarber(req);
    const today = new Date().toISOString().slice(0, 10);
    return ok(res, await bookingRepo.listForBarberOnDate(me.id, today));
  })
);

// GET /api/v1/barber/me/time-off
router.get(
  '/me/time-off',
  requireAuth,
  requireRole('barber'),
  asyncHandler(async (req, res) => {
    const me = await resolveMyBarber(req);
    return ok(res, await barberRepo.listTimeOff(me.id));
  })
);

// POST /api/v1/barber/me/time-off
const timeOffBodySchema = z
  .object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    reason: z.string().trim().max(500).optional().nullable(),
  })
  .refine((d) => d.start_date <= d.end_date, {
    message: 'end_date must be on or after start_date',
    path: ['end_date'],
  });

router.post(
  '/me/time-off',
  requireAuth,
  requireRole('barber'),
  validate({ body: timeOffBodySchema }),
  asyncHandler(async (req, res) => {
    if (!isValidDateStr(req.body.start_date) || !isValidDateStr(req.body.end_date)) {
      throw new HttpError(400, 'INVALID_DATE', 'Invalid date');
    }
    const me = await resolveMyBarber(req);
    const id = await barberRepo.insertTimeOff({
      barber_id: me.id,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      reason: req.body.reason,
    });
    const row = await barberRepo.findTimeOffById(id);
    return created(res, row);
  })
);

module.exports = router;

const express = require('express');
const { z } = require('zod');
const availabilityService = require('../services/availabilityService');
const validate = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const realtimeAvailability = require('../services/realtimeAvailabilityService');
const { ok } = require('../utils/response');

const router = express.Router();

const querySchema = z.object({
  service_id: z.coerce.number().int().positive(),
  barber_id: z.coerce.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, 'Date must be YYYY-MM-DD'),
});

/**
 * GET /availability?service_id=X&date=YYYY-MM-DD&barber_id=Y
 *   - With barber_id → slot grid for that barber.
 *   - Without barber_id → "any available barber" aggregated grid.
 */
router.get(
  '/',
  validate({ query: querySchema }),
  asyncHandler(async (req, res) => {
    const { service_id, barber_id, date } = req.query;
    const result = barber_id
      ? await availabilityService.getSlotsForBarber({ barberId: barber_id, serviceId: service_id, date })
      : await availabilityService.getSlotsAnyBarber({ serviceId: service_id, date });
    return ok(res, result);
  })
);
/**
 * GET /api/v1/availability/now
 * Public — returns barbers available at this exact moment.
 */
router.get(
  '/now',
  asyncHandler(async (_req, res) => {
    const result = await realtimeAvailability.whoIsAvailableNow();
    return ok(res, result);
  })
);
module.exports = router;

const express = require('express');
const { z } = require('zod');
const barberRepo = require('../repositories/barberRepo');
const barberService = require('../services/barberService');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { ok, created } = require('../utils/response');
const { PASSWORD_MIN_LENGTH } = require('../config/constants');

const router = express.Router();

const idParam = z.object({ id: z.coerce.number().int().positive() });

const createBarberSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u).optional().or(z.literal('')),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  specialty: z.string().trim().max(120).optional().nullable(),
  bio: z.string().trim().max(2000).optional().nullable(),
  avatar_url: z.string().trim().url().optional().nullable().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['active', 'on_leave', 'inactive']).optional(),
});

const updateBarberSchema = z.object({
  first_name: z.string().trim().min(1).max(80).optional(),
  last_name: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u).optional().or(z.literal('')),
  specialty: z.string().trim().max(120).optional().nullable(),
  bio: z.string().trim().max(2000).optional().nullable(),
  avatar_url: z.string().trim().url().optional().nullable().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['active', 'on_leave', 'inactive']).optional(),
});

const scheduleEntrySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/u, 'Time must be HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/u, 'Time must be HH:MM'),
  is_working: z.boolean(),
});
const scheduleBodySchema = z.object({
  schedule: z.array(scheduleEntrySchema).length(7),
});

// Public: list active barbers
router.get(
  '/',
  asyncHandler(async (req, res) => ok(res, await barberRepo.listActive()))
);

// Public: get a single barber
router.get(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const b = await barberRepo.findById(req.params.id);
    if (!b) throw new HttpError(404, 'BARBER_NOT_FOUND', 'Barber not found');
    return ok(res, b);
  })
);

// Public: get a barber's schedule
router.get(
  '/:id/schedule',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const b = await barberRepo.findById(req.params.id);
    if (!b) throw new HttpError(404, 'BARBER_NOT_FOUND', 'Barber not found');
    return ok(res, await barberRepo.getSchedule(req.params.id));
  })
);

// Admin: list all barbers
router.get(
  '/admin/all',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => ok(res, await barberRepo.listAll()))
);

// Admin: create barber
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validate({ body: createBarberSchema }),
  asyncHandler(async (req, res) => {
    const b = await barberService.createBarber(req.body);
    return created(res, b);
  })
);

// Admin or self: update barber
router.patch(
  '/:id',
  requireAuth,
  requireRole('admin', 'barber'),
  validate({ params: idParam, body: updateBarberSchema }),
  asyncHandler(async (req, res) => {
    const b = await barberService.updateBarber(req.params.id, req.body, req.user);
    return ok(res, b);
  })
);

// Admin: delete (soft — set inactive)
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    await barberService.setStatus(req.params.id, 'inactive');
    return ok(res, { message: 'Barber deactivated' });
  })
);

// Admin or self: replace weekly schedule
router.patch(
  '/:id/schedule',
  requireAuth,
  requireRole('admin', 'barber'),
  validate({ params: idParam, body: scheduleBodySchema }),
  asyncHandler(async (req, res) => {
    // Permission check
    if (req.user.role !== 'admin') {
      const me = await barberRepo.findByUserId(req.user.id);
      if (!me || me.id !== req.params.id) {
        throw new HttpError(403, 'FORBIDDEN', 'Cannot edit another barber\'s schedule');
      }
    }
    const updated = await barberService.replaceSchedule(req.params.id, req.body.schedule);
    return ok(res, updated);
  })
);

module.exports = router;

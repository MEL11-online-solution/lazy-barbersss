const express = require('express');
const { z } = require('zod');
const userRepo = require('../repositories/userRepo');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok } = require('../utils/response');

const router = express.Router();

const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u).optional().or(z.literal('')),
});

router.get(
  '/me',
  requireAuth,
  requireRole('customer', 'admin', 'barber'),
  asyncHandler(async (req, res) => ok(res, userRepo.toPublic(req.user)))
);

router.patch(
  '/me',
  requireAuth,
  requireRole('customer', 'admin', 'barber'),
  validate({ body: updateProfileSchema }),
  asyncHandler(async (req, res) => {
    await userRepo.updateProfile({
      id: req.user.id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone: req.body.phone || null,
    });
    const fresh = await userRepo.findById(req.user.id);
    return ok(res, userRepo.toPublic(fresh));
  })
);

module.exports = router;

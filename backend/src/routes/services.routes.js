const express = require('express');
const { z } = require('zod');
const serviceRepo = require('../repositories/serviceRepo');
const auditRepo = require('../repositories/auditRepo');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { ok, created } = require('../utils/response');

const router = express.Router();

const serviceBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.string().trim().max(80).optional().nullable(),
  price_cents: z.number().int().min(0),
  duration_minutes: z.number().int().min(5).max(8 * 60),
  is_active: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
});

const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

// Public: list active services
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const list = await serviceRepo.listActive();
    return ok(res, list);
  })
);

// Public: single service
router.get(
  '/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const svc = await serviceRepo.findById(req.params.id);
    if (!svc) throw new HttpError(404, 'SERVICE_NOT_FOUND', 'Service not found');
    return ok(res, svc);
  })
);

// Admin: list all (incl inactive)
router.get(
  '/admin/all',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => ok(res, await serviceRepo.listAll()))
);

// Admin: create
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validate({ body: serviceBodySchema }),
  asyncHandler(async (req, res) => {
    const id = await serviceRepo.insert(req.body);
    const svc = await serviceRepo.findById(id);
    auditRepo.log({ userId: req.user.id, action: 'service.created', entityType: 'service', entityId: id, details: { name: req.body.name } });
    return created(res, svc);
  })
);

// Admin: update
router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate({ params: idParam, body: serviceBodySchema.partial() }),
  asyncHandler(async (req, res) => {
    const existing = await serviceRepo.findRawById(req.params.id);
    if (!existing) throw new HttpError(404, 'SERVICE_NOT_FOUND', 'Service not found');

    const merged = {
      name: req.body.name ?? existing.name,
      description: req.body.description ?? existing.description,
      category: req.body.category ?? existing.category,
      price_cents: req.body.price_cents ?? existing.priceCents,
      duration_minutes: req.body.duration_minutes ?? existing.durationMinutes,
      is_active: req.body.is_active ?? !!existing.isActive,
      display_order: req.body.display_order ?? existing.displayOrder,
    };

    await serviceRepo.update(req.params.id, merged);
    auditRepo.log({ userId: req.user.id, action: 'service.updated', entityType: 'service', entityId: req.params.id, details: { name: merged.name } });
    return ok(res, await serviceRepo.findById(req.params.id));
  })
);

// Admin: soft delete
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const existing = await serviceRepo.findRawById(req.params.id);
    if (!existing) throw new HttpError(404, 'SERVICE_NOT_FOUND', 'Service not found');
    await serviceRepo.softDelete(req.params.id);
    auditRepo.log({ userId: req.user.id, action: 'service.deleted', entityType: 'service', entityId: req.params.id, details: { name: existing.name } });
    return ok(res, { message: 'Service deactivated' });
  })
);

module.exports = router;

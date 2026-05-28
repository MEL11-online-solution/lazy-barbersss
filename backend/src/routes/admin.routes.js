const express = require('express');
const { z } = require('zod');
const adminService = require('../services/adminService');
const userRepo = require('../repositories/userRepo');
const barberRepo = require('../repositories/barberRepo');
const bookingRepo = require('../repositories/bookingRepo');
const paymentRepo = require('../repositories/paymentRepo');
const contactRepo = require('../repositories/contactRepo');
const notificationRepo = require('../repositories/notificationRepo');
const auditRepo = require('../repositories/auditRepo');
const clubRepo = require('../repositories/clubRepo');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { ok } = require('../utils/response');
const { isoToMysql } = require('../utils/time');

const router = express.Router();

// All admin routes require authenticated admin.
router.use(requireAuth, requireRole('admin'));

const idParam = z.object({ id: z.coerce.number().int().positive() });

// ---------- Dashboard ----------
router.get(
  '/dashboard/stats',
  asyncHandler(async (req, res) => ok(res, await adminService.dashboardStats()))
);

// ---------- Bookings (filterable) ----------
const bookingsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).optional(),
  status: z
    .enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .optional(),
  barber_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});
router.get(
  '/bookings',
  validate({ query: bookingsQuerySchema }),
  asyncHandler(async (req, res) => {
    const { date, status, barber_id, page, page_size } = req.query;
    const result = await bookingRepo.listFiltered({
      date,
      status,
      barberId: barber_id,
      page,
      pageSize: page_size,
    });
    return ok(res, result.rows, {
      page: result.page,
      page_size: result.pageSize,
      total: result.total,
    });
  })
);

// ---------- Recent bookings (notification bell) ----------
const recentBookingsQuerySchema = z.object({
  since: z.string().trim().optional(),
});
router.get(
  '/recent-bookings',
  validate({ query: recentBookingsQuerySchema }),
  asyncHandler(async (req, res) => {
    const sinceIso = req.query.since && !Number.isNaN(Date.parse(req.query.since))
      ? new Date(req.query.since).toISOString()
      : null;
    const rows = await bookingRepo.listRecentCreated({ sinceIso, limit: 10 });
    return ok(res, rows);
  })
);

// ---------- Today's schedule (all barbers) ----------
const scheduleQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).optional(),
});
router.get(
  '/schedule',
  validate({ query: scheduleQuerySchema }),
  asyncHandler(async (req, res) => {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const barbers = await barberRepo.listAll();
    const out = [];
    for (const b of barbers) {
      out.push({
        barber: b,
        bookings: await bookingRepo.listForBarberOnDate(b.id, date),
      });
    }
    return ok(res, { date, schedule: out });
  })
);

// ---------- Customers ----------
const customersQuerySchema = z.object({
  q: z.string().trim().optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(10),
});
router.get(
  '/customers',
  validate({ query: customersQuerySchema }),
  asyncHandler(async (req, res) => {
    const { q, page, page_size } = req.query;
    const result = await userRepo.searchCustomers({ q, page, pageSize: page_size });
    return ok(res, result.rows, {
      page: result.page,
      page_size: result.pageSize,
      total: result.total,
    });
  })
);

router.get(
  '/customers/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const user = await userRepo.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      throw new HttpError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    const bookings = await bookingRepo.listForCustomer(user.id);
    return ok(res, {
      customer: userRepo.toPublic(user),
      bookings,
    });
  })
);

// ---------- Revenue ----------
const revenuePeriodSchema = z.object({
  period: z.enum(['week', 'month', 'all']).default('month'),
});

function periodToSinceMysql(period) {
  if (period === 'all') return null;
  const d = new Date();
  if (period === 'week') {
    d.setUTCDate(d.getUTCDate() - 7);
    d.setUTCHours(0, 0, 0, 0);
  } else {
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
  }
  return isoToMysql(d.toISOString());
}

router.get(
  '/revenue',
  validate({ query: revenuePeriodSchema }),
  asyncHandler(async (req, res) => {
    const since = periodToSinceMysql(req.query.period);
    const totals = await paymentRepo.aggregateSince(since);
    const byService = await paymentRepo.revenueByService(since);
    return ok(res, {
      period: req.query.period,
      totals,
      by_service: byService,
    });
  })
);

const revenueTxQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  method: z.enum(['online', 'counter']).optional(),
});
router.get(
  '/revenue/transactions',
  validate({ query: revenueTxQuerySchema }),
  asyncHandler(async (req, res) => {
    const result = await paymentRepo.listRecent({
      page: req.query.page,
      pageSize: req.query.page_size,
      method: req.query.method,
    });
    return ok(res, result.rows, {
      page: result.page,
      page_size: result.pageSize,
      total: result.total,
    });
  })
);
const chartQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

router.get(
  '/revenue/chart',
  validate({ query: chartQuerySchema }),
  asyncHandler(async (req, res) => {
    const series = await paymentRepo.dailySeries(req.query.days);
    return ok(res, series);
  })
);
// ---------- Time-off review ----------
router.get(
  '/time-off-requests',
  asyncHandler(async (req, res) => ok(res, await barberRepo.listPendingTimeOff()))
);

const timeOffReviewSchema = z.object({
  status: z.enum(['approved', 'denied']),
});
router.patch(
  '/time-off-requests/:id',
  validate({ params: idParam, body: timeOffReviewSchema }),
  asyncHandler(async (req, res) => {
    const existing = await barberRepo.findTimeOffById(req.params.id);
    if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Request not found');
    if (existing.status !== 'pending') {
      throw new HttpError(400, 'ALREADY_REVIEWED', 'Request already reviewed');
    }
    await barberRepo.reviewTimeOff(req.params.id, {
      status: req.body.status,
      reviewed_by: req.user.id,
    });
    return ok(res, await barberRepo.findTimeOffById(req.params.id));
  })
);

// ---------- Contact messages ----------
router.get(
  '/contact-messages',
  asyncHandler(async (req, res) => {
    const result = await contactRepo.list({ page: 1, pageSize: 100 });
    return ok(res, result.rows, {
      page: result.page,
      page_size: result.pageSize,
      total: result.total,
      unread_count: await contactRepo.countUnread(),
    });
  })
);

router.patch(
  '/contact-messages/:id/read',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const msg = await contactRepo.findById(req.params.id);
    if (!msg) throw new HttpError(404, 'NOT_FOUND', 'Message not found');
    await contactRepo.markRead(req.params.id);
    return ok(res, await contactRepo.findById(req.params.id));
  })
);

// ---------- Notifications log (SMS/email) ----------
const notifQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(50),
});
router.get(
  '/notifications',
  validate({ query: notifQuerySchema }),
  asyncHandler(async (req, res) => {
    const result = await notificationRepo.list({
      page: req.query.page,
      pageSize: req.query.page_size,
    });
    return ok(res, result.rows, {
      page: result.page,
      page_size: result.pageSize,
      total: result.total,
    });
  })
);

// ---------- Club members ----------
const clubMembersQuerySchema = z.object({
  q: z.string().trim().optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

router.get(
  '/club-members',
  validate({ query: clubMembersQuerySchema }),
  asyncHandler(async (req, res) => {
    const { q, page, page_size } = req.query;
    const result = await clubRepo.listAll({ q, page, pageSize: page_size });
    return ok(res, result.rows, {
      page: result.page,
      page_size: result.pageSize,
      total: result.total,
    });
  })
);

router.delete(
  '/club-members/:id',
  validate({ params: idParam }),
  asyncHandler(async (req, res) => {
    const member = await clubRepo.findById(req.params.id);
    if (!member) throw new HttpError(404, 'NOT_FOUND', 'Club member not found');
    await clubRepo.remove(req.params.id);
    return ok(res, { deleted: true });
  })
);

// ---------- Audit logs ----------
const auditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(50),
  action: z.string().trim().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  since: z.string().trim().optional(),
});

const auditExportSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  action: z.string().trim().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  since: z.string().trim().optional(),
});

router.get(
  '/audit-logs/export',
  validate({ query: auditExportSchema }),
  asyncHandler(async (req, res) => {
    const { format, action, user_id, since } = req.query;
    const rows = await auditRepo.exportAll({ action, userId: user_id, since });

    if (format === 'csv') {
      const header = 'id,user_id,action,entity_type,entity_id,details,created_at';
      const lines = rows.map((r) =>
        [
          r.id,
          r.userId ?? '',
          r.action,
          r.entityType ?? '',
          r.entityId ?? '',
          (r.details ?? '').replace(/,/g, ';'),
          r.createdAt,
        ].join(',')
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
      return res.send([header, ...lines].join('\n'));
    }

    return ok(res, rows);
  })
);

router.get(
  '/audit-logs',
  validate({ query: auditQuerySchema }),
  asyncHandler(async (req, res) => {
    const { page, page_size, action, user_id, since } = req.query;
    const result = await auditRepo.list({ page, pageSize: page_size, action, userId: user_id, since });
    return ok(res, result.rows, {
      page: result.page,
      page_size: result.pageSize,
      total: result.total,
    });
  })
);

module.exports = router;

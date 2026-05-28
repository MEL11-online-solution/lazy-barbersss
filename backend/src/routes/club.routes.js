const express = require('express');
const { z } = require('zod');
const clubRepo = require('../repositories/clubRepo');
const emailService = require('../services/email');
const validate = require('../middleware/validate');
const { asyncHandler, HttpError } = require('../middleware/errorHandler');
const { created, ok } = require('../utils/response');

const router = express.Router();

const joinSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  firstName: z.string().trim().max(80).optional().or(z.literal('')),
});

// In-memory IP rate limiter: max 5 requests per IP per hour
const _ipLog = new Map();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function checkIpRateLimit(ip) {
  const now = Date.now();
  const log = (_ipLog.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (log.length >= RATE_LIMIT) {
    throw new HttpError(429, 'RATE_LIMIT', 'Too many requests. Please try again later.');
  }
  log.push(now);
  _ipLog.set(ip, log);
}

router.post(
  '/join',
  validate({ body: joinSchema }),
  asyncHandler(async (req, res) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    checkIpRateLimit(ip);

    const { email, firstName } = req.body;

    const existing = await clubRepo.findByEmail(email);
    if (existing) {
      return ok(res, {
        already_member: true,
        message: "You're already a club member! Check your inbox for exclusive offers.",
      });
    }

    await clubRepo.insert({ email, firstName: firstName || null });

    // Fire-and-forget welcome email
    emailService.sendClubWelcome({ to: email, firstName: firstName || null }).catch(() => {});

    return created(res, {
      already_member: false,
      message: 'Welcome to the club! Check your email for your VIP benefits.',
    });
  })
);

module.exports = router;

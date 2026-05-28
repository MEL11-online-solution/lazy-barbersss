const express = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const chatbotService = require('../services/chatbotService');
const validate = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok } = require('../utils/response');

const router = express.Router();

const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      reply: "Slow down! You're sending messages too quickly. Please wait a moment and try again.",
      type: 'rate_limit',
    });
  },
});

const messageSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

router.post(
  '/message',
  chatRateLimit,
  validate({ body: messageSchema }),
  asyncHandler(async (req, res) => {
    const reply = await chatbotService.respond({ message: req.body.message });
    return ok(res, reply);
  })
);

module.exports = router;

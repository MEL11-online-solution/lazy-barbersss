const express = require('express');
const { z } = require('zod');
const contactRepo = require('../repositories/contactRepo');
const validate = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { created } = require('../utils/response');
const notificationRepo = require('../repositories/notificationRepo');

const router = express.Router();

const contactSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u).optional().or(z.literal('')),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(1).max(5000),
});

const ADMIN_INBOX = process.env.ADMIN_NOTIFY_EMAIL || 'adminlazybarbers@gmail.com';

router.post(
  '/',
  validate({ body: contactSchema }),
  asyncHandler(async (req, res) => {
    const id = await contactRepo.insert(req.body);
    const saved = await contactRepo.findById(id);

    // Simulate notifying the admin inbox via the email service. We log
    // it directly to notifications so it shows in the admin audit log.
    const body =
      `New contact message from ${saved.full_name} <${saved.email}>` +
      (saved.phone ? ` (${saved.phone})` : '') +
      `\n\nSubject: ${saved.subject || '(none)'}\n\n${saved.message}`;
    await notificationRepo.log({
      channel: 'email',
      recipient: ADMIN_INBOX,
      subject: `New contact: ${saved.subject || 'No subject'}`,
      body,
      provider: 'console',
      status: 'sent',
    });
    /* eslint-disable no-console */
    console.log(
      `\n══════════════════════════════════════════════════════════\n` +
        `📨 [SIMULATED CONTACT EMAIL] → ${ADMIN_INBOX}\n` +
        `══════════════════════════════════════════════════════════\n${body}\n` +
        `══════════════════════════════════════════════════════════\n`
    );
    /* eslint-enable no-console */

    return created(res, {
      message: 'Thanks — we\'ll be in touch shortly.',
      contact: saved,
    });
  })
);

module.exports = router;

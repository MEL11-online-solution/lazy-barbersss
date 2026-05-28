const sgMail = require('@sendgrid/mail');

const API_KEY    = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'lazybarbers.booking@gmail.com';
const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Lazy Barbers';
const FRONTEND   = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'adminlazybarbers@gmail.com';

const templates = require('./templates');

if (API_KEY) {
  sgMail.setApiKey(API_KEY);
  console.log('[Email] SendGrid configured with from:', FROM_EMAIL);
} else {
  console.warn('[Email] No SENDGRID_API_KEY — emails will be logged to console only');
}

const UNSUBSCRIBE_HEADER = `<mailto:${FROM_EMAIL}?subject=Unsubscribe>`;

async function sendEmail({ to, subject, html, text }) {
  if (!API_KEY) {
    console.log('[Email SIMULATED]', { to, subject });
    return;
  }
  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: 'Lazy Barbers Booking' },
      subject,
      html,
      text,
      headers: { 'List-Unsubscribe': UNSUBSCRIBE_HEADER },
    });
    console.log('[Email SENT]', { to, subject });
  } catch (err) {
    console.error('[Email FAILED]', err.response?.body?.errors || err.message);
  }
}

// ─── Booking emails ───────────────────────────────────────────────────────────

async function sendBookingConfirmation(data) {
  const t = templates.bookingConfirmation(data);
  await sendEmail({ to: data.to, subject: t.subject, html: t.html, text: t.text });
}

async function sendBookingCancellation(data) {
  const t = templates.bookingCancellation(data);
  await sendEmail({ to: data.to, subject: t.subject, html: t.html, text: t.text });
}

async function sendBookingRescheduled(data) {
  const t = templates.bookingRescheduled(data);
  await sendEmail({ to: data.to, subject: t.subject, html: t.html, text: t.text });
}

async function sendPaymentReceipt(data) {
  const t = templates.paymentReceipt(data);
  await sendEmail({ to: data.to, subject: t.subject, html: t.html, text: t.text });
}

async function sendBookingReminder(data) {
  const t = templates.bookingReminder(data);
  await sendEmail({ to: data.to, subject: t.subject, html: t.html, text: t.text });
}

async function sendClubWelcome(data) {
  const t = templates.clubWelcome(data);
  await sendEmail({ to: data.to, subject: t.subject, html: t.html, text: t.text });
}

// ─── Admin notifications ────────────────────────────────────────────────────────

async function sendAdminNewBooking(data) {
  const t = templates.adminNewBooking(data);
  await sendEmail({ to: ADMIN_NOTIFY_EMAIL, subject: t.subject, html: t.html, text: t.text });
}

async function sendAdminBookingCancelled(data) {
  const t = templates.adminBookingCancelled(data);
  await sendEmail({ to: ADMIN_NOTIFY_EMAIL, subject: t.subject, html: t.html, text: t.text });
}

// ─── Auth emails ──────────────────────────────────────────────────────────────

function emailWrap(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f0f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#0f0f2d;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;letter-spacing:6px;font-weight:700;color:#D4A843;font-family:Arial,Helvetica,sans-serif;">✂ LAZY BARBERS</p>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#D4A843 0%,#E91E63 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:40px 40px 32px;color:#1a1a1a;">
          ${body}
        </td></tr>
        <tr><td style="background:#0f0f2d;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:5px;color:#D4A843;font-weight:700;font-family:Arial,Helvetica,sans-serif;">LAZY BARBERS</p>
          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.55);font-family:Arial,Helvetica,sans-serif;">
            15 Good St, Granville NSW 2142 &nbsp;&bull;&nbsp; 62 Beamish St, Campsie NSW 2194
          </p>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);font-family:Arial,Helvetica,sans-serif;">+61 416 065 592</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendVerificationEmail({ to, firstName, code }) {
  const name = firstName || 'there';
  const html = emailWrap(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a1a;">Welcome to ${BUSINESS_NAME}!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
      Hi ${name}, thanks for signing up. Use the code below to verify your email address.
    </p>

    <p style="margin:0 0 12px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#D4A843;font-weight:700;">
      Your verification code
    </p>

    <div style="text-align:center;margin:8px 0 24px;">
      <div style="display:inline-block;background:#f8f8f8;border:2px solid #D4A843;border-radius:12px;padding:20px 40px;">
        <span style="font-size:40px;font-weight:700;letter-spacing:14px;color:#1a1a1a;font-family:monospace;">${code}</span>
      </div>
    </div>

    <p style="margin:0 0 8px;font-size:14px;color:#666666;line-height:1.6;">
      &#x23F0; This code expires in <strong>24 hours</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:13px;color:#999999;line-height:1.6;">
      If you didn't create an account with ${BUSINESS_NAME}, you can safely ignore this email.
    </p>

    <p style="margin:24px 0 0;text-align:center;">
      <a href="${FRONTEND}/verify-email"
         style="display:inline-block;background:#E91E63;color:#ffffff;text-decoration:none;
                padding:14px 36px;border-radius:6px;font-size:15px;font-weight:700;
                letter-spacing:0.3px;font-family:Arial,Helvetica,sans-serif;">
        Enter verification code &rarr;
      </a>
    </p>
  `);

  const text = `Your Verification Code - Lazy Barbers\n\nHi ${name},\n\nThanks for signing up. Your verification code is:\n\n  ${code}\n\nThis code expires in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.\n\n--\nLazy Barbers\n15 Good St, Granville NSW 2142 | 62 Beamish St, Campsie NSW 2194\n+61 416 065 592`;

  await sendEmail({ to, subject: `Your Verification Code — Lazy Barbers`, html, text });
}

async function sendPasswordResetEmail({ to, firstName, code }) {
  const name = firstName || 'there';
  const html = emailWrap(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a1a;">Password Reset</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
      Hi ${name}, we received a request to reset the password on your ${BUSINESS_NAME} account.
    </p>

    <p style="margin:0 0 12px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#D4A843;font-weight:700;">
      Your reset code
    </p>

    <div style="text-align:center;margin:8px 0 24px;">
      <div style="display:inline-block;background:#f8f8f8;border:2px solid #D4A843;border-radius:12px;padding:20px 40px;">
        <span style="font-size:40px;font-weight:700;letter-spacing:14px;color:#1a1a1a;font-family:monospace;">${code}</span>
      </div>
    </div>

    <p style="margin:0 0 8px;font-size:14px;color:#666666;line-height:1.6;">
      &#x23F0; This code expires in <strong>10 minutes</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:13px;color:#999999;line-height:1.6;">
      If you didn't request a password reset, you can safely ignore this email. Your account is secure.
    </p>

    <p style="margin:24px 0 0;text-align:center;">
      <a href="${FRONTEND}/forgot-password"
         style="display:inline-block;background:#E91E63;color:#ffffff;text-decoration:none;
                padding:14px 36px;border-radius:6px;font-size:15px;font-weight:700;
                letter-spacing:0.3px;font-family:Arial,Helvetica,sans-serif;">
        Reset my password &rarr;
      </a>
    </p>
  `);

  const text = `Password Reset — Lazy Barbers\n\nHi ${name},\n\nYour password reset code is:\n\n  ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email. Your account is secure.\n\n--\nLazy Barbers\n15 Good St, Granville NSW 2142 | 62 Beamish St, Campsie NSW 2194\n+61 416 065 592`;

  await sendEmail({ to, subject: `Password Reset — Lazy Barbers`, html, text });
}

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingRescheduled,
  sendPaymentReceipt,
  sendBookingReminder,
  sendClubWelcome,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAdminNewBooking,
  sendAdminBookingCancelled,
};

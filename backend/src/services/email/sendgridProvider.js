const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = process.env.SENDGRID_FROM_EMAIL || 'noreply@lazybarbers.com.au';

async function sendEmail({ to, subject, html }) {
  try {
    await sgMail.send({ to, from: FROM, subject, html });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email] SendGrid error:', err.message);
  }
}

module.exports = { sendEmail };

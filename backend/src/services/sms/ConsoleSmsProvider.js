const SmsProvider = require('./SmsProvider');

/**
 * Dev / simulated SMS provider.
 * Prints the message to the backend console in a visible banner and
 * returns success. The caller (index.js) also writes it to the
 * `notifications` table for the admin audit log.
 */
class ConsoleSmsProvider extends SmsProvider {
  // eslint-disable-next-line class-methods-use-this, require-await
  async send(to, body, meta = {}) {
    const divider = '─'.repeat(60);
    /* eslint-disable no-console */
    console.log(`\n${divider}`);
    console.log(`📱 [SIMULATED SMS]  →  ${to}`);
    if (meta.booking_ref) console.log(`   Booking: ${meta.booking_ref}`);
    console.log(divider);
    console.log(body);
    console.log(`${divider}\n`);
    /* eslint-enable no-console */

    return { status: 'sent', provider: 'console' };
  }
}

module.exports = ConsoleSmsProvider;

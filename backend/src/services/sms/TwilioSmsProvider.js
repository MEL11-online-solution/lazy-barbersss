const SmsProvider = require('./SmsProvider');

/**
 * Twilio SMS provider — STUB.
 *
 * To enable:
 *   1. `npm install twilio` in backend/
 *   2. Uncomment the `require('twilio')` line below.
 *   3. Set these env vars in backend/.env:
 *         SMS_PROVIDER=twilio
 *         TWILIO_ACCOUNT_SID=AC...
 *         TWILIO_AUTH_TOKEN=...
 *         TWILIO_FROM_NUMBER=+61...
 *
 * The SmsProvider interface is identical to ConsoleSmsProvider, so the
 * rest of the codebase needs no changes.
 */
class TwilioSmsProvider extends SmsProvider {
  constructor() {
    super();
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    if (!sid || !token || !from) {
      throw new Error(
        'TwilioSmsProvider requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, ' +
          'and TWILIO_FROM_NUMBER env vars'
      );
    }
    this.from = from;

    // const twilio = require('twilio');
    // this.client = twilio(sid, token);
    throw new Error(
      'TwilioSmsProvider is a stub. Install `twilio` and uncomment the ' +
        'client initialization in TwilioSmsProvider.js to enable.'
    );
  }

  async send(to, body /* , meta */) {
    // const msg = await this.client.messages.create({
    //   to,
    //   from: this.from,
    //   body,
    // });
    // return { status: 'sent', provider: 'twilio', id: msg.sid };
    // eslint-disable-next-line no-unused-expressions
    to; body;
    return { status: 'failed', provider: 'twilio', error: 'Not implemented' };
  }
}

module.exports = TwilioSmsProvider;

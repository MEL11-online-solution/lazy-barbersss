/**
 * Abstract provider interface.
 * All SMS providers must implement `send(to, body, meta)` and return
 * { status: 'sent'|'failed', provider: string, error?: string }.
 *
 * The booking logic talks to the provider via this interface only,
 * so swapping in a real Twilio provider is a config change.
 */
class SmsProvider {
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async send(to, body, meta = {}) {
    throw new Error('SmsProvider.send() not implemented');
  }
}

module.exports = SmsProvider;

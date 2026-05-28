/**
 * Passport configuration — Google OAuth2 only, stateless (no sessions).
 *
 * We deliberately do NOT use passport sessions: authentication state lives in
 * a JWT httpOnly cookie, exactly like email/password login. The Google verify
 * callback resolves to a user row which the callback route turns into a JWT.
 *
 * If GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set, the strategy is not
 * registered and `isGoogleConfigured` is false — callers must guard on it so
 * the app boots fine without Google credentials.
 */
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const authService = require('../services/authService');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/google/callback';

const isGoogleConfigured = Boolean(CLIENT_ID && CLIENT_SECRET);

if (isGoogleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase() || null;
          const firstName =
            profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Google';
          const lastName =
            profile.name?.familyName ||
            profile.displayName?.split(' ').slice(1).join(' ') ||
            'User';

          const user = await authService.findOrCreateGoogleUser({ email, firstName, lastName });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  console.log('[Auth] Google OAuth strategy configured');
} else {
  console.warn('[Auth] GOOGLE_CLIENT_ID/SECRET not set — Google login disabled');
}

module.exports = { passport, isGoogleConfigured };

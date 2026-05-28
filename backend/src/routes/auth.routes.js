const express = require('express');
const { z } = require('zod');
const authService = require('../services/authService');
const validate = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const userRepo = require('../repositories/userRepo');
const auditRepo = require('../repositories/auditRepo');
const { ok, created } = require('../utils/response');
const { PASSWORD_MIN_LENGTH } = require('../config/constants');
const { signToken } = require('../utils/jwt');
const { passport, isGoogleConfigured } = require('../config/passport');

const router = express.Router();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// -------------------- Zod schemas --------------------
const emailSchema = z.string().trim().toLowerCase().email('Invalid email');
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]{6,20}$/u, 'Invalid phone number')
  .optional()
  .or(z.literal(''));

const registerSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(80),
  last_name: z.string().trim().min(1, 'Last name is required').max(80),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});
const verifyEmailSchema = z.object({
  email: emailSchema,
  code: z.string().trim().regex(/^\d{6}$/u, 'Code must be 6 digits'),
});
const resendSchema = z.object({ email: emailSchema });
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});
const forgotSchema = z.object({ email: emailSchema });
const resetSchema = z.object({
  email: emailSchema,
  code: z.string().trim().regex(/^\d{6}$/u, 'Code must be 6 digits'),
  new_password: passwordSchema,
});

// -------------------- cookie helper --------------------
function setAuthCookie(res, token, maxAge = 7 * 24 * 60 * 60 * 1000) {
  const opts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
  if (maxAge !== null) opts.maxAge = maxAge;
  res.cookie('token', token, opts);
}

// -------------------- routes --------------------

router.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return created(res, {
      message: 'Verification code sent to your email.',
      user: result.user,
    });
  })
);

router.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  asyncHandler(async (req, res) => {
    const result = await authService.verifyEmail(req.body);
    setAuthCookie(res, result.token);
    return ok(res, { message: 'Email verified', user: result.user });
  })
);

router.post(
  '/resend-verification',
  validate({ body: resendSchema }),
  asyncHandler(async (req, res) => {
    const result = await authService.resendVerification(req.body);
    return ok(res, { message: 'If that email is registered, a new code has been sent.' });
  })
);

router.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    const maxAge = req.body.rememberMe ? 30 * 24 * 60 * 60 * 1000 : null;
    setAuthCookie(res, result.token, maxAge);
    auditRepo.log({ userId: result.user.id, action: 'auth.login', entityType: 'user', entityId: result.user.id, details: { email: result.user.email } });
    return ok(res, { message: 'Signed in', user: result.user });
  })
);

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  return ok(res, { message: 'Signed out' });
});

router.post(
  '/forgot-password',
  validate({ body: forgotSchema }),
  asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body);
    return ok(res, { message: 'If that email exists, a reset code has been sent.' });
  })
);

router.post(
  '/reset-password',
  validate({ body: resetSchema }),
  asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);
    return ok(res, { message: 'Password reset. You can now sign in.' });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => ok(res, { user: userRepo.toPublic(req.user) }))
);

// -------------------- Google OAuth --------------------

// Lets the frontend decide whether to show the "Continue with Google" button.
router.get('/providers', (req, res) => ok(res, { google: isGoogleConfigured }));

if (isGoogleConfigured) {
  // Step 1: redirect the user to Google's consent screen.
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  // Step 2: Google redirects back here. Issue our own JWT cookie, then send
  // the user to the frontend home page (same auth model as email/password).
  router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${FRONTEND_ORIGIN}/sign-in?error=google`,
    }),
    (req, res) => {
      const token = signToken({ userId: req.user.id, role: req.user.role });
      setAuthCookie(res, token);
      auditRepo.log({
        userId: req.user.id,
        action: 'auth.login',
        entityType: 'user',
        entityId: req.user.id,
        details: { email: req.user.email, via: 'google' },
      });
      return res.redirect(`${FRONTEND_ORIGIN}/home`);
    }
  );
}

module.exports = router;

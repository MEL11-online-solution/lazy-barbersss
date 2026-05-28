const crypto = require('crypto');
const userRepo = require('../repositories/userRepo');
const tokenRepo = require('../repositories/verificationTokenRepo');
const emailService = require('./email');
const { hashPassword, verifyPassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const { generateVerificationCode } = require('../utils/reference');
const { HttpError } = require('../middleware/errorHandler');
const {
  EMAIL_VERIFY_TTL_MINUTES,
  PASSWORD_RESET_TTL_MINUTES,
} = require('../config/constants');


function expiryDate(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Issue (or re-issue) a verification code for a user + type.
 * Automatically picks the right TTL based on type.
 */
async function issueCode(user, type) {
  const ttl = type === 'password_reset' ? PASSWORD_RESET_TTL_MINUTES : EMAIL_VERIFY_TTL_MINUTES;
  const code = generateVerificationCode();
  await tokenRepo.create({
    user_id: user.id,
    token: code,
    type,
    expires_at: expiryDate(ttl),
  });
  return code;
}

// ─── Resend rate limiter (in-memory, per email, 3 per hour) ───────────────

const _resendLog = new Map();
const RESEND_MAX = 3;
const RESEND_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkResendRateLimit(email) {
  const now = Date.now();
  const key = email.toLowerCase();
  const log = (_resendLog.get(key) || []).filter((t) => now - t < RESEND_WINDOW_MS);
  if (log.length >= RESEND_MAX) {
    throw new HttpError(429, 'RATE_LIMIT', 'Too many resend attempts. Please try again in an hour.');
  }
  log.push(now);
  _resendLog.set(key, log);
}

// -------------------------------------------------------------------
// REGISTER
// -------------------------------------------------------------------
async function register({ first_name, last_name, email, phone, password }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new HttpError(409, 'EMAIL_IN_USE', 'An account with this email already exists');
  }

  const password_hash = await hashPassword(password);
  const userId = await userRepo.insert({
    first_name,
    last_name,
    email,
    phone: phone || null,
    password_hash,
    role: 'customer',
    email_verified: 0,
  });

  const user = await userRepo.findById(userId);
  const code = await issueCode(user, 'email_verify');

  await emailService.sendVerificationEmail({
    to: user.email,
    firstName: user.firstName,
    code,
  });

  return { user: userRepo.toPublic(user) };
}

// -------------------------------------------------------------------
// VERIFY EMAIL
// -------------------------------------------------------------------
async function verifyEmail({ email, code }) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'No account with that email');
  }
  if (user.emailVerified) {
    // Idempotent — already verified
    const token = signToken({ userId: user.id, role: user.role });
    return { user: userRepo.toPublic(user), token };
  }

  const record = await tokenRepo.verify({ user_id: user.id, token: code, type: 'email_verify' });
  if (!record) {
    throw new HttpError(400, 'INVALID_CODE', 'Invalid or expired verification code');
  }

  await tokenRepo.markUsed(record.id);
  await userRepo.setEmailVerified(user.id);

  const updated = await userRepo.findById(user.id);
  const token = signToken({ userId: updated.id, role: updated.role });
  return { user: userRepo.toPublic(updated), token };
}

// -------------------------------------------------------------------
// RESEND VERIFICATION  (rate-limited: 3 per email per hour)
// -------------------------------------------------------------------
async function resendVerification({ email }) {
  const user = await userRepo.findByEmail(email);
  // Don't leak whether the email exists — always succeed outwardly,
  // but DO enforce the rate limit to prevent abuse.
  if (!user || user.emailVerified) {
    return { dev_code: undefined };
  }

  checkResendRateLimit(email);

  const code = await issueCode(user, 'email_verify');
  await emailService.sendVerificationEmail({
    to: user.email,
    firstName: user.firstName,
    code,
  });

  return {};
}

// -------------------------------------------------------------------
// LOGIN
// -------------------------------------------------------------------
async function login({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
  const okPwd = await verifyPassword(password, user.passwordHash);
  if (!okPwd) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
  if (!user.emailVerified && user.role === 'customer') {
    throw new HttpError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before signing in');
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { user: userRepo.toPublic(user), token };
}

// -------------------------------------------------------------------
// GOOGLE OAUTH — find existing user by email or auto-create a customer
// -------------------------------------------------------------------
async function findOrCreateGoogleUser({ email, firstName, lastName }) {
  if (!email) {
    throw new HttpError(400, 'GOOGLE_NO_EMAIL', 'Google account did not provide an email address');
  }

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    // Existing account (any role) — just log them in.
    return existing;
  }

  // New user: auto-create a verified customer with an unguessable random password.
  const randomPassword = crypto.randomBytes(32).toString('hex');
  const password_hash = await hashPassword(randomPassword);
  const userId = await userRepo.insert({
    first_name: firstName || 'Google',
    last_name: lastName || 'User',
    email,
    phone: null,
    password_hash,
    role: 'customer',
    email_verified: 1,
  });

  return userRepo.findById(userId);
}

// -------------------------------------------------------------------
// FORGOT PASSWORD (send code)
// -------------------------------------------------------------------
async function forgotPassword({ email }) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    return { dev_code: undefined };
  }
  const code = await issueCode(user, 'password_reset');
  await emailService.sendPasswordResetEmail({
    to: user.email,
    firstName: user.firstName,
    code,
  });

  return {};
}

// -------------------------------------------------------------------
// RESET PASSWORD
// -------------------------------------------------------------------
async function resetPassword({ email, code, new_password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new HttpError(400, 'INVALID_CODE', 'Invalid or expired reset code');
  }
  const record = await tokenRepo.verify({ user_id: user.id, token: code, type: 'password_reset' });
  if (!record) {
    throw new HttpError(400, 'INVALID_CODE', 'Invalid or expired reset code');
  }

  const password_hash = await hashPassword(new_password);
  await userRepo.updatePassword(user.id, password_hash);
  await tokenRepo.markUsed(record.id);

  return { ok: true };
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  findOrCreateGoogleUser,
  forgotPassword,
  resetPassword,
};

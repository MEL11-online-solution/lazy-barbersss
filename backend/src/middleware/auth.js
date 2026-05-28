const { verifyToken } = require('../utils/jwt');
const userRepo = require('../repositories/userRepo');
const { HttpError } = require('./errorHandler');

function extractToken(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

/**
 * Require a valid JWT. Loads the current user from DB so deleted users
 * cannot continue using a still-valid token.
 */
async function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new HttpError(401, 'UNAUTHENTICATED', 'Authentication required');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new HttpError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }

    const user = await userRepo.findById(payload.userId);
    if (!user) {
      throw new HttpError(401, 'USER_NOT_FOUND', 'Account no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'UNAUTHENTICATED', 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
}

async function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = await userRepo.findById(payload.userId);
    if (user) req.user = user;
  } catch {
    /* ignore — optional */
  }
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth };

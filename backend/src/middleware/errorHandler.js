/**
 * Central error handler. All errors funnel through here so the response
 * envelope is identical across the API:
 *
 *   { ok: false, error: { code, message, details? } }
 */
const { ZodError } = require('zod');

class HttpError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function send(res, status, code, message, details) {
  const body = { ok: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return res.status(status).json(body);
}

function errorHandler(err, req, res, _next) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return send(res, 400, 'VALIDATION_ERROR', 'Invalid request data',
      err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  // Our own structured errors
  if (err instanceof HttpError) {
    return send(res, err.status, err.code, err.message, err.details);
  }

  // MySQL unique-constraint → 409
  if (err && err.code === 'ER_DUP_ENTRY') {
    return send(res, 409, 'CONSTRAINT_VIOLATION', 'Resource conflict — duplicate value');
  }

  // Foreign key / other constraint
  if (err && typeof err.code === 'string' && err.code.startsWith('ER_NO_REFERENCED_ROW')) {
    return send(res, 400, 'INVALID_REFERENCE', 'Referenced resource does not exist');
  }

  // Unknown — log internally, never leak stack to client
  // eslint-disable-next-line no-console
  console.error('[ERROR]', err);
  return send(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
}

/** 404 for unmatched routes */
function notFoundHandler(req, res) {
  return send(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`);
}

/** Wrap async handlers so thrown errors reach errorHandler */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, notFoundHandler, asyncHandler, HttpError };

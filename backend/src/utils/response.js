/**
 * Standardized API response shape.
 *
 * Success:
 *   { ok: true, data: <payload>, meta?: <pagination/etc> }
 *
 * Error: handled centrally in errorHandler.js — shape is:
 *   { ok: false, error: { code, message, details? } }
 *
 * Use these helpers in every controller for consistency.
 */

function ok(res, data, meta) {
  const body = { ok: true, data };
  if (meta) body.meta = meta;
  return res.json(body);
}

function created(res, data) {
  return res.status(201).json({ ok: true, data });
}

function noContent(res) {
  return res.status(204).end();
}

module.exports = { ok, created, noContent };

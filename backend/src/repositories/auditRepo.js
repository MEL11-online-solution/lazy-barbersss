const { sql, eq, and, gte, like, desc } = require('drizzle-orm');
const { db, schema } = require('../config/db');

const { auditLogs } = schema;

async function log({ userId = null, action, entityType = null, entityId = null, details = null } = {}) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      entityType,
      entityId,
      details: details != null ? JSON.stringify(details) : null,
    });
  } catch (_) {
    // silent fail — audit logging must never break core flows
  }
}

async function list({ page = 1, pageSize = 50, action, userId, since } = {}) {
  const filters = [];
  if (action) filters.push(like(auditLogs.action, `%${action}%`));
  if (userId) filters.push(eq(auditLogs.userId, userId));
  if (since) filters.push(gte(auditLogs.createdAt, new Date(since)));

  const where = filters.length > 0 ? and(...filters) : undefined;

  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql`COUNT(*)` })
      .from(auditLogs)
      .where(where),
  ]);

  return { rows, page, pageSize, total: Number(totals[0].count) };
}

async function exportAll({ action, userId, since } = {}) {
  const filters = [];
  if (action) filters.push(like(auditLogs.action, `%${action}%`));
  if (userId) filters.push(eq(auditLogs.userId, userId));
  if (since) filters.push(gte(auditLogs.createdAt, new Date(since)));

  const where = filters.length > 0 ? and(...filters) : undefined;

  return db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(10000);
}

module.exports = { log, list, exportAll };

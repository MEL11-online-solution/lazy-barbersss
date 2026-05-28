const { eq, and, sql, isNull, gt, desc } = require('drizzle-orm');
const { db, schema } = require('../config/db');
const { isoToMysql, nowMysql } = require('../utils/time');

const { verificationTokens } = schema;

async function create({ user_id, token, type, expires_at }) {
  // Invalidate any existing active codes of the same type for this user.
  await db
    .update(verificationTokens)
    .set({ usedAt: sql`NOW()` })
    .where(
      and(
        eq(verificationTokens.userId, user_id),
        eq(verificationTokens.type, type),
        isNull(verificationTokens.usedAt)
      )
    );

  await db.insert(verificationTokens).values({
    userId: user_id,
    token,
    type,
    expiresAt: expires_at instanceof Date ? expires_at : new Date(expires_at),
  });
}

async function verify({ user_id, token, type }) {
  const rows = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.userId, user_id),
        eq(verificationTokens.token, token),
        eq(verificationTokens.type, type),
        isNull(verificationTokens.usedAt),
        gt(verificationTokens.expiresAt, new Date())
      )
    )
    .orderBy(desc(verificationTokens.id))
    .limit(1);
  return rows[0] || null;
}

async function markUsed(id) {
  await db
    .update(verificationTokens)
    .set({ usedAt: sql`NOW()` })
    .where(eq(verificationTokens.id, id));
}

module.exports = { create, verify, markUsed };

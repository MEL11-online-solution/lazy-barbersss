const jwt = require('jsonwebtoken');

require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  // Fail loud in prod; ok in dev with the default
  throw new Error('JWT_SECRET must be set in production');
}

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };

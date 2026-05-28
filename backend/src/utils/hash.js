const bcrypt = require('bcryptjs');

const COST = 10;

async function hashPassword(plain) {
  return bcrypt.hash(plain, COST);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, verifyPassword };

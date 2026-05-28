require('dotenv').config();
const { pool } = require('../config/db');

async function run() {
  console.log('Creating missing tables on', process.env.DB_HOST);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS club_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(191) NOT NULL,
      first_name VARCHAR(80),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY club_members_email_unique (email)
    )
  `);
  console.log('club_members ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(80) NOT NULL,
      entity_type VARCHAR(80),
      entity_id INT,
      details TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY audit_logs_created_idx (created_at),
      KEY audit_logs_user_idx (user_id),
      KEY audit_logs_action_idx (action)
    )
  `);
  console.log('audit_logs ready');

  await pool.end();
  console.log('Done!');
  process.exit(0);
}

run().catch((e) => { console.error('Failed:', e.message); process.exit(1); });

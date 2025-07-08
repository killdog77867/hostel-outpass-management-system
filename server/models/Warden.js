const db = require('../config/db');

const createWardenTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS wardens (
      warden_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await db.query(query);
    console.log('✅ Wardens table ready');
  } catch (err) {
    console.error('❌ Error creating wardens table:', err);
    throw err;
  }
};

module.exports = { createWardenTable };
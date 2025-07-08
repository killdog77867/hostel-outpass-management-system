const db = require('../config/db');

const createAdvisorTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS advisors (
      advisor_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      class VARCHAR(50) NOT NULL
    )
  `);
};

module.exports = { createAdvisorTable };
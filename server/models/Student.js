const db = require('../config/db');

const createStudentTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS students (
      student_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      class VARCHAR(50) NOT NULL,
      advisor_id VARCHAR(10),
      discipline_score INT DEFAULT 100,
      FOREIGN KEY (advisor_id) REFERENCES advisors(advisor_id)
    )
  `);
};

module.exports = { createStudentTable };66
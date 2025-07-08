const db = require('../config/db');

const createPassTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS passes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(10) NOT NULL,
        advisor_id VARCHAR(10),
        warden_id VARCHAR(10),
        pass_type ENUM('Outpass', 'Homepass', 'Emergency') NOT NULL,
        from_date DATETIME NOT NULL,
        to_date DATETIME NOT NULL,
        reason TEXT NOT NULL,
        proof TEXT,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        advisor_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        advisor_comment TEXT,
        warden_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        warden_comment TEXT,
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        FOREIGN KEY (advisor_id) REFERENCES advisors(advisor_id),
        FOREIGN KEY (warden_id) REFERENCES wardens(warden_id)
      )
    `);
    console.log('Passes table created or already exists');
  } catch (error) {
    console.error('Error creating passes table:', error);
    throw error;
  }
};

module.exports = { createPassTable };
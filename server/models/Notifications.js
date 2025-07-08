const db = require('../config/db');

// Function to create the notifications table
const createNotificationTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(10) NOT NULL,
        user_role ENUM('student', 'advisor', 'warden') NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Notifications table created or already exists');
  } catch (error) {
    console.error('Error creating notifications table:', error);
    throw error;
  }
};

module.exports = { createNotificationTable };
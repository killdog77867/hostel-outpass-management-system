const { createAdvisorTable } = require('./models/Advisor');
const { createStudentTable } = require('./models/Student');
const { createWardenTable } = require('./models/Warden');
const { createPassTable } = require('./models/Pass');
const { createNotificationTable } = require('./models/Notifications');
const db = require('./config/db');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Drop the database if it exists and recreate it
    await db.query('DROP DATABASE IF EXISTS hostel_outpass');
    await db.query('CREATE DATABASE hostel_outpass');
    await db.query('USE hostel_outpass');

    // Create tables in dependency order
    await createAdvisorTable();
    await createWardenTable();
    await createStudentTable();
    await createPassTable();
    await createNotificationTable();

    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up the database:', error);
    throw error;
  }
};

// Run immediately
initializeDatabase();

module.exports = { initializeDatabase };
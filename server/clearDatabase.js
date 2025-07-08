const db = require('./config/db');

const clearDatabase = async () => {
  try {
    // Disable foreign key checks to avoid constraint issues
    await db.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate all tables to remove all records and reset auto-increment counters
    await db.query('TRUNCATE TABLE notifications');
    await db.query('TRUNCATE TABLE passes');
    await db.query('TRUNCATE TABLE students');
    await db.query('TRUNCATE TABLE wardens');
    await db.query('TRUNCATE TABLE advisors');

    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    // Close the database connection
    await db.end();
  }
};

clearDatabase();
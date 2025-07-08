// testDatabase.js
const db = require('./config/db');

async function resetDatabase() {
  try {
    console.log('🚀 Starting database reset...');
    
    // Drop tables in reverse order of dependencies
    await dropTables();
    
    // Create all tables
    await createTables();
    
    // Add foreign key constraints
    await addConstraints();
    
    // Insert test data
    await insertTestData();
    
    console.log('🎉 Database reset complete!');
    console.log('Test Warden: warden@test.com / test123');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
  } finally {
    db.end();
  }
}

async function dropTables() {
  const tables = [
    'notifications',
    'passes',
    'students',
    'advisors',
    'wardens'
  ];
  
  for (const table of tables) {
    await db.query(`DROP TABLE IF EXISTS ${table}`);
  }
  console.log('✅ All tables dropped');
}

async function createTables() {
  // Create wardens table
  await db.query(`
    CREATE TABLE wardens (
      warden_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create advisors table
  await db.query(`
    CREATE TABLE advisors (
      advisor_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      class VARCHAR(50) NOT NULL
    )
  `);
  
  // Create students table
  await db.query(`
    CREATE TABLE students (
      student_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      class VARCHAR(50) NOT NULL,
      advisor_id VARCHAR(10),
      discipline_score INT DEFAULT 100
    )
  `);
  
  // Create passes table
  await db.query(`
    CREATE TABLE passes (
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
      warden_comment TEXT
    )
  `);
  
  // Create notifications table
  await db.query(`
    CREATE TABLE notifications (
      notification_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(10) NOT NULL,
      user_role ENUM('student', 'advisor', 'warden') NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ All tables created');
}

async function addConstraints() {
  // Students -> Advisors
  await db.query(`
    ALTER TABLE students
    ADD CONSTRAINT fk_student_advisor
    FOREIGN KEY (advisor_id) REFERENCES advisors(advisor_id)
  `);
  
  // Passes -> Students
  await db.query(`
    ALTER TABLE passes
    ADD CONSTRAINT fk_pass_student
    FOREIGN KEY (student_id) REFERENCES students(student_id)
  `);
  
  // Passes -> Advisors
  await db.query(`
    ALTER TABLE passes
    ADD CONSTRAINT fk_pass_advisor
    FOREIGN KEY (advisor_id) REFERENCES advisors(advisor_id)
  `);
  
  // Passes -> Wardens
  await db.query(`
    ALTER TABLE passes
    ADD CONSTRAINT fk_pass_warden
    FOREIGN KEY (warden_id) REFERENCES wardens(warden_id)
  `);
  
  console.log('✅ All constraints added');
}

async function insertTestData() {
  // Insert wardens
  await db.query(`
    INSERT INTO wardens (warden_id, name, email, password)
    VALUES 
      ('W001', 'Main Warden', 'warden@test.com', 'test123'),
      ('W002', 'Assistant Warden', 'awarden@test.com', 'test123')
  `);
  
  // Insert advisors
  await db.query(`
    INSERT INTO advisors (advisor_id, name, email, password, class)
    VALUES 
      ('A001', 'CS Advisor', 'csadvisor@test.com', 'advisor123', 'CS'),
      ('A002', 'EC Advisor', 'ecadvisor@test.com', 'advisor123', 'EC')
  `);
  
  // Insert students
  await db.query(`
    INSERT INTO students (student_id, name, email, password, class, advisor_id, discipline_score)
    VALUES 
      ('S001', 'John Doe', 'john@test.com', 'student123', 'CS', 'A001', 95),
      ('S002', 'Jane Smith', 'jane@test.com', 'student123', 'EC', 'A002', 85)
  `);
  
  // Insert passes
  await db.query(`
    INSERT INTO passes (
      student_id, advisor_id, warden_id, pass_type, 
      from_date, to_date, reason, 
      status, advisor_status, warden_status
    )
    VALUES 
      ('S001', 'A001', 'W001', 'Outpass', 
       NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY), 'Family function',
       'Pending', 'Approved', 'Pending'),
       
      ('S002', 'A002', 'W001', 'Homepass', 
       NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Vacation',
       'Pending', 'Approved', 'Pending')
  `);
  
  console.log('✅ Test data inserted');
}

resetDatabase();
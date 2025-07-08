const db = require('../config/db');

// Login for Student
const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find student by email
    const [student] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (student.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password (plain text, as per your request)
    if (password !== student[0].password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: student[0].student_id, role: 'student' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: student[0].student_id, name: student[0].name, email: student[0].email }
    });
  } catch (error) {
    console.error('Error in loginStudent:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Signup for Student
const signupStudent = async (req, res) => {
  const {
    name,
    email,
    password,
    class: className,
    bloodGroup,
    motherTongue,
    gender,
    nativePlace,
    state,
    nationality,
    parentsInfo,
    address
  } = req.body;

  try {
    // Check if student already exists
    const [existingStudent] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (existingStudent.length > 0) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Generate a unique student_id (e.g., S002, S003, etc.)
    const [lastStudent] = await db.query('SELECT student_id FROM students ORDER BY student_id DESC LIMIT 1');
    let student_id = 'S001';
    if (lastStudent.length > 0) {
      const lastIdNum = parseInt(lastStudent[0].student_id.slice(1)) + 1;
      student_id = `S${lastIdNum.toString().padStart(3, '0')}`; // e.g., S002
    }

    // Find an advisor for the student's class
    const [advisor] = await db.query('SELECT advisor_id FROM advisors WHERE class = ?', [className]);
    const advisor_id = advisor.length > 0 ? advisor[0].advisor_id : null;

    // Insert new student
    await db.query(
      `INSERT INTO students (student_id, name, email, password, class, advisor_id, discipline_score, 
        blood_group, mother_tongue, gender, native_place, state, nationality, parents_info, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        name,
        email,
        password,
        className,
        advisor_id,
        100, // Default discipline_score
        bloodGroup || null,
        motherTongue || null,
        gender || null,
        nativePlace || null,
        state || null,
        nationality || null,
        parentsInfo || null,
        address || null
      ]
    );

    // Generate a JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: student_id, role: 'student' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: { id: student_id, name, email }
    });
  } catch (error) {
    console.error('Error in signupStudent:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

module.exports = { loginStudent, signupStudent };
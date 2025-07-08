const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { createNotification } = require('../controllers/notificationController');
const { loginStudent, signupStudent } = require('../controllers/studentController');

router.post('/apply-pass', authMiddleware, async (req, res) => {
  const { pass_type, from_date, to_date, reason, proof } = req.body;
  const student_id = req.user.id;

  if (!student_id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const validPassTypes = ["Outpass", "Homepass", "Emergency"];
  if (!validPassTypes.includes(pass_type)) {
    return res.status(400).json({ error: "Invalid pass type" });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: "Reason is required" });
  }

  const now = new Date();
  const from = new Date(from_date);
  const timeDifference = from - now;
  const hoursDifference = timeDifference / (1000 * 60 * 60);

  if (hoursDifference < 24) {
    return res.status(400).json({ error: "You must apply for a pass at least 24 hours in advance" });
  }

  if (pass_type === "Outpass") {
    const from = new Date(from_date);
    const to = new Date(to_date);

    const sameDay =
      from.getFullYear() === to.getFullYear() &&
      from.getMonth() === to.getMonth() &&
      from.getDate() === to.getDate();

    if (!sameDay) {
      return res.status(400).json({ error: "Outpass must be for the same day (morning to night)" });
    }

    const fromHours = from.getHours();
    const toHours = to.getHours();

    const startHour = 8;
    const endHour = 20;

    if (fromHours < startHour || toHours > endHour) {
      return res.status(400).json({ error: "Outpass time must be between 8:00 AM and 8:00 PM" });
    }

    if (to <= from) {
      return res.status(400).json({ error: "To Date/Time must be after From Date/Time" });
    }
  }

  try {
    const [student] = await db.query('SELECT class, name FROM students WHERE student_id = ?', [student_id]);
    if (!student.length) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const studentClass = student[0].class;
    const studentName = student[0].name;

    const [advisor] = await db.query('SELECT advisor_id FROM advisors WHERE LOWER(class) = LOWER(?)', [studentClass]);
    if (!advisor.length) {
      return res.status(400).json({ error: 'No advisor assigned for your class' });
    }

    const advisor_id = advisor[0].advisor_id;

    const [result] = await db.query(
      'INSERT INTO passes (student_id, advisor_id, pass_type, from_date, to_date, reason, proof, status, advisor_status, warden_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, advisor_id, pass_type, from_date, to_date, reason, proof || null, 'Pending', 'Pending', 'Pending']
    );

    await createNotification(
      student_id,
      'student',
      `Pass Application Submitted: Your ${pass_type} application has been submitted.`
    );
    await createNotification(
      advisor_id,
      'advisor',
      `New Pass Application: A ${pass_type} application from ${studentName} needs your approval.`
    );

    res.status(201).json({ message: 'Pass applied successfully', passId: result.insertId });
  } catch (error) {
    console.error('Error applying pass:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/passes', authMiddleware, async (req, res) => {
  const student_id = req.user.id;

  try {
    const [passes] = await db.query(
      'SELECT id, pass_type, from_date, to_date, reason, status, advisor_status, warden_status FROM passes WHERE student_id = ?',
      [student_id]
    );
    res.json(passes);
  } catch (error) {
    console.error('Error fetching passes:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  const student_id = req.params.id;
  const user_id = req.user.id;
  const user_role = req.user.role;

  if (user_role === 'student' && user_id !== student_id) {
    return res.status(403).json({ error: 'Unauthorized: You can only view your own profile' });
  }

  try {
    const [students] = await db.query(
      `SELECT student_id, name, email, class, discipline_score, 
              blood_group, mother_tongue, gender, native_place, 
              state, nationality, parents_info, address 
       FROM students WHERE student_id = ?`,
      [student_id]
    );
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(students[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', loginStudent);
router.post('/register', signupStudent);

module.exports = router;
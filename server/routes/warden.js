const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { createNotification } = require('../controllers/notificationController');
const { loginWarden } = require('../controllers/wardenController');

router.get('/passes', authMiddleware, async (req, res) => {
  const warden_id = req.user.id;

  try {
    const [passes] = await db.query(
      `SELECT p.id, p.student_id, p.pass_type, p.from_date, p.to_date, 
              p.reason, p.status, p.advisor_status, p.warden_status, p.warden_comment,
              s.name AS student_name, s.discipline_score 
       FROM passes p
       JOIN students s ON p.student_id = s.student_id
       WHERE p.advisor_status = 'Approved' AND p.warden_status = 'Pending' AND p.warden_id = ?`,
      [warden_id]
    );

    console.log(`Warden ${warden_id} fetched passes:`, passes);
    res.json(passes);
  } catch (error) {
    console.error('Error fetching warden passes:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/passes/:id', authMiddleware, async (req, res) => {
  const passId = req.params.id;
  const warden_id = req.user.id;
  const { warden_status, warden_comment } = req.body;

  if (!['Approved', 'Rejected'].includes(warden_status)) {
    return res.status(400).json({ error: 'Invalid warden status' });
  }

  try {
    const [pass] = await db.query(
      'SELECT p.*, s.email FROM passes p JOIN students s ON p.student_id = s.student_id WHERE p.id = ? AND p.advisor_status = "Approved" AND p.warden_status = "Pending" AND p.warden_id = ?',
      [passId, warden_id]
    );

    if (!pass.length) {
      return res.status(403).json({ error: "Unauthorized: Only passes approved by an advisor and assigned to this warden can be updated." });
    }

    const passData = pass[0];

    await db.query(
      'UPDATE passes SET warden_status = ?, warden_comment = ?, status = ? WHERE id = ?',
      [warden_status, warden_comment || null, warden_status, passId]
    );

    if (warden_status === 'Approved') {
      await createNotification(
        passData.student_id,
        'student',
        `Warden Approved: Your ${passData.pass_type} application has been fully approved.`
      );
    } else if (warden_status === 'Rejected') {
      await createNotification(
        passData.student_id,
        'student',
        `Warden Rejected: Your ${passData.pass_type} application has been rejected by the warden.`
      );
    }

    console.log(`Warden ${warden_id} updated pass ${passId} to ${warden_status}`);
    res.json({ message: 'Pass updated successfully' });
  } catch (error) {
    console.error('Error updating pass:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/update-discipline', authMiddleware, async (req, res) => {
  const { student_id, change } = req.body;

  try {
    const [student] = await db.query('SELECT discipline_score, name FROM students WHERE student_id = ?', [student_id]);

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let newScore = student[0].discipline_score + change;
    newScore = Math.max(0, newScore);

    await db.query('UPDATE students SET discipline_score = ? WHERE student_id = ?', [newScore, student_id]);

    await createNotification(
      student_id,
      'student',
      `Discipline Score Updated: Your discipline score has been updated to ${newScore} by the warden.`
    );

    res.json({ message: 'Discipline score updated successfully', newScore });
  } catch (error) {
    console.error('Error updating discipline score:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/search-student', authMiddleware, async (req, res) => {
  const { query } = req.query;

  try {
    const [students] = await db.query(
      `SELECT s.student_id, s.name AS student_name, s.discipline_score,
              p.id AS pass_id, p.pass_type, p.from_date, p.to_date, 
              p.reason, p.status, p.advisor_status, p.warden_status, p.warden_comment
       FROM students s
       LEFT JOIN passes p ON s.student_id = p.student_id AND p.warden_status = 'Pending'
       WHERE s.student_id = ? OR s.name LIKE ?`,
      [query, `%${query}%`]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(students[0]);
  } catch (error) {
    console.error('Error searching for student:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/students', authMiddleware, async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT s.student_id, s.name AS student_name, s.discipline_score,
              p.id AS pass_id, p.pass_type, p.from_date, p.to_date, 
              p.reason, p.status, p.advisor_status, p.warden_status, p.warden_comment
       FROM students s
       LEFT JOIN passes p ON s.student_id = p.student_id AND p.warden_status = 'Pending'`
    );

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', loginWarden);

module.exports = router;
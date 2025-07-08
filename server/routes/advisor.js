const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { createNotification } = require('../controllers/notificationController');
const { loginAdvisor, signupAdvisor } = require('../controllers/advisorController');

router.get('/passes', authMiddleware, async (req, res) => {
  const advisor_id = req.user.id;

  try {
    const [advisor] = await db.query('SELECT class FROM advisors WHERE advisor_id = ?', [advisor_id]);
    if (!advisor.length) {
      return res.status(403).json({ error: 'Advisor not found' });
    }

    const advisorClass = advisor[0].class;

    const [passes] = await db.query(
      `SELECT p.id, p.student_id, p.pass_type, p.from_date, p.to_date, p.reason, p.status, p.advisor_status, p.advisor_comment
       FROM passes p
       JOIN students s ON p.student_id = s.student_id
       WHERE s.class = ? AND p.advisor_status = 'Pending'`,
      [advisorClass]
    );

    console.log(`Advisor ${advisor_id} fetched passes for class ${advisorClass}:`, passes);
    res.json(passes);
  } catch (error) {
    console.error('Error fetching advisor passes:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/passes/:id', authMiddleware, async (req, res) => {
  const passId = req.params.id;
  const advisor_id = req.user.id;
  const { advisor_status, advisor_comment } = req.body;

  if (!['Approved', 'Rejected'].includes(advisor_status)) {
    return res.status(400).json({ error: 'Invalid advisor status' });
  }

  try {
    // Fetch the pass and ensure the advisor is authorized
    const [pass] = await db.query(
      `SELECT p.id, p.student_id, p.pass_type, p.status
       FROM passes p
       JOIN students s ON p.student_id = s.student_id
       JOIN advisors a ON s.class = a.class
       WHERE p.id = ? AND a.advisor_id = ?`,
      [passId, advisor_id]
    );

    if (!pass.length) {
      return res.status(403).json({ error: "Unauthorized: You can only update passes for students in your class." });
    }

    const passData = pass[0];

    // Update the pass status
    await db.query(
      'UPDATE passes SET advisor_status = ?, advisor_comment = ? WHERE id = ?',
      [advisor_status, advisor_comment || null, passId]
    );

    // Fetch student name for notifications
    const [student] = await db.query(
      'SELECT name FROM students WHERE student_id = ?',
      [passData.student_id]
    );
    if (!student.length) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const studentName = student[0].name;

    // Handle pass approval or rejection
    if (advisor_status === 'Approved') {
      const [warden] = await db.query('SELECT warden_id FROM wardens LIMIT 1');
      if (!warden.length) {
        return res.status(400).json({ error: 'No warden found' });
      }
      const warden_id = warden[0].warden_id;

      await db.query('UPDATE passes SET warden_id = ? WHERE id = ?', [warden_id, passId]);

      await createNotification(
        passData.student_id,
        'student',
        `Advisor Approved: Your ${passData.pass_type} application has been approved by the advisor.`
      );
      await createNotification(
        warden_id,
        'warden',
        `Advisor Approved: A ${passData.pass_type} application from ${studentName} needs your approval.`
      );
    } else if (advisor_status === 'Rejected') {
      await createNotification(
        passData.student_id,
        'student',
        `Advisor Rejected: Your ${passData.pass_type} application has been rejected by the advisor.`
      );
      await db.query('UPDATE passes SET status = ? WHERE id = ?', ['Rejected', passId]);
    }

    console.log(`Advisor ${advisor_id} updated pass ${passId} to ${advisor_status}`);
    res.json({ message: 'Pass updated successfully' });
  } catch (error) {
    console.error('Error updating pass:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', loginAdvisor);
router.post('/register', signupAdvisor);

module.exports = router;
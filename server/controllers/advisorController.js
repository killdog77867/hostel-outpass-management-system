const db = require('../config/db');

// Login for Advisor
const loginAdvisor = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find advisor by email
    const [advisor] = await db.query('SELECT * FROM advisors WHERE email = ?', [email]);
    if (advisor.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password (plain text, as per your request)
    if (password !== advisor[0].password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: advisor[0].advisor_id, role: 'advisor' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      advisor: { id: advisor[0].advisor_id, name: advisor[0].name, email: advisor[0].email }
    });
  } catch (error) {
    console.error('Error in loginAdvisor:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Signup for Advisor
const signupAdvisor = async (req, res) => {
  const { name, email, password, class: advisorClass } = req.body;

  try {
    // Check if advisor already exists
    const [existingAdvisor] = await db.query('SELECT * FROM advisors WHERE email = ?', [email]);
    if (existingAdvisor.length > 0) {
      return res.status(400).json({ message: 'Advisor with this email already exists' });
    }

    // Generate a unique advisor_id (e.g., A002, A003, etc.)
    const [lastAdvisor] = await db.query('SELECT advisor_id FROM advisors ORDER BY advisor_id DESC LIMIT 1');
    let advisor_id = 'A001';
    if (lastAdvisor.length > 0) {
      const lastIdNum = parseInt(lastAdvisor[0].advisor_id.slice(1)) + 1;
      advisor_id = `A${lastIdNum.toString().padStart(3, '0')}`; // e.g., A002
    }

    // Insert new advisor
    await db.query(
      'INSERT INTO advisors (advisor_id, name, email, password, class) VALUES (?, ?, ?, ?, ?)',
      [advisor_id, name, email, password, advisorClass]
    );

    // Generate a JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: advisor_id, role: 'advisor' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Advisor registered successfully',
      token,
      advisor: { id: advisor_id, name, email }
    });
  } catch (error) {
    console.error('Error in signupAdvisor:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

module.exports = { loginAdvisor, signupAdvisor };
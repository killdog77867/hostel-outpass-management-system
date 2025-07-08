const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  let table;
  let idField;
  switch (role) {
    case 'student':
      table = 'students';
      idField = 'student_id';
      break;
    case 'advisor':
      table = 'advisors';
      idField = 'advisor_id';
      break;
    case 'warden':
      table = 'wardens';
      idField = 'warden_id';
      break;
    default:
      return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const [users] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user[idField], role }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role, class: studentClass } = req.body;

  let table, idField, idPrefix, query;
  switch (role) {
    case 'student':
      table = 'students';
      idField = 'student_id';
      idPrefix = 'S';
      break;
    case 'advisor':
      table = 'advisors';
      idField = 'advisor_id';
      idPrefix = 'A';
      break;
    case 'warden':
      table = 'wardens';
      idField = 'warden_id';
      idPrefix = 'W';
      break;
    default:
      return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const [existing] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let id;

    const [users] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
    if (users[0].count === 0) {
      id = `${idPrefix}001`; // First user gets a fixed ID
    } else {
      id = `${idPrefix}${Math.floor(Math.random() * 1000) + 1}`; // Random ID for others
    }

    if (role === 'student') {
      const [advisors] = await db.query('SELECT advisor_id FROM advisors LIMIT 1');
      const advisor_id = advisors.length > 0 ? advisors[0].advisor_id : null; // Nullable if no advisors
      query = `INSERT INTO students (student_id, name, email, password, class, advisor_id, discipline_score) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await db.query(query, [id, name, email, hashedPassword, studentClass || 'N/A', advisor_id, 100]);
    } else if (role === 'advisor') {
      query = `INSERT INTO ${table} (${idField}, name, email, password, class) VALUES (?, ?, ?, ?, ?)`; 
      await db.query(query, [id, name, email, hashedPassword, studentClass || 'General']);
    } else {
      query = `INSERT INTO ${table} (${idField}, name, email, password) VALUES (?, ?, ?, ?)`; 
      await db.query(query, [id, name, email, hashedPassword]);
    }

    const token = jwt.sign({ id, role }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration: ' + error.message });
  }
};

module.exports = exports;
// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  // Validate request body
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    // Determine which table to query based on role
    let table;
    if (role === 'student') table = 'student';
    else if (role === 'advisor') table = 'advisor';
    else if (role === 'warden') table = 'warden';
    else return res.status(400).json({ error: 'Invalid role' });

    // Query the user by email
    const [users] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = users[0];

    // Check if the role matches
    if (user.role !== role) {
      return res.status(400).json({ error: `Role mismatch: expected ${role}, but user is ${user.role}` });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate request body
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  try {
    // Determine which table to insert into based on role
    let table;
    if (role === 'student') table = 'student';
    else if (role === 'advisor') table = 'advisor';
    else if (role === 'warden') table = 'warden';
    else return res.status(400).json({ error: 'Invalid role' });

    // Check if user already exists
    const [existingUsers] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      `INSERT INTO ${table} (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role]
    );

    // Generate JWT
    const token = jwt.sign({ id: result.insertId, role }, 'your_jwt_secret', {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: { id: result.insertId, email, role, name },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
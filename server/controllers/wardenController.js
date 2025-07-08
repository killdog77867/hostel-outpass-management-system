// controllers/wardenController.js
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const loginWarden = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email and password are required' 
    });
  }

  try {
    const [warden] = await db.query(
      'SELECT * FROM wardens WHERE email = ?', 
      [email]
    );

    if (!warden || warden.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Warden not found with this email' 
      });
    }

    // In production, use bcrypt.compare()
    if (password !== warden[0].password) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid password' 
      });
    }

    const token = jwt.sign(
      { 
        id: warden[0].warden_id,
        role: 'warden',
        email: warden[0].email
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: warden[0].warden_id,
          name: warden[0].name,
          email: warden[0].email,
          role: 'warden'
        }
      }
    });

  } catch (error) {
    console.error('Warden login error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = { loginWarden };
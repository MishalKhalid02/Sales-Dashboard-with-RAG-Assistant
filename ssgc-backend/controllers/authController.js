const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function signup(req, res) {
  const { username, password, fullName } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const [existing] = await pool.query(
      `SELECT id FROM users WHERE username = ?`,
      [username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)`,
      [username, passwordHash, fullName || null]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, username, password_hash FROM users WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { signup, login };
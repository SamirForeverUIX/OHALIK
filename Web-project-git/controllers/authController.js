// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, adminCode } = req.body;
    
    // Validation
    if (password !== confirmPassword) {
      return res.status(400).render('login', { 
        error: 'Passwords do not match' 
      });
    }
    
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).render('login', { 
        error: 'Email already registered' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Determine role
    let role = 'user';
    if (adminCode === 'your-secret-admin-code') {
      role = 'admin';
    }
    
    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    
    // Create empty profile
    await pool.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1)',
      [newUser.rows[0].id]
    );
    
    // Create JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    // Redirect to dashboard
    res.redirect('/dashboard');
    
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).render('login', { 
        error: 'Invalid credentials' 
      });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).render('login', { 
        error: 'Invalid credentials' 
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    // Redirect to dashboard
    res.redirect('/dashboard');
    
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Server error' });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};
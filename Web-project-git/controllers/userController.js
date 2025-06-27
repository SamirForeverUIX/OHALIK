// controllers/userController.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const upload = require('../utils/fileUpload');

// Get user dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Get user profile
    const profile = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    // Get user documents
    const documents = await pool.query(
      'SELECT * FROM user_documents WHERE user_id = $1',
      [req.user.id]
    );
    
    res.render('dashboard', {
      user: req.user,
      profile: profile.rows[0],
      documents: documents.rows
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, age, phone, address } = req.body;
    
    // Update user name
    await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2',
      [name, req.user.id]
    );
    
    // Update profile
    await pool.query(
      'UPDATE user_profiles SET bio = $1, age = $2, phone = $3, address = $4, updated_at = NOW() WHERE user_id = $5',
      [bio, age, phone, address, req.user.id]
    );
    
    res.redirect('/dashboard');
    
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).render('dashboard', { 
        error: 'Please select a file' 
      });
    }
    
    // Save document details
    await pool.query(
      'INSERT INTO user_documents (user_id, document_name, document_path, document_type) VALUES ($1, $2, $3, $4)',
      [req.user.id, req.file.originalname, req.file.path, req.file.mimetype]
    );
    
    res.redirect('/dashboard');
    
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).render('dashboard', { 
        error: 'New passwords do not match' 
      });
    }
    
    // Check current password
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
    
    if (!validPassword) {
      return res.status(400).render('dashboard', { 
        error: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.redirect('/dashboard');
    
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
};
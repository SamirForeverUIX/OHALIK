// middlewares/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.redirect('/login');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (user.rows.length === 0) {
      return res.redirect('/login');
    }
    
    req.user = user.rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
};

exports.isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  res.status(403).render('error', { 
    message: 'Access denied. Admin privileges required.' 
  });
};
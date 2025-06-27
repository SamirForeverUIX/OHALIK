// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/auth');

// Auth routes
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', isAuthenticated, authController.logout);

// In authRoutes.js
router.get('/status', (req, res) => {
  if (req.session.user) {
    return res.json({
      isLoggedIn: true,
      user: {
        id: req.session.user.id,
        name: req.session.user.firstName + ' ' + req.session.user.lastName,
        email: req.session.user.email,
        isAdmin: req.session.user.isAdmin
      }
    });
  } else {
    return res.json({
      isLoggedIn: false
    });
  }
});

module.exports = router;
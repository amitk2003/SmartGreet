const express = require('express');
const router = express.Router();
const { register, login, googleAuth, guestLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleAuth);

// POST /api/auth/guest
router.post('/guest', guestLogin);

// GET  /api/auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;

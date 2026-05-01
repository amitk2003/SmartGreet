const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, createCheckoutSession, subscribeSuccess, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

// GET    /api/users/profile
router.get('/profile', getProfile);

// PUT    /api/users/profile
router.put('/profile', updateProfile);

// POST   /api/users/subscribe
router.post('/subscribe', createCheckoutSession);

// POST   /api/users/subscribe-success
router.post('/subscribe-success', subscribeSuccess);

// DELETE /api/users/account
router.delete('/account', deleteAccount);

module.exports = router;

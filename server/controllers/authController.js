const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 * Create a new user account
 */
const register = async (req, res) => {
  try {
    const { name, email, password, photo } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered. Please sign in.' });
    }

    // Create new user (password gets hashed via pre-save hook)
    const user = await User.create({ name, email, password, photo, provider: 'email' });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

/**
 * POST /api/auth/login
 * Login with email + password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Fetch user WITH password (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

/**
 * POST /api/auth/google
 * Simulated Google OAuth login/register
 * (In production: verify Google ID token via google-auth-library)
 */
const googleAuth = async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Google profile data missing.' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, photo, provider: 'google' });
    } else {
      // Update name/photo if changed
      user.name = name;
      if (photo) user.photo = photo;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      message: `Welcome, ${user.name}!`,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Google authentication failed.' });
  }
};

/**
 * POST /api/auth/guest
 * Create a temporary guest session
 */
const guestLogin = async (req, res) => {
  try {
    // Create a guest user (no email/password)
    const guestName = `Guest_${Date.now().toString().slice(-5)}`;
    const guestEmail = `guest_${Date.now()}@claasplus.temp`;

    const user = await User.create({
      name: guestName,
      email: guestEmail,
      provider: 'guest',
    });

    const token = generateToken(user._id);

    res.json({
      message: 'Continuing as guest.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Guest login failed.' });
  }
};

/**
 * GET /api/auth/me
 * Get current logged-in user (protected route)
 */
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, googleAuth, guestLogin, getMe };

const User = require('../models/User');

/**
 * GET /api/users/profile
 * Get the current user's profile
 */
const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

/**
 * PUT /api/users/profile
 * Update the current user's name and/or photo
 */
const updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    }

    const user = await User.findById(req.user._id);
    user.name = name.trim();
    if (photo !== undefined) user.photo = photo;

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

/**
 * POST /api/users/subscribe
 * Create Stripe Checkout Session
 */
const createCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      // Fallback for local testing without a real Stripe key
      return res.json({ url: `${process.env.CLIENT_URL}/?success=true` });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'ClaasPlus Premium',
              description: 'Unlimited HD Cards, Premium Templates & AI Wish Generator',
            },
            unit_amount: 9900, // ₹99.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/?canceled=true`,
      client_reference_id: req.user._id.toString(),
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ message: 'Failed to create payment session.' });
  }
};

/**
 * POST /api/users/subscribe-success
 * Confirm payment and activate premium
 */
const subscribeSuccess = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isPremium = true;
    user.premiumSince = new Date();
    await user.save();

    res.json({
      message: '🎉 Premium activated! All templates unlocked.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Subscription confirmation failed.' });
  }
};

/**
 * DELETE /api/users/account
 * Delete user account
 */
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account.' });
  }
};

module.exports = { getProfile, updateProfile, createCheckoutSession, subscribeSuccess, deleteAccount };

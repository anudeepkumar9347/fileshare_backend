const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

// REGISTER
router.post(
  '/register',
  authLimiter,
  [
    body('username').isString().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      console.log("🔐 Register request body:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // No hashing here! Let the model handle it
      const user = new User({ username, password });
      await user.save();

      console.log("✅ User registered:", user.username);
      res.json({ message: 'User registered successfully' });
    } catch (err) {
      console.error("❌ Register error:", err.stack || err.message || err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// LOGIN
router.post(
  '/login',
  authLimiter,
  [
    body('username').isString().trim().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      console.log("🔑 Login request body:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const isMatch = await user.comparePassword(password);
      console.log(`✅ Password match: ${isMatch}`);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } catch (err) {
      console.error("❌ Login error:", err.stack || err.message || err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

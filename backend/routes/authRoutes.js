const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("⚠️ User already exists:", username);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ username, password });
        const savedUser = await user.save();
        console.log("✅ User saved:", savedUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("❌ Registration error:", err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error("❌ Login error:", err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("🔐 Register request body:", req.body);

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });

        await user.save();
        console.log("✅ User registered:", user.username);

        res.json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("❌ Register error:", err.stack || err.message || err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("🔑 Login request body:", req.body);

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
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
});

module.exports = router;

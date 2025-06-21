const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt for compatibility
const User = require('../models/User');
const router = express.Router();

// Load secret from env
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecret';


// Register Route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
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

        res.json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});


// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;

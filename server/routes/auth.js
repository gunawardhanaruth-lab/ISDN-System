const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'isdn_secret_key';

// Register Customer
router.post('/register', (req, res) => {
    const { name, email, password, contactNo, address } = req.body;

    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ error: 'Email already exists' });

        const id = uuidv4();
        const hashedPassword = bcrypt.hashSync(password, 10);
        const role = 'customer';

        db.run(`INSERT INTO users (id, name, email, password, role, contact_no, address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, hashedPassword, role, contactNo, address],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role, region: user.address }, JWT_SECRET, { expiresIn: '8h' });

        // Set Cookie
        res.cookie('token', token, { httpOnly: true, secure: false }); // Secure false for localhost

        // Return User Info (excluding password)
        const { password: _, ...userInfo } = user;
        res.json({ user: userInfo, token });
    });
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;

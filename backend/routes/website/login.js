const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../../config/db');

const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

router.post('/google-login', async (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {
            sub: googleId,
            email,
            email_verified,
            given_name,
            family_name
        } = payload;

        if (!email_verified) {
            return res.status(400).json({ message: 'Email not verified by Google' });
        }

        const fullName = `${given_name} ${family_name}`;

        db.query(
            'SELECT * FROM website_users WHERE email = ?',
            [email],
            async (err, results) => {
                if (err) return res.status(500).json({ message: err.message });

                // ✅ USER EXISTS
                if (results.length > 0) {
                    const user = results[0];

                    if (!user.google_id) {
                        db.query(
                            'UPDATE website_users SET google_id = ? WHERE id = ?',
                            [googleId, user.id]
                        );
                    }

                    const tokenJWT = jwt.sign(
                        { id: user.id, email },
                        process.env.JWT_SECRET,
                        { expiresIn: '1d' }
                    );

                    return res.json({
                        message: 'Google login successful',
                        token: tokenJWT,
                        email,
                        firstName: given_name,
                        lastName: family_name,
                    });
                }

                // ✅ NEW USER
                const defaultPassword = await bcrypt.hash(
                    Math.random().toString(36).slice(-8),
                    10
                );

                db.query(
                    'INSERT INTO website_users (firstName, lastName, email, password, google_id) VALUES (?, ?, ?, ?, ?)',
                    [given_name, family_name, email, defaultPassword, googleId],
                    (err, result) => {
                        if (err) return res.status(500).json({ message: err.message });

                        const userId = result.insertId;

                        // ✅ INSERT INTO patients
                        db.query(
                            'INSERT INTO patients ( name, email, google_id) VALUES (?, ?, ?)',
                            [fullName, email, googleId],
                            (err) => {
                                if (err) console.error(err);
                            }
                        );

                        const tokenJWT = jwt.sign(
                            { id: userId, email },
                            process.env.JWT_SECRET,
                            { expiresIn: '1d' }
                        );

                        res.json({
                            message: 'Google signup successful',
                            token: tokenJWT,
                            email,
                            firstName: given_name,
                            lastName: family_name,
                        });
                    }
                );
            }
        );
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: `error: ${err.message}` });
    }
});

router.post('/signup', async (req, res) => {
    const { firstName, middleName, lastName, contactNumber, gender, birthday, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${firstName} ${middleName} ${lastName}`;
    const age = new Date().getFullYear() - new Date(birthday).getFullYear();

    const validationError = (() => {
        if (!birthday || age < 0 || isNaN(age)) return 'Invalid birthday';

        const normalizedGender = (gender || '').toLowerCase();
        if (!['male', 'female', 'other'].includes(normalizedGender)) return 'Invalid gender';

        if (!email || !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) return 'Invalid email format';

        if (!password || password.length < 6) return 'Password must be at least 6 characters';

        if (!firstName || !lastName) return 'First and last name are required';

        return null;
    })();

    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    // Check if email already exists before inserting
    db.query('SELECT id FROM website_users WHERE email = ? LIMIT 1', [email], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        if (rows.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const quer = `INSERT INTO website_users (firstName, middleName, lastName, email, gender, password) VALUES (?, ?, ?, ?, ?, ?)`;

        db.query(quer, [firstName, middleName, lastName, email, gender, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            
            // Only insert into patients after first insert succeeds
            const q = 'INSERT INTO patients (name, email, contact_number, age, gender) VALUES (?, ?, ?, ?, ?)';
            db.query(q, [name, email, contactNumber, age, gender], (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    });
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query(
        'SELECT * FROM website_users WHERE email = ?',
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ message: err.message });
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user. id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            res.json({
                message: 'Login successful',
                token,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                id: user.id,
            });
        }
    );
});

module.exports = router;

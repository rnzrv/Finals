const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../../config/db');
const crypto = require('crypto');
const transporter = require('../../utils/mail');

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

// Forgot Password: send reset link
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    db.query('SELECT id, firstName FROM website_users WHERE email = ? LIMIT 1', [email], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        if (rows.length === 0) return res.status(200).json({ message: 'If the email exists, a reset link was sent' });

        const user = rows[0];
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        db.query(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
            [user.id, tokenHash, expiresAt],
            (err2) => {
                if (err2) return res.status(500).json({ message: err2.message });

                const frontendBase = process.env.WEBSITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
                const resetLink = `${frontendBase}/reset-password/${rawToken}`;

                const mailOptions = {
                    from: `"Beauwitty" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Password Reset Request',
                    html: `
                        <p>Hello ${user.firstName || ''},</p>
                        <p>You requested a password reset. Click the link below to set a new password. This link will expire in 1 hour.</p>
                        <p><a href="${resetLink}">Reset Password</a></p>
                        <p>If you didn't request this, please ignore this email.</p>
                    `,
                };

                transporter.sendMail(mailOptions, (mailErr) => {
                    if (mailErr) {
                        console.error('Email error:', mailErr);
                        return res.status(500).json({ message: 'Failed to send reset email' });
                    }
                    res.status(200).json({ message: 'If the email exists, a reset link was sent' });
                });
            }
        );
    });
});

// Reset Password: consume token and set new password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        db.query(
            'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used = 0 AND expires_at > NOW() LIMIT 1',
            [tokenHash],
            async (err, rows) => {
                if (err) return res.status(500).json({ message: err.message });
                if (rows.length === 0) return res.status(400).json({ message: 'Invalid or expired token' });

                const record = rows[0];
                const hashed = await bcrypt.hash(password, 10);

                db.beginTransaction((txErr) => {
                    if (txErr) return res.status(500).json({ message: txErr.message });

                    db.query(
                        'UPDATE website_users SET password = ? WHERE id = ?',
                        [hashed, record.user_id],
                        (uErr) => {
                            if (uErr) {
                                return db.rollback(() => res.status(500).json({ message: uErr.message }));
                            }

                            db.query(
                                'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
                                [record.id],
                                (tErr) => {
                                    if (tErr) {
                                        return db.rollback(() => res.status(500).json({ message: tErr.message }));
                                    }
                                    db.commit((cErr) => {
                                        if (cErr) {
                                            return db.rollback(() => res.status(500).json({ message: cErr.message }));
                                        }
                                        res.status(200).json({ message: 'Password reset successful' });
                                    });
                                }
                            );
                        }
                    );
                });
            }
        );
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;

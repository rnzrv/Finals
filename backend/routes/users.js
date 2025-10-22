const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// ADD USER SIGN UP
router.post('/user', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const q = "INSERT INTO users (userType, username, password) VALUES (?, ?, ?)";
    router.db.query(q, [req.body.userType, req.body.username, hashedPassword], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(201).json({ message: 'User created successfully' });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// USER LOGIN AUTHENTICATION
router.post('/user/login', async (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";
  router.db.query(q, [req.body.username], async (err, result) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (result.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    try {
      const user = result[0];
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

      // Create tokens
      const accessToken = jwt.sign(
        { id: user.id, userType: user.userType, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, userType: user.userType, username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Store refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
      });

      // Also store access token securely
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.json({ message: 'Login successful' });
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// REFRESH TOKEN ROUTE
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: decoded.id, userType: decoded.userType, username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  });
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", { sameSite: "Strict", secure: true });
  res.clearCookie("refreshToken", { sameSite: "Strict", secure: true });
  res.json({ message: "Logged out successfully" });
});

module.exports = (db) => {
  router.db = db;
  return router;
};

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db'); // ✅ Import shared DB connection

// ADD USER SIGN UP
router.post('/user', async (req, res) => {
  try {

    const { username, userType, password, confirmPassword } = req.body;
    if (!username ){
      return res.status(400).json({ error: 'Username is required' });
    
    }

    if(!password || !confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password are required' });
    }

    if(!userType){
      return res.status(400).json({ error: 'User type is required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const q = "INSERT INTO users (userType, username, password) VALUES (?, ?, ?)";
    db.query(q, [req.body.userType, req.body.username, hashedPassword], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(201).json({ message: 'User created successfully' });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/user/:id', async (req, res) => {
  try {
    const { username, userType, password } = req.body;
    if (!username || !userType) {
      return res.status(400).json({ error: 'Username and User Type are required' });
    }
    let updateFields = [userType, username];
    let q = "UPDATE users SET userType = ?, username = ?";
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      q += ", password = ?";
      updateFields.push(hashedPassword);
    }
    q += " WHERE userId = ?";
    updateFields.push(req.params.id);
    db.query(q, updateFields, (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ message: 'User updated successfully' });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});


router.get('/users', (req, res) => {
  const q = "SELECT userId, userType, username FROM users";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json(data);
  });
});

// USER LOGIN AUTHENTICATION
router.post('/user/login', async (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], async (err, result) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (result.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

    try {
      const user = result[0];
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

      // Create tokens
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.userType }, // include role
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, username: user.username, role: user.userType },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Store tokens in cookies
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      // Send access token and role in response
      res.json({ message: '✅ Login successful', accessToken, role: user.userType });
    } catch (error) {
      console.error(error);
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

router.delete('/user/:id', (req, res) => {
  const q = "DELETE FROM users WHERE userId = ?";
  db.query(q, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ message: 'User deleted successfully' });
  });
});


router.get('/user/logo', (req, res) => {
  // Return the saved business logo URL (alias column to match response key)
  const q = "SELECT logo AS logoUrl FROM business_profile LIMIT 1";
  db.query(q, (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    if (result.length === 0) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    return res.json({ logoUrl: result[0].logoUrl });
  });
});
module.exports = router;

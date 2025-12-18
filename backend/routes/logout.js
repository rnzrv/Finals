const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');

router.post('/logout', verifyToken, (req, res) => {
  return res.status(200).json({ message: 'Logged out' });
});


module.exports = router;
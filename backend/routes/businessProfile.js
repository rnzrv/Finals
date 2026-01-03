const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/logo'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `logo-${Date.now()}-${Math.floor(Math.random() * 1000000)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPG, JPEG, and GIF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Get current business profile (single row)
router.get('/', verifyToken, (req, res) => {
  const q = 'SELECT * FROM business_profile LIMIT 1';
  db.query(q, (err, rows) => {
    if (err) {
      console.error('Error fetching business profile:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    return res.json(rows[0] || null);
  });
});

// Create or update business profile with file upload (upsert single row)
router.put('/', verifyToken, upload.single('logo'), (req, res) => {
  const { business_name, address, contact_number, email } = req.body;

  if (!business_name || !address || !contact_number || !email) {
    return res.status(400).json({ error: 'business_name, address, contact_number, and email are required' });
  }

  let logoPath = req.file ? `uploads/logo/${req.file.filename}` : null;

  // Check if a profile already exists
  const selectQ = 'SELECT id, logo FROM business_profile LIMIT 1';
  db.query(selectQ, (err, rows) => {
    if (err) {
      console.error('Error checking business profile:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (rows.length > 0) {
      const { id, logo: oldLogo } = rows[0];
      
      // If no new logo, keep the old one
      if (!logoPath) {
        logoPath = oldLogo;
      }

      const updateQ = `
        UPDATE business_profile
        SET business_name = ?, address = ?, contact_number = ?, email = ?, logo = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      db.query(updateQ, [business_name, address, contact_number, email, logoPath, id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating business profile:', updateErr);
          return res.status(500).json({ error: 'Database error' });
        }
        return res.json({ message: 'Business profile updated successfully', id, logo: logoPath });
      });
    } else {
      const insertQ = `
        INSERT INTO business_profile (business_name, address, contact_number, email, logo)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(insertQ, [business_name, address, contact_number, email, logoPath], (insertErr, result) => {
        if (insertErr) {
          console.error('Error creating business profile:', insertErr);
          return res.status(500).json({ error: 'Database error' });
        }
        return res.status(201).json({ message: 'Business profile created successfully', id: result.insertId, logo: logoPath });
      });
    }
  });
});

module.exports = router;

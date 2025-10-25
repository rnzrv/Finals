const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');

// Route to set a new appointment
router.post('/setAppointment', verifyToken, (req, res) => {
  const { patient_id, doctor, date, time, service_type, status, notes } = req.body;

  // Required fields check
  if (!patient_id || !doctor || !date || !time || !service_type || !status) {
    return res.status(400).json({ error: 'All fields except notes are required' });
  }

  // Validate formats
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!dateRegex.test(date) || isNaN(new Date(date).getTime())) {
    return res.status(400).json({ error: 'Please enter a valid date in YYYY-MM-DD format' });
  }
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: 'Please enter a valid time in HH:MM format (24-hour)' });
  }

  // Check for existing appointments
  const checkQuery = 'SELECT * FROM appointments WHERE patient_id = ? AND date = ? AND time = ?';
  db.query(checkQuery, [patient_id, date, time], (err, existingAppointments) => {
    if (err) {
      console.error('Error checking appointments:', err);
      return res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
    }
    if (existingAppointments.length > 0) {
      return res.status(409).json({ error: 'An appointment already exists for this patient, date, and time' });
    }

    // Insert new appointment
    const q = 'INSERT INTO appointments (patient_id, doctor, date, time, service_type, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(q, [patient_id, doctor, date, time, service_type, status, notes || null], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(201).json({ message: 'Appointment scheduled successfully' });
    });
  });
});

// New route to get patient name by patient_id


module.exports = router;
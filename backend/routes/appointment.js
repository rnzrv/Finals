const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');

// ============================
// 1️⃣  Set a New Appointment
// ============================
router.post('/setAppointment', verifyToken, (req, res) => {
  const { patient_id, doctor, date, time, service_type, status, notes } = req.body;

  if (!patient_id || !doctor || !date || !time || !service_type || !status) {
    return res.status(400).json({ error: 'All fields except notes are required' });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!dateRegex.test(date) || isNaN(new Date(date).getTime())) {
    return res.status(400).json({ error: 'Please enter a valid date in YYYY-MM-DD format' });
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: 'Please enter a valid time in HH:MM format (24-hour)' });
  }

  // Check for duplicate appointment (same patient/date/time)
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
    const q = `
      INSERT INTO appointments (patient_id, doctor, date, time, service_type, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(q, [patient_id, doctor, date, time, service_type, status, notes || null], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(201).json({ message: 'Appointment scheduled successfully' });
    });
  });
});


// ============================
// 2️⃣  Get Appointment History
// ============================
router.get('/history/:id', (req, res) => {
  const patientId = req.params.id;
  const q = `
    SELECT p.name, a.date, a.time, a.service_type
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.patient_id = ?
    ORDER BY a.date DESC
  `;

  db.query(q, [patientId], (err, data) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(data);
  });
});

module.exports = router;

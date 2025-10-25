const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');

// Validate if date is within the current year
function isWithinCurrentYear(dateString) {
  const inputDate = new Date(dateString);
  const currentYear = new Date().getFullYear();
  return inputDate.getFullYear() === currentYear;
}

router.get('/getPatients', verifyToken, (req, res) => {
  const q = "SELECT * FROM patients";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json(data);
  });
});

router.post('/addPatient', verifyToken, (req, res) => {
  const { name, email, number, last_visit } = req.body;

  if (!name || !email || !number || !last_visit) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate email, phone, name formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const phoneRegex = /^(?:\+639|09|639)\d{9}$/;
  if (!phoneRegex.test(number)) {
    return res.status(400).json({ error: 'Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX' });
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ error: 'Name can only contain letters, spaces, hyphens, or apostrophes' });
  }

  // Validate date in YYYY-MM-DD format
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!dateRegex.test(last_visit) || isNaN(new Date(last_visit).getTime())) {
    return res.status(400).json({ error: `Please enter a valid date in YYYY-MM-DD format (e.g., ${new Date().getFullYear()}-01-01)` });
  }

  if (!isWithinCurrentYear(last_visit)) {
    return res.status(400).json({ error: `Date must be within ${new Date().getFullYear()}` });
  }

  // Check duplicates
  const checkQuery = 'SELECT * FROM patients WHERE email = ? OR number = ?';
  db.query(checkQuery, [email, number], (err, existingPatients) => {
    if (err) {
      console.error('Error checking duplicates:', err);
      return res.status(500).json({ error: err.sqlMessage || 'An unexpected error occurred' });
    }

    if (existingPatients.length > 0) {
      const duplicates = [];
      if (existingPatients.some((p) => p.name === name)) duplicates.push('This name is already in use');
      if (existingPatients.some((p) => p.email === email)) duplicates.push('This email is already registered');
      if (existingPatients.some((p) => p.number === number)) duplicates.push('This phone number is already in use');
      return res.status(409).json({ error: duplicates.join(', ') });
    }

    // Insert new patient
    const insertQuery = 'INSERT INTO patients (name, email, number, last_visit) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, email, number, last_visit], (err) => {
      if (err) {
        console.error('Error adding patient:', err);
        return res.status(500).json({ error: err.sqlMessage || 'An unexpected error occurred' });
      }
      return res.status(201).json({ message: 'Patient added successfully' });
    });
  });
});

router.put('/updatePatient/:id', verifyToken, (req, res) => {
  const patientID = req.params.id;
  const { name, email, number, last_visit } = req.body;

  if (!name || !email || !number || !last_visit) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const phoneRegex = /^(?:\+639|09|639)\d{9}$/;
  if (!phoneRegex.test(number)) {
    return res.status(400).json({ error: 'Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX' });
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ error: 'Name can only contain letters, spaces, hyphens, or apostrophes' });
  }

  // Validate date in YYYY-MM-DD format
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!dateRegex.test(last_visit) || isNaN(new Date(last_visit).getTime())) {
    return res.status(400).json({ error: `Please enter a valid date in YYYY-MM-DD format (e.g., ${new Date().getFullYear()}-01-01)` });
  }

  if (!isWithinCurrentYear(last_visit)) {
    return res.status(400).json({ error: `Date must be within ${new Date().getFullYear()}` });
  }

  // Check duplicates
  const checkQuery = 'SELECT * FROM patients WHERE (email = ? OR number = ?) AND id != ?';
  db.query(checkQuery, [email, number, patientID], (err, existingPatients) => {
    if (err) {
      console.error('Error checking duplicates:', err);
      return res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
    }

    if (existingPatients.length > 0) {
      const duplicates = [];
      if (existingPatients.some((p) => p.email === email)) duplicates.push('email');
      if (existingPatients.some((p) => p.number === number)) duplicates.push('number');
      return res.status(409).json({ error: `The following fields are already in use: ${duplicates.join(', ')}` });
    }

    const q = "UPDATE patients SET name = ?, email = ?, number = ?, last_visit = ? WHERE id = ?";
    db.query(q, [name, email, number, last_visit, patientID], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.json({ message: "Patient updated successfully" });
    });
  });
});

router.delete('/deletePatient/:id', verifyToken, (req, res) => {
  const patientID = req.params.id;
  const q = "DELETE FROM patients WHERE id = ?";
  db.query(q, [patientID], (err) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json({ message: "Patient deleted successfully" });
  });
});

module.exports = router;
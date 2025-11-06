const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');

// Validate if date is within the current year (for future use)
// function isWithinCurrentYear(dateString) {
//   const inputDate = new Date(dateString);
//   const currentYear = new Date().getFullYear(); // 2025
//   return inputDate.getFullYear() === currentYear && !isNaN(inputDate.getTime());
// }

router.get('/getPatients', verifyToken, (req, res) => {
  const q = "SELECT * FROM patients";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json(data);
  });
});

router.post('/addPatient', verifyToken, (req, res) => {
  const { name, email, contact_number, age, gender, medical_notes, status} = req.body;

  // Required fields check
  if (!name || !email || !contact_number) {
    return res.status(400).json({ error: 'Name, email, and contact number are required' });
  }

  // Validate formats
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ error: 'Name can only contain letters, spaces, hyphens, or apostrophes' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  const phoneRegex = /^(?:\+639|09|639)\d{9}$/;
  if (!phoneRegex.test(contact_number)) {
    return res.status(400).json({ error: 'Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX' });
  }

  // Optional validation for age
  if (age && (isNaN(age) || age < 0 || age > 150)) {
    return res.status(400).json({ error: 'Age must be a valid number between 0 and 150' });
  }

  // Optional validation for gender
  const validGenders = ['Male', 'Female', 'Other'];
  if (gender && !validGenders.includes(gender)) {
    return res.status(400).json({ error: 'Gender must be Male, Female, or Other' });
  }

  // Check duplicates
  const checkQuery = 'SELECT * FROM patients WHERE email = ? OR contact_number = ?';
  db.query(checkQuery, [email, contact_number], (err, existingPatients) => {
    if (err) {
      console.error('Error checking duplicates:', err);
      return res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
    }
    if (existingPatients.length > 0) {
      const duplicates = [];
      if (existingPatients.some((p) => p.email === email)) duplicates.push('email');
      if (existingPatients.some((p) => p.contact_number === contact_number)) duplicates.push('contact number');
      return res.status(409).json({ error: `The following fields are already in use: ${duplicates.join(', ')}` });
    }

    const q = "INSERT INTO patients (name, email, contact_number, age, gender, medical_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(q, [name, email, contact_number, age || null, gender || null, medical_notes || null, 'active'], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(201).json({ message: 'Patient added successfully' }); // Use 201 for creation
    });
  });
});


router.put('/updatePatient/:id', verifyToken, (req,res) => {
  const patientID = req.params.id;
  const {name, email, contact_number, age, gender, medical_notes, status} =  req.body;

  if (!name || !email || !contact_number) {
    return res.status(400).json({ error: 'Name, email, and contact number are required' });
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ error: 'Name can only contain letters, spaces, hyphens, or apostrophes' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  const phoneRegex = /^(?:\+639|09|639)\d{9}$/;
  if (!phoneRegex.test(contact_number)) {
    return res.status(400).json({ error: 'Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX' });
  }

  // Optional validation for age
  if (age && (isNaN(age) || age < 0 || age > 150)) {
    return res.status(400).json({ error: 'Age must be a valid number between 0 and 150' });
  }

  // Optional validation for gender
  const validGenders = ['Male', 'Female', 'Other'];
  if (gender && !validGenders.includes(gender)) {
    return res.status(400).json({ error: 'Gender must be Male, Female, or Other' });
  }

  const checkQuery = 'SELECT * FROM patients WHERE (email = ? OR contact_number = ?) AND id != ?';
  db.query(checkQuery, [email, contact_number, patientID], (err, existingPatients) => {
    if (err) {
      console.error('Error checking duplicates:', err);
      return res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
    }

    if (existingPatients.length > 0) {
      const duplicates = [];
      if (existingPatients.some((p) => p.email === email)) duplicates.push('email');
      if (existingPatients.some((p) => p.contact_number === contact_number)) duplicates.push('contact number');
      return res.status(409).json({ error: `The following fields are already in use: ${duplicates.join(', ')}` });
    }

  const q = "UPDATE patients SET name = ?, email = ?, contact_number = ?, age = ?, gender = ?, medical_notes = ?, status = ? WHERE id = ?";
  db.query(q, [name, email, contact_number, age, gender, medical_notes, status, patientID], (err) => {
    if (err) return  res.status(500).json({ error: err.sqlMessage });
    return res.json({ message: "Patient updated successfully" });

  });
});
})

router.get('/getPatientsdata/:patientId', verifyToken, (req, res) => {
  const { patientId } = req.params;
  const q = 'SELECT name, email, contact_number FROM patients WHERE id = ?';
  db.query(q, [patientId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    if (results.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(results[0]); // returns { name, email, contact_number }
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
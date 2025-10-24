const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');



router.get('/getPatients', verifyToken,(req,res) => {
  const q = "SELECT * FROM patients";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json(data);
  });

})

router.post('/addPatient', verifyToken, (req, res) => {
  const { name, email, number, last_visit } = req.body;

  // Validate input
  if (!name || !email || !number || !last_visit) {
    return res.status(400).json({ error: 'All fields are required' });
  }

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

  if (isNaN(new Date(last_visit).getTime())) {
    return res.status(400).json({ error: 'Please enter a valid date' });
  }

  // Check for duplicates
  const checkQuery = 'SELECT * FROM patients WHERE email = ? OR number = ?';
  db.query(checkQuery, [email, number], (err, existingPatients) => {
    if (err) {
      console.error('Error checking duplicates:', err);
      return res.status(500).json({ error: err.sqlMessage || 'An unexpected error occurred' });
    }

    if (existingPatients.length > 0) {
      const duplicates = [];
      if (existingPatients.some((patient) => patient.name === name)) {
        duplicates.push('This name is already in use');
      }
      if (existingPatients.some((patient) => patient.email === email)) {
        duplicates.push('This email is already registered');
      }
      if (existingPatients.some((patient) => patient.number === number)) {
        duplicates.push('This phone number is already in use');
      }
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


router.put('/updatePatient/:id', verifyToken, async (req,res)=> {
  const patientID = req.params.id;
  const {name, email, number, last_visit} = req.body;


   const checkQuery = 'SELECT * FROM patients WHERE (email = ? OR number = ?) AND id != ?';
  db.query(checkQuery, [email, number, patientID], (err, existingPatients) => {
    if (err) {
      console.error('Error checking duplicates:', err);
      return res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
    }

    if (existingPatients.length > 0) {
      const duplicates = [];
      if (existingPatients.some((patient) => patient.email === email)) duplicates.push('email');
      if (existingPatients.some((patient) => patient.number === number)) duplicates.push('number');
      return res.status(409).json({ error: `The following fields are already in use: ${duplicates.join(', ')}` });
    }

  const q = "UPDATE patients SET name = ?, email = ?, number = ?, last_visit = ? WHERE id = ?";
  db.query(q, [name,email,number,last_visit,patientID], (err, data)=> {
    if (err) return  res.status(500).json({ error: err.sqlMessage });
    return res.json({ message: "Patient updated successfully" });
  })
});
})


router.delete('deletePatient/:id', verifyToken, (req,res) => {
  const patientID = req.params.id;
  const q = "DELETE FROM patients WHERE id = ?";
  db.query(q, [patientID], (err,data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json({ message: "Patient deleted successfully" });
  })
})

module.exports = router;
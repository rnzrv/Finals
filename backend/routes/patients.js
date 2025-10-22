const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

router.get('/', authenticateToken, (req, res) => {
  const q = "SELECT * FROM patients";
  req.db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json(data);
  });
});

router.post('/addPatient', authenticateToken, (req, res) => {
  const { name, email, number, last_visit } = req.body;
  const check = "SELECT * FROM patients WHERE name = ? OR email = ? OR number = ?";
  const q = "INSERT INTO patients (name, email, number, last_visit) VALUES (?, ?, ?, ?)";

  req.db.query(check, [name, email, number], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    if (result.length > 0) {
      return res.status(409).json({ error: "Patient already exists check your input data" });
    }
    req.db.query(q, [name, email, number, last_visit], (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(200).json({ message: "Patient added successfully!" });
    });
  });
});

router.put('/editPatient/:id', authenticateToken, (req, res) => {
  const patientId = req.params.id;
  const { name, email, number, last_visit } = req.body;
  const q = "UPDATE patients SET name = ?, email = ?, number = ?, last_visit = ? WHERE id = ?";

  req.db.query(q, [name, email, number, last_visit, patientId], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.status(200).json({ message: "Patient updated successfully!" });
  });
});

module.exports = (db) => {
  router.db = db;
  return router;
};
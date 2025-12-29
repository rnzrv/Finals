const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../../config/db');
const webVerifyToken = require('../../middleware/websiteMiddleware');


router.get('/getServices', (req, res) => {
    const q = "SELECT serviceId, serviceName, logo, description, price FROM services";
    

    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(data);
    });
})



router.post('/website-appointment', webVerifyToken, (req, res) => {
  const userId = req.user.id; // website user id
  const { serviceAvailed, preferredDate, preferredTime } = req.body;

  if (!serviceAvailed || !preferredDate || !preferredTime) {
    return res.status(400).json({ message: "Cannot get the required fields" });
  }

  if (new Date(preferredDate) < new Date()) {
    return res.status(400).json({ message: "Cannot book appointment on a past date" });
  }

  // 1️⃣ Check if patient exists
  db.query("SELECT id FROM patients WHERE user_id = ?", [userId], (err, patients) => {
    if (err) return res.status(500).json(err);

    const insertRequest = (patientId) => {
      const q = `
        INSERT INTO requests (patient_id, service_requested, preferred_date, preferred_time)
        VALUES (?, ?, ?, ?)
      `;
      db.query(q, [patientId, serviceAvailed, preferredDate, preferredTime], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: "Appointment booked successfully" });
      });
    };

    if (patients.length > 0) {
      // Patient exists
      insertRequest(patients[0].id);
    } else {
      // Patient doesn't exist → create one
      db.query("SELECT * FROM website_users WHERE id = ?", [userId], (err, users) => {
        if (err || users.length === 0) return res.status(404).json({ message: "User not found" });

        const user = users[0];
        const patientName = `${user.firstName} ${user.lastName}`;

        db.query(
          "INSERT INTO patients (name, email, gender, user_id) VALUES (?, ?, ?, ?)",
          [patientName, user.email, user.gender, user.id],
          (err, result) => {
            if (err) return res.status(500).json(err);

            insertRequest(result.insertId); // now insert into requests
          }
        );
      });
    }
  });
});

// Add this test endpoint temporarily
router.get('/getScheduledAppointments', webVerifyToken, (req, res) => {
    const userId = req.user.id;

    const q = `
        SELECT 
            s.serviceId, 
            s.serviceName, 
            s.logo, 
            s.price,
            r.id AS requestId,
            DATE_FORMAT(r.preferred_date, '%Y-%m-%d') AS preferred_date,
            DATE_FORMAT(r.preferred_time, '%h:%i %p') AS preferred_time,
            r.status
        FROM requests r
        INNER JOIN services s ON r.service_requested = s.serviceId
        WHERE r.patient_id IN (
            SELECT id FROM patients WHERE user_id = ?
        )
    `;

    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(data);
    });
});




module.exports = router;

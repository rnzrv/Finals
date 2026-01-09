const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');


router.post('/setAppointment', verifyToken, (req, res) => {
  const { patient_id, date, time, service_type, status, notes } = req.body;

  if (!patient_id || !date || !time || !service_type ) {
    return res.status(400).json({ error: 'All fields except notes are required' });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!dateRegex.test(date) || isNaN(new Date(date).getTime())) {
    return res.status(400).json({ error: 'Please enter a valid date in YYYY-MM-DD format' });
  }

  if (new Date(date) < new Date().setHours(0,0,0,0)) {
    return res.status(400).json({ error: 'Appointment date cannot be in the past' });
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: 'Please enter a valid time in HH:MM format (24-hour)' });
  }

  // Validate that service_type is a valid service ID
  const serviceCheckQuery = 'SELECT serviceId FROM services WHERE serviceId = ?';
  db.query(serviceCheckQuery, [service_type], (err, serviceResult) => {
    if (err) {
      console.error('Error checking service:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (serviceResult.length === 0) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    // Check for duplicate appointment (same patient/date/time/service) and any time slot conflicts
    const checkQuery = `
      SELECT id, patient_id, service_type
      FROM appointments
      WHERE date = ? AND time = ?
    `;
    db.query(checkQuery, [date, time], (err, existingAppointments) => {
    if (err) {
      console.error('Error checking appointments:', err);
      return res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
    }

    const incomingPatientId = String(patient_id);

    const slotForSamePatient = existingAppointments.some(
      (a) => String(a.patient_id) === incomingPatientId
    );
    if (slotForSamePatient) {
      return res.status(409).json({ error: 'You already have an appointment at this date and time' });
    }

      if (existingAppointments.length > 0) {
        return res.status(409).json({ error: 'That time slot is already booked' });
      }

      // Insert new appointment with serviceName
      const q = `
        INSERT INTO appointments (patient_id, date, time, service_type, notes)
        VALUES (?, ?, ?, (SELECT serviceName FROM services WHERE serviceId = ?), ?)
      `;
      db.query(q, [patient_id, date, time, service_type, notes || null], (err) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        return res.status(201).json({ message: 'Appointment scheduled successfully' });
      });
    });
  });
});



// 2️⃣  Get Appointment History


router.get('/history/:id', (req, res) => {
  const patientId = req.params.id;
  const q = `
    SELECT 
      p.name, 
      a.date, 
      a.time, 
      COALESCE(s.serviceName, a.service_type) AS service_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN services s ON a.service_type = s.serviceId
    WHERE a.patient_id = ?
    ORDER BY a.date DESC
  `;

  db.query(q, [patientId], (err, data) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(data);
  });
});


// =====Last Visit===
router.get('/lastVisit/:id', (req, res) => {
  const patientId = req.params.id;
  const q = `SELECT MAX(date) AS last_visit FROM appointments WHERE patient_id = ?`;

  db.query(q, [patientId], (err, data) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ last_visit: data[0]?.last_visit || null });
  });
});


// ==== Stats === (total patients, schduled today, new this week)

router.get('/stats', verifyToken, (req,res) => {
  const totalPatientsQuery = 'SELECT COUNT(*) AS total_patients FROM patients';
  const scheduledTodayQuery = `
    SELECT COUNT(*) AS scheduled_today 
    FROM appointments 
    WHERE date = CURDATE()
  `;
  const newThisWeekQuery = `
    SELECT COUNT(*) AS new_this_week 
    FROM patients 
    WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  `;


  db.query(totalPatientsQuery, (err, totalPatientsResult) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    db.query(scheduledTodayQuery, (err, scheduledTodayResult) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      db.query(newThisWeekQuery, (err, newThisWeekResult) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({
          total_patients: totalPatientsResult[0].total_patients,
          scheduled_today: scheduledTodayResult[0].scheduled_today,
          new_this_week: newThisWeekResult[0].new_this_week,
        });
      });
    });
  });
});


// appointment page calendar

/* [
  {
    "doctorName": "Dr. John Doe",
    "sessionType": "Session 1",
    "patient": "Marvelous Jaco",
    "date": "2025-11-05",
    "time": "10:00 PM",
    "status": "confirmed"
  }
]
*/

router.get('/getAppointments/appointmentPage', verifyToken, (req, res) => {
  const q = `
    SELECT 
      a.id,
      service_type AS sessionType, 
      p.name AS patientName, 
      DATE_FORMAT(date, '%Y-%m-%d') AS date, 
      DATE_FORMAT(time, '%H:%i') AS time
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    ORDER BY date DESC, time DESC
  `;
  
  db.query(q, (err, data) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(data);
  });
});



router.delete('/cancelAppointment/:id', verifyToken, (req, res) => {
  const appointmentId = req.params.id;
  const q = 'DELETE FROM appointments WHERE id = ?';
  db.query(q, [appointmentId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment cancelled successfully' });
  });
});


module.exports = router;

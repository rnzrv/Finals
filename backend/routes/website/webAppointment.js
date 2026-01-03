const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../../config/db');
const webVerifyToken = require('../../middleware/websiteMiddleware');
const verifyToken = require('../../middleware/middleware');
const transporter = require('../../utils/mail');


router.get('/getPendingRequests', verifyToken, (req, res) => {
    const q = `
        SELECT 
            r.id AS request_id,
            p.name,
            s.serviceName AS service, 
            DATE_FORMAT(r.preferred_date, '%Y-%m-%d') AS service_date, 
            TIME_FORMAT(r.preferred_time, '%h:%i %p') AS service_time
        FROM requests r
        JOIN patients p ON r.patient_id = p.id
        JOIN services s ON r.service_requested = s.serviceId
        WHERE r.status = 'Pending'
    `;

    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(data);
    });
});





router.put('/updateRequestStatus/:id', verifyToken, (req, res) => {
  const requestId = req.params.id;

  // 1️⃣ Get request date & time first (for conflict check)
  const fetchRequestQ = `
    SELECT preferred_date, preferred_time 
    FROM requests 
    WHERE id = ?
  `;

  db.query(fetchRequestQ, [requestId], (err, reqData) => {
    if (err || reqData.length === 0) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    const { preferred_date, preferred_time } = reqData[0];

    // 2️⃣ GLOBAL TIME CONFLICT CHECK
    const conflictQ = `
      SELECT id 
      FROM appointments 
      WHERE date = ? AND time = ?
    `;

    db.query(conflictQ, [preferred_date, preferred_time], (err, conflicts) => {
      if (err) {
        console.error('Conflict check failed:', err);
        return res.status(500).json({
          error: 'Failed to check appointment availability'
        });
      }

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'This time slot is already booked'
        });
      }

      // 3️⃣ UPDATE REQUEST STATUS
      const updateQ = `
        UPDATE requests 
        SET status = 'Scheduled' 
        WHERE id = ?
      `;

      db.query(updateQ, [requestId], (err, result) => {
        if (err || result.affectedRows === 0) {
          return res.status(500).json({
            error: 'Failed to update request status'
          });
        }

        // 4️⃣ INSERT INTO APPOINTMENTS
        const insertQ = `
          INSERT INTO appointments (patient_id, date, time, service_type, status)
          SELECT 
            r.patient_id, 
            r.preferred_date, 
            r.preferred_time, 
            s.serviceName, 
            'Confirmed'
          FROM requests r
          JOIN services s ON r.service_requested = s.serviceId
          WHERE r.id = ?
        `;

        db.query(insertQ, [requestId], (err) => {
          if (err) {
            // Handle DB-level duplicate protection
            if (err.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({
                error: 'This time slot is already booked'
              });
            }

            console.error('Insert appointment failed:', err);
            return res.status(500).json({
              error: 'Failed to create appointment'
            });
          }

          // 5️⃣ SEND EMAIL (unchanged, safe)
          const emailQ = `
            SELECT p.email, p.name, s.serviceName, s.consentForm, r.preferred_date
            FROM requests r
            JOIN patients p ON r.patient_id = p.id
            JOIN services s ON r.service_requested = s.serviceId
            WHERE r.id = ?
          `;

          db.query(emailQ, [requestId], (err, data) => {
            if (!err && data.length > 0) {
              const { email, name, serviceName, consentForm, preferred_date } = data[0];

              const formattedDate = new Date(preferred_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              const mailOptions = {
                from: `"Beauwitty" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Appointment Approved",
                html: `
                  <p>Hello <b>${name}</b>,</p>
                  <p>Your appointment for <b>${serviceName}</b> has been approved.</p>
                  <p><b>Date:</b> ${formattedDate}</p>
                  <p>Please find the consent form attached.</p>
                  <p>Thank you!</p>
                `,
                attachments: consentForm
                  ? [{ filename: consentForm.split('/').pop(), path: consentForm }]
                  : []
              };

              transporter.sendMail(mailOptions, (err) => {
                if (err) console.error('Email error:', err);
              });
            }
          });

          return res.status(200).json({
            message: 'Appointment approved and scheduled successfully'
          });
        });
      });
    });
  });
});
    
router.put('/declineRequest/:id', verifyToken, (req, res) => {
    const requestId = req.params.id;

    const emailQ = `
      SELECT p.email, p.name
      FROM requests r
      JOIN patients p ON r.patient_id = p.id
      WHERE r.id = ?
    `;

    db.query(emailQ, [requestId], (err, data) => {
        const q = "UPDATE requests SET status = 'Declined' WHERE id = ?";

        db.query(q, [requestId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to decline request' });
            }

            if (!err && data.length > 0) {
                transporter.sendMail({
                    from: `"Beauwitty" <${process.env.EMAIL_USER}>`,
                    to: data[0].email,
                    subject: "Appointment Declined",
                    html: `
                      <p>Hello <b>${data[0].name}</b>,</p>
                      <p>We're sorry. Your appointment request was declined due to some reasons. </p>
                      <p>Please contact us for more info or you can book appointment again. </p>
                    `,
                });
            }

            res.status(200).json({ message: 'Declined and email sent' });
        });
    });
});



module.exports = router;
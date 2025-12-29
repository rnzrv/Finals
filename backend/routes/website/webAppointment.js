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

    const updateQ = "UPDATE requests SET status = 'Scheduled' WHERE id = ?";
    db.query(updateQ, [requestId], (err, result) => {
        if (err || result.affectedRows === 0) {
            return res.status(500).json({ error: 'Failed to update request' });
        }

        const insertQ = `
            INSERT INTO appointments (patient_id, date, time, service_type, status)
            SELECT r.patient_id, r.preferred_date, r.preferred_time, s.serviceName, 'Confirmed'
            FROM requests r
            JOIN services s ON r.service_requested = s.serviceId
            WHERE r.id = ?
        `;
        db.query(insertQ, [requestId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to create appointment' });
            }

           // 🔔 SEND EMAIL WITH FORMATTED DATE AND ATTACHMENT
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

        // Format the date nicely
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
            attachments: []
        };

        if (consentForm) {
            mailOptions.attachments.push({
                filename: consentForm.split('/').pop(),
                path: consentForm
            });
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error('Error sending email:', err);
        });
    }
});


            res.status(200).json({ message: 'Approved and email sent' });
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
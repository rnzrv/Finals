const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');

// Get all notifications (low inventory + upcoming appointments)
router.get('/getAllNotifications', verifyToken, (req, res) => {
  try {
    // Get low inventory items (quantity <= 10)
    const inventoryQuery = `
      SELECT 
        itemId,
        itemName,
        brand,
        quantity,
        'inventory' AS notificationType,
        CURRENT_TIMESTAMP AS timestamp
      FROM inventory
      WHERE quantity <= 10
      ORDER BY quantity ASC
    `;

    // Get upcoming appointments
    const appointmentQuery = `
      SELECT 
  r.id,
  r.patient_id,
  DATE_FORMAT(r.preferred_date, '%Y-%m-%d') AS date,
  DATE_FORMAT(r.preferred_time, '%h:%i %p') AS time,
  s.serviceName AS serviceName,
  p.name AS patientName,
  r.status,
  'appointment' AS notificationType,
  r.created_at AS timestamp
FROM requests r
LEFT JOIN patients p ON r.patient_id = p.id
LEFT JOIN services s ON r.service_requested = s.serviceId
WHERE r.status = 'Pending'
ORDER BY r.created_at DESC

    `;

    // Execute both queries
    let notifications = [];
    let inventoryCount = 0;
    let appointmentCount = 0;

    db.query(inventoryQuery, (err, inventoryData) => {
      if (err) {
        console.error('Inventory query error:', err);
        return res.status(500).json({ error: 'Database error fetching inventory' });
      }

      inventoryCount = inventoryData.length;
      notifications = notifications.concat(inventoryData);

      db.query(appointmentQuery, (err, appointmentData) => {
        if (err) {
          console.error('Appointment query error:', err);
          return res.status(500).json({ error: 'Database error fetching appointments' });
        }

        appointmentCount = appointmentData.length;
        notifications = notifications.concat(appointmentData);

        // Sort by timestamp
        notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return res.status(200).json({
          success: true,
          totalCount: notifications.length,
          inventoryCount,
          appointmentCount,
          notifications
        });
      });
    });
  } catch (error) {
    console.error('Error in getAllNotifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get only low inventory notifications
router.get('/lowInventory', verifyToken, (req, res) => {
  const query = `
    SELECT 
      itemId,
      itemName,
      brand,
      code,
      quantity,
      sellingPrice,
      'inventory' AS notificationType,
      CURRENT_TIMESTAMP AS timestamp
    FROM inventory
    WHERE quantity <= 10
    ORDER BY quantity ASC
  `;

  db.query(query, (err, data) => {
    if (err) {
      console.error('Error fetching low inventory:', err);
      return res.status(500).json({ error: err.sqlMessage });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  });
});

// Get only appointment notifications
router.get('/appointments', verifyToken, (req, res) => {
  const query = `
    SELECT 
  r.id,
  r.patient_id,
  DATE_FORMAT(r.preferred_date, '%Y-%m-%d') AS date,
  DATE_FORMAT(r.preferred_time, '%h:%i %p') AS time,
  s.serviceName AS serviceName,
  p.name AS patientName,
  r.status,
  'appointment' AS notificationType,
  r.created_at AS timestamp
FROM requests r
LEFT JOIN patients p ON r.patient_id = p.id
LEFT JOIN services s ON r.service_requested = s.serviceId
WHERE r.status = 'Pending'
ORDER BY r.created_at DESC
LIMIT 10

  `;

  db.query(query, (err, data) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ error: err.sqlMessage });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  });
});

// Get critical low stock items (quantity <= 5)
router.get('/criticalInventory', verifyToken, (req, res) => {
  const query = `
    SELECT 
      itemId,
      itemName,
      brand,
      code,
      quantity,
      sellingPrice,
      category,
      'critical-inventory' AS notificationType,
      CURRENT_TIMESTAMP AS timestamp
    FROM inventory
    WHERE quantity <= 5
    ORDER BY quantity ASC
  `;

  db.query(query, (err, data) => {
    if (err) {
      console.error('Error fetching critical inventory:', err);
      return res.status(500).json({ error: err.sqlMessage });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  });
});

// Get appointment count by status
router.get('/appointmentStats', verifyToken, (req, res) => {
  const query = `
    SELECT 
      status,
      COUNT(*) AS count
    FROM requests
    WHERE DATE(preferred_date) >= CURDATE()
    GROUP BY status
  `;

  db.query(query, (err, data) => {
    if (err) {
      console.error('Error fetching appointment stats:', err);
      return res.status(500).json({ error: err.sqlMessage });
    }

    return res.status(200).json({
      success: true,
      data
    });
  });
});

// Get inventory count by alert level
router.get('/inventoryStats', verifyToken, (req, res) => {
  const query = `
    SELECT 
      CASE 
        WHEN quantity <= 5 THEN 'Critical'
        WHEN quantity <= 10 THEN 'Low'
        ELSE 'Normal'
      END AS alertLevel,
      COUNT(*) AS count,
      AVG(quantity) AS avgQuantity,
      MIN(quantity) AS minQuantity,
      MAX(quantity) AS maxQuantity
    FROM inventory
    GROUP BY alertLevel
  `;

  db.query(query, (err, data) => {
    if (err) {
      console.error('Error fetching inventory stats:', err);
      return res.status(500).json({ error: err.sqlMessage });
    }

    return res.status(200).json({
      success: true,
      data
    });
  });
});

// Get summary dashboard notifications
router.get('/summary', verifyToken, (req, res) => {
  try {
    let summary = {
      totalNotifications: 0,
      criticalItems: 0,
      lowStockItems: 0,
      upcomingAppointments: 0,
      todayAppointments: 0
    };

    // Critical inventory count
    db.query('SELECT COUNT(*) as count FROM inventory WHERE quantity <= 5', (err, data) => {
      if (!err && data[0]) summary.criticalItems = data[0].count;

      // Low inventory count
      db.query('SELECT COUNT(*) as count FROM inventory WHERE quantity > 5 AND quantity <= 10', (err, data) => {
        if (!err && data[0]) summary.lowStockItems = data[0].count;

        // Upcoming appointments
        db.query('SELECT COUNT(*) as count FROM requests WHERE DATE(preferred_date) >= CURDATE()', (err, data) => {
          if (!err && data[0]) summary.upcomingAppointments = data[0].count;

          // Today's appointments
          db.query('SELECT COUNT(*) as count FROM requests WHERE DATE(preferred_date) = CURDATE()', (err, data) => {
            if (!err && data[0]) summary.todayAppointments = data[0].count;

            summary.totalNotifications = summary.criticalItems + summary.lowStockItems + summary.upcomingAppointments;

            return res.status(200).json({
              success: true,
              summary
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in summary:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

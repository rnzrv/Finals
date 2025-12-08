const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');


// ✅ 1. GET ALL SERVICES
router.get('/services', verifyToken, (req, res) => {
  const q = "SELECT * FROM services ORDER BY created_at DESC";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(data);
  });
});


// ✅ 2. GET ALL INVENTORY ITEMS FOR SERVICE SELECTION
router.get('/services/inventory', verifyToken, (req, res) => {
  const q = "SELECT itemName, code, quantity, sellingPrice FROM inventory WHERE quantity > 0";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(data);
  });
});


// ✅ 3. CREATE SERVICE + LINK INVENTORY ITEMS (TRANSACTION SAFE)
router.post('/services', verifyToken, (req, res) => {
  const { serviceName, description, price, logo, items } = req.body;

  if (!serviceName || !price || !items || items.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: "Transaction error", error: err });

    const serviceQ = `
      INSERT INTO services (serviceName, description, price, logo)
      VALUES (?, ?, ?, ?)
    `;

    db.query(serviceQ, [serviceName, description, price, logo], (err, serviceData) => {
      if (err) return db.rollback(() => res.status(500).json({ message: "Failed to insert service", error: err }));

      const serviceId = serviceData.insertId;

      // Prepare values for bulk insert
      const values = items.map(item => [
        serviceId,
        item.code,
        item.itemName,
        item.qty,
        item.price
      ]);

      if (values.length === 0) {
        return db.commit(err => {
          if (err) return db.rollback(() => res.status(500).json({ message: "Commit failed", error: err }));
          return res.status(201).json({ message: "Service created successfully", serviceId });
        });
      }

      const itemsQ = `
        INSERT INTO service_items (serviceId, itemCode, itemName, qty, price)
        VALUES ?
      `;

      db.query(itemsQ, [values], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ message: "Failed to insert service items", error: err }));

        db.commit(err => {
          if (err) return db.rollback(() => res.status(500).json({ message: "Commit failed", error: err }));

          res.status(201).json({
            message: "Service created successfully",
            serviceId
          });
        });
      });
    });
  });
});



// ✅ 4. GET SINGLE SERVICE WITH ITS ITEMS
router.get('/services/:id', verifyToken, (req, res) => {
  const serviceId = req.params.id;

  const serviceQ = "SELECT * FROM services WHERE serviceId = ?";
  const itemsQ = "SELECT * FROM service_items WHERE serviceId = ?";

  db.query(serviceQ, [serviceId], (err, serviceData) => {
    if (err) return res.status(500).json(err);
    if (serviceData.length === 0) return res.status(404).json({ message: "Service not found" });

    db.query(itemsQ, [serviceId], (err, itemsData) => {
      if (err) return res.status(500).json(err);

      res.status(200).json({
        service: serviceData[0],
        items: itemsData
      });
    });
  });
});


// ✅ 5. DELETE SERVICE (AUTO DELETES service_items VIA FK)
router.delete('/services/:id', verifyToken, (req, res) => {
  const serviceId = req.params.id;

  const q = "DELETE FROM services WHERE serviceId = ?";
  db.query(q, [serviceId], (err) => {
    if (err) return res.status(500).json(err);

    res.status(200).json({ message: "Service deleted successfully" });
  });
});


module.exports = router;

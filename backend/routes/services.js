const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/services"); // make sure folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });



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


// ✅ CREATE SERVICE + LINK INVENTORY ITEMS (FORM DATA + TRANSACTION SAFE)
// ...existing code...
router.post(
  "/services",
  verifyToken,
  upload.single("logo"),
  (req, res) => {
    const { serviceName, description, price } = req.body;
    let { items } = req.body;
    const logo = req.file ? `uploads/services/${req.file.filename}` : null;

    if (!serviceName || !price || !items) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      items = JSON.parse(items);
    } catch (err) {
      return res.status(400).json({ message: "Invalid items format" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items cannot be empty" });
    }

    db.beginTransaction(err => {
      if (err) return res.status(500).json({ message: "Transaction error", error: err });

      const serviceQ = `
        INSERT INTO services (serviceName, description, price, logo)
        VALUES (?, ?, ?, ?)
      `;
      db.query(serviceQ, [serviceName, description, price, logo], (err, serviceData) => {
        if (err) {
          return db.rollback(() =>
            res.status(500).json({ message: "Failed to insert service", error: err })
          );
        }

        const serviceId = serviceData.insertId;
        const values = items.map(item => [
          serviceId,
          item.code,
          item.itemName,
          item.qty,
          item.price
        ]);

        const itemsQ = `
          INSERT INTO service_items (serviceId, itemCode, itemName, qty, price)
          VALUES ?
        `;
        db.query(itemsQ, [values], err => {
          if (err) {
            return db.rollback(() =>
              res.status(500).json({ message: "Failed to insert service items", error: err })
            );
          }

          db.commit(err => {
            if (err) {
              return db.rollback(() =>
                res.status(500).json({ message: "Commit failed", error: err })
              );
            }
            res.status(201).json({ message: "Service created successfully", serviceId });
          });
        });
      });
    });
  }
);
// ...existing code...




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

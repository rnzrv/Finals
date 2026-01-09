const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "logo") {
      cb(null, "uploads/services"); // logo folder
    } else if (file.fieldname === "consentForm") {
      cb(null, "uploads/consent"); // consent form folder
    } else {
      cb(null, "uploads/others"); // fallback folder
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for uploads

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    try {
      if (file.fieldname === "consentForm") {
        if (file.mimetype !== "application/pdf") {
          return cb(new Error("Consent form must be a PDF"));
        }
      }
      if (file.fieldname === "logo") {
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
          return cb(new Error("Logo must be an image"));
        }
      }
      cb(null, true);
    } catch (e) {
      cb(new Error("Invalid file upload"));
    }
  }
});



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
  (req, res) => {
    upload.fields([
      { name: "logo", maxCount: 1 },
      { name: "consentForm", maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large. Max size is 5MB." });
          }
          return res.status(400).json({ message: err.message || "Upload error" });
        }
        return res.status(400).json({ message: err.message || "Upload failed" });
      }

      const { serviceName, description, price } = req.body;
      let { items } = req.body;

      if (!serviceName || !price || !items) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      try {
        items = JSON.parse(items);
      } catch (parseErr) {
        return res.status(400).json({ message: "Invalid items format" });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items cannot be empty" });
      }

      const logo = req.files && req.files.logo ? `uploads/services/${req.files.logo[0].filename}` : null;
      const consentForm = req.files && req.files.consentForm ? `uploads/consent/${req.files.consentForm[0].filename}` : null;

      db.beginTransaction(errTx => {
        if (errTx) return res.status(500).json({ message: "Transaction error", error: errTx });

        const serviceQ = `
          INSERT INTO services (serviceName, description, price, logo, consentForm)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(serviceQ, [serviceName, description, price, logo, consentForm], (errSvc, serviceData) => {
          if (errSvc) {
            return db.rollback(() =>
              res.status(500).json({ message: "Failed to insert service", error: errSvc })
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
          db.query(itemsQ, [values], errItems => {
            if (errItems) {
              return db.rollback(() =>
                res.status(500).json({ message: "Failed to insert service items", error: errItems })
              );
            }

            db.commit(errCommit => {
              if (errCommit) {
                return db.rollback(() =>
                  res.status(500).json({ message: "Commit failed", error: errCommit })
                );
              }
              res.status(201).json({ message: "Service created successfully", serviceId });
            });
          });
        });
      });
    });
  }
);




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

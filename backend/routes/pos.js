const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verify } = require('crypto');


// GET POS data (products + services)
router.get('/pos', verifyToken, (req, res) => {
    const productQ = "SELECT itemName, code, quantity, sellingPrice, logo, category FROM inventory WHERE quantity > 0 AND category = 'Product'";
    db.query(productQ, (err, productData) => {
        if (err) return res.status(500).json(err);

        const serviceQ = "SELECT serviceId, serviceName as itemName, 'Service' as category, logo, price as sellingPrice FROM services";
        db.query(serviceQ, (err, serviceData) => {
            if (err) return res.status(500).json(err);

            const servicesWithCode = (serviceData || []).map(s => ({
                ...s,
                code: `SERVICE-${s.serviceId}`,
                quantity: null
            }));

            const allItems = [...(productData || []), ...servicesWithCode];
            res.status(200).json(allItems);
        });
    });
});

// POST sale (products + services)
router.post('/sales', verifyToken, (req, res) => {
  const { customerName, paymentMethod, subTotal, taxAmount, totalAmount, changes, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in the sale" });
  }

  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: "Transaction error", error: err });

    // Generate sale reference
    const generateRandomNumber = String(Math.floor(100000 + Math.random() * 900000));
    const reference = 'SALE-' + Date.now() + '-' + generateRandomNumber;

    // Generate customer name if empty
    const getCustomerName = (callback) => {
      if (customerName && customerName.trim() !== '') return callback(null, customerName.trim());
      db.query("SELECT COUNT(*) AS count FROM sales", (err, rows) => {
        if (err) return callback(err);
        callback(null, `Customer #${rows[0].count + 1}`);
      });
    };

    getCustomerName((err, finalCustomerName) => {
      if (err) return db.rollback(() => res.status(500).json({ message: "Failed to generate customer name", error: err }));

      // Insert into sales table
      const saleQ = "INSERT INTO sales (reference, customerName, paymentMethod, subTotal, taxAmount, totalAmount, changes) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(saleQ, [reference, finalCustomerName, paymentMethod, subTotal, taxAmount, totalAmount, changes], (err, saleData) => {
        if (err) return db.rollback(() => res.status(500).json({ message: "Failed to insert sale", error: err }));

        const saleId = saleData.insertId;

        // Separate products and services
        const products = items.filter(i => !i.code.startsWith('SERVICE-'));
        const services = items.filter(i => i.code.startsWith('SERVICE-'));

        // Insert products and deduct inventory
        const insertProducts = (callback) => {
          if (products.length === 0) return callback();

          let count = 0;
          products.forEach(p => {
            // Insert into sale_items
            db.query(
              "INSERT INTO sale_items (saleId, itemCode, itemName, qty, price) VALUES (?, ?, ?, ?, ?)",
              [saleId, p.code, p.itemName, p.quantity, p.sellingPrice],
              (err) => {
                if (err) return callback(err);

                // Deduct inventory
                db.query(
                  "UPDATE inventory SET quantity = quantity - ? WHERE code = ?",
                  [p.quantity, p.code],
                  (err) => {
                    if (err) return callback(err);
                    count++;
                    if (count === products.length) callback();
                  }
                );
              }
            );
          });
        };

        // Insert services and deduct inventory
        const insertServices = (callback) => {
          if (services.length === 0) return callback();

          let sCount = 0;
          services.forEach(s => {
            const serviceId = s.code.split('-')[1];

            // Insert into sale_services
            db.query(
              "INSERT INTO sale_services (saleId, serviceId, serviceName, quantity, price) VALUES (?, ?, ?, ?, ?)",
              [saleId, serviceId, s.itemName, s.quantity, s.sellingPrice],
              (err) => {
                if (err) return callback(err);

                // Deduct inventory items for this service
                db.query(
                  "SELECT * FROM service_items WHERE serviceId = ?",
                  [serviceId],
                  (err, serviceItems) => {
                    if (err) return callback(err);

                    if (!serviceItems || serviceItems.length === 0) {
                      sCount++;
                      if (sCount === services.length) callback();
                      return;
                    }

                    let subCount = 0;
                    serviceItems.forEach(si => {
                      db.query(
                        "UPDATE inventory SET quantity = quantity - ? WHERE code = ?",
                        [si.qty * s.quantity, si.itemCode],
                        (err) => {
                          if (err) return callback(err);
                          subCount++;
                          if (subCount === serviceItems.length) {
                            sCount++;
                            if (sCount === services.length) callback();
                          }
                        }
                      );
                    });
                  }
                );
              }
            );
          });
        };

        // Execute both
        insertProducts((err) => {
          if (err) return db.rollback(() => res.status(500).json({ message: "Failed to insert products", error: err }));

          insertServices((err) => {
            if (err) return db.rollback(() => res.status(500).json({ message: "Failed to insert services", error: err }));

            // Commit transaction
            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).json({ message: "Commit failed", error: err }));

              res.status(200).json({ message: "Sale recorded successfully", reference, customerName: finalCustomerName });
            });
          });
        });

      });
    });
  });
});


module.exports = router;

















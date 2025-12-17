const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verify } = require('crypto');

// Promisified query helper
const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

// GET POS data (products + services)
// ...existing code...

// GET POS data (products + services)
// ...existing code...
router.get('/pos', verifyToken, async (req, res) => {
  try {
    const { product, services } = req.query;

    let productData = [];
    let serviceData = [];

    if (!services || product === 'true') {
      const productQ = `
        SELECT itemName, code, quantity, sellingPrice,
               logo, category
        FROM inventory
        WHERE quantity > 0 AND category = 'Product'
      `;
      productData = await q(productQ);
    }

    if (!product || services === 'true') {
      const serviceQ = `
        SELECT serviceId,
               serviceName AS itemName,
               'Service' AS category,
               CASE
                 WHEN logo IS NULL OR logo = '' THEN NULL
                 ELSE logo
               END AS logo,
               price AS sellingPrice
        FROM services
      `;
      serviceData = await q(serviceQ);
    }

    const servicesWithCode = (serviceData || []).map(s => ({
      ...s,
      code: `SERVICE-${s.serviceId}`,
      quantity: null
    }));

    const allItems = [...(productData || []), ...servicesWithCode];
    res.status(200).json(allItems);
  } catch (err) {
    console.error('POS Error:', err);
    res.status(500).json({ error: err.message || err });
  }
});
// ...existing code...

// ...existing code...
router.get('/getPatients/Customers', verifyToken, (req, res) => {
  const q = "SELECT id, name AS customerName FROM patients";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(data);
  });
});

// POST sale (products + services)
router.post('/sales', verifyToken, async (req, res) => {
  const { customerName, paymentMethod, subTotal, taxAmount, totalAmount, totalPayment, changes, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty!" });
  }

  const connection = db;
  connection.beginTransaction(async (err) => {
    if (err) return res.status(500).json({ message: 'Transaction error', error: err });

    try {
      // Generate sale reference
      const reference = 'SALE-' + Date.now() + '-' + Math.floor(100000 + Math.random() * 900000);

      // Determine customer name
      let finalCustomerName = customerName && customerName.trim() !== '' ? customerName.trim() : null;
      if (!finalCustomerName) {
        const rows = await q("SELECT COUNT(*) AS count FROM sales");
        finalCustomerName = `Customer #${rows[0].count + 1}`;
      }

      // Separate products and services
      const products = items.filter(i => !i.code.startsWith('SERVICE-'));
      const services = items.filter(i => i.code.startsWith('SERVICE-'));

      // Check products stock first
      const insufficientProducts = [];
      for (const p of products) {
        const stockRows = await q("SELECT quantity, itemName FROM inventory WHERE code = ?", [p.code]);
        const stockQty = stockRows[0]?.quantity ?? 0;
        if (stockQty < p.quantity) {
          insufficientProducts.push({
            type: 'product',
            code: p.code,
            itemName: stockRows[0]?.itemName,
            available: stockQty,
            required: p.quantity,
            shortage: p.quantity - stockQty
          });
        }
      }

      // Check services required inventory
      const servicesMissingProducts = {};
      for (const s of services) {
        const serviceId = s.code.split('-')[1];
        const serviceItems = await q("SELECT si.itemCode, si.qty, i.itemName, i.quantity AS stock FROM service_items si JOIN inventory i ON si.itemCode = i.code WHERE si.serviceId = ?", [serviceId]);
        
        const missingProducts = [];
        serviceItems.forEach(si => {
          const requiredQty = si.qty * s.quantity;
          if (si.stock < requiredQty) {
            missingProducts.push({
              productCode: si.itemCode,
              productName: si.itemName,
              productQtyPerService: si.qty,
              totalProductNeeded: requiredQty,
              productAvailable: si.stock,
              shortage: requiredQty - si.stock
            });
          }
        });

        if (missingProducts.length > 0) {
          servicesMissingProducts[s.itemName] = {
            serviceId: serviceId,
            serviceQtyOrdered: s.quantity,
            missingProducts: missingProducts
          };
        }
      }

      // Rollback if insufficient stock
      const hasInsufficient = insufficientProducts.length > 0 || Object.keys(servicesMissingProducts).length > 0;
      if (hasInsufficient) {
        return connection.rollback(() => {
          res.status(400).json({
            message: "Insufficient stock for the following items",
            directProducts: insufficientProducts,
            servicesMissingProducts: servicesMissingProducts
          });
        });
      }

      // Insert sale
      const saleResult = await q(
        "INSERT INTO sales (reference, customerName, paymentMethod, subTotal, taxAmount, totalAmount, totalPayment, changes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [reference, finalCustomerName, paymentMethod, subTotal, taxAmount, totalAmount, totalPayment, changes]
      );
      const saleId = saleResult.insertId;

      // Insert products & deduct inventory
      for (const p of products) {
        await q(
          "INSERT INTO sale_items (saleId, itemCode, itemName, qty, price) VALUES (?, ?, ?, ?, ?)",
          [saleId, p.code, p.itemName, p.quantity, p.sellingPrice]
        );
        await q("UPDATE inventory SET quantity = quantity - ? WHERE code = ?", [p.quantity, p.code]);
      }

      // Insert services & deduct inventory
      for (const s of services) {
        const serviceId = s.code.split('-')[1];
        await q(
          "INSERT INTO sale_services (saleId, serviceId, serviceName, quantity, price) VALUES (?, ?, ?, ?, ?)",
          [saleId, serviceId, s.itemName, s.quantity, s.sellingPrice]
        );

        const serviceItems = await q("SELECT si.itemCode, si.qty FROM service_items si WHERE si.serviceId = ?", [serviceId]);
        for (const si of serviceItems) {
          await q(
            "UPDATE inventory SET quantity = quantity - ? WHERE code = ?",
            [si.qty * s.quantity, si.itemCode]
          );
        }
      }

      // Commit transaction
      connection.commit(err => {
  if (err) return connection.rollback(() => res.status(500).json({ message: 'Commit failed', error: err }));
  res.status(200).json({ message: 'Sale recorded successfully', reference, customerName: finalCustomerName });
});
 

    } catch (error) {
      console.error('Sale error:', error);
      connection.rollback(() => {
        res.status(500).json({ message: 'Failed to record sale', error: error.message });
      });
    }

  });
});


module.exports = router;

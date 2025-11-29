const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');


// ...existing code...
router.post('/addInventory', verifyToken, (req, res) => {
  let { itemName, brand, code, price, category, quantity, logo } = req.body;

  // Normalize/trim
  itemName = typeof itemName === 'string' ? itemName.trim() : '';
  brand = typeof brand === 'string' ? brand.trim() : '';
  code = typeof code === 'string' ? code.trim() : '';
  category = typeof category === 'string' ? category.trim() : '';
  logo = logo ?? null;

  // Required fields
  if (!itemName || !brand || !code || price === undefined || quantity === undefined || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Type and range validation
  const priceNum = Number(price);
  const qtyNum = Number(quantity);
  if (Number.isNaN(priceNum) || priceNum <= 0) {
    return res.status(400).json({ error: 'Price must be a number greater than 0' });
  }
  if (!Number.isInteger(qtyNum) || qtyNum < 0) {
    return res.status(400).json({ error: 'Quantity must be an integer ≥ 0' });
  }

  // Optional: allowed categories set
  // const allowedCategories = new Set(['Hair Care','Body Care','Oral Care']);
  // if (!allowedCategories.has(category)) return res.status(400).json({ error: 'Invalid category' });

  // Duplicate code check
  const checkQ = 'SELECT 1 FROM inventory WHERE code = ? LIMIT 1';
  db.query(checkQ, [code], (checkErr, rows) => {
    if (checkErr) return res.status(500).json({ error: checkErr.sqlMessage });
    if (rows && rows.length > 0) {
      return res.status(409).json({ error: 'Product code already exists' });
    }

    const insertQ = `
      INSERT INTO inventory (itemName, brand, code, price, category, quantity, logo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertQ, [itemName, brand, code, priceNum, category, qtyNum, logo], (err, result) => {
      if (err) {
        // Map duplicate error if constraint exists
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Product code already exists' });
        }
        return res.status(500).json({ error: err.sqlMessage });
      }
      return res.status(201).json({
        message: 'Product added to inventory successfully',
        itemId: result.insertId
      });
    });
  });
});

router.get('/getInventory', verifyToken, (req, res) => {
  const q = "SELECT * FROM inventory";
    db.query(q, (err, data) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(200).json(data);
    });
});


router.delete('/deleteInventory/:id', verifyToken, (req, res) => {
  const inventoryId = req.params.id;
    const q = "DELETE FROM inventory WHERE itemId = ?";
    db.query(q, [inventoryId], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(200).json({ message: 'Inventory item deleted successfully' });
    });
});


router.put('/updateInventory/:id', verifyToken, (req, res) => {
  const inventoryId = req.params.id;
  const { itemName, brand, code, price, category, quantity, logo } = req.body;  
    const q = `
    UPDATE inventory 
    SET itemName = ?, brand = ?, code = ?, price = ?, category = ?, quantity = ?, logo = ?
    WHERE itemId = ?
  `;
    db.query(q, [itemName, brand, code, price, category, quantity, logo, inventoryId], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      return res.status(200).json({ message: 'Inventory item updated successfully' });
    });
});

module.exports = router;
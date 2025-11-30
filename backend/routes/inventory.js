const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');


// ...existing code...
router.post('/addInventory', verifyToken, (req, res) => {
  let { itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, logo } = req.body;

  itemName = typeof itemName === 'string' ? itemName.trim() : '';
  brand = typeof brand === 'string' ? brand.trim() : '';
  code = typeof code === 'string' ? code.trim() : '';
  costUnit = costUnit !== undefined ? Number(costUnit) : null;
  sellingPrice = sellingPrice !== undefined ? Number(sellingPrice) : null;
  category = typeof category === 'string' ? category.trim() : '';
  quantity = quantity !== undefined ? Number(quantity) : null;
  expiryDate = typeof expiryDate === 'string' ? expiryDate.trim() : null;
  logo = logo ?? null;

  if (!itemName || !brand || !code || costUnit === undefined || sellingPrice === undefined || quantity === undefined || !category || !expiryDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const costUnitNum = Number(costUnit);
  const sellingPriceNum = Number(sellingPrice);
  const qtyNum = Number(quantity);
  if (Number.isNaN(costUnitNum) || costUnitNum <= 0) {
    return res.status(400).json({ error: 'Cost unit must be a number greater than 0' });
  }
  if (Number.isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
    return res.status(400).json({ error: 'Selling price must be a number greater than 0' });
  }
  if (!Number.isInteger(qtyNum) || qtyNum < 0) {
    return res.status(400).json({ error: 'Quantity must be an integer ≥ 0' });
  }
  if (!expiryDate) {
    return res.status(400).json({ error: 'Expiry date is required' });
  }
  if (isNaN(Date.parse(expiryDate))) {
    return res.status(400).json({ error: 'Expiry date must be a valid date' });
  }



  const checkQ = 'SELECT 1 FROM inventory WHERE code = ? LIMIT 1';
  db.query(checkQ, [code], (checkErr, rows) => {
    if (checkErr) return res.status(500).json({ error: checkErr.sqlMessage });
    if (rows && rows.length > 0) {
      return res.status(409).json({ error: 'Product code already exists' });
    }

    const insertQ = `
      INSERT INTO inventory (itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, logo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertQ, [itemName, brand, code, costUnitNum, sellingPriceNum, category, qtyNum, expiryDate, logo], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Product code already exists' });
        }
        return res.status(500).json({ error: err.sqlMessage });
      }
      return res.status(201).json({
        message: 'Product added to inventory successfully',
        data: {
          itemId: result.insertId,
          itemName,
          brand,
          code,
          costUnit: costUnitNum,
          sellingPrice: sellingPriceNum,
          category,
          quantity: qtyNum,
          expiryDate,
          logo
        }
      });
    });
  });
});


router.put('/updateInventory/:id', verifyToken, (req, res) => {
  const inventoryId = req.params.id;
  let { itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, logo } = req.body;

  itemName = typeof itemName === 'string' ? itemName.trim() : '';
  brand = typeof brand === 'string' ? brand.trim() : '';
  code = typeof code === 'string' ? code.trim() : '';
  category = typeof category === 'string' ? category.trim() : '';
  logo = logo ?? null;
  expiryDate = typeof expiryDate === 'string' ? expiryDate.trim() : null;

  if (!itemName || !brand || !code || costUnit === undefined || sellingPrice === undefined || quantity === undefined || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const costUnitNum = Number(costUnit);
  const sellingPriceNum = Number(sellingPrice);
  const qtyNum = Number(quantity);

  if (!Number.isFinite(costUnitNum) || costUnitNum < 0) {
    return res.status(400).json({ error: 'Cost unit must be a number ≥ 0' });
  }
  if (!Number.isFinite(sellingPriceNum) || sellingPriceNum <= 0) {
    return res.status(400).json({ error: 'Selling price must be a number > 0' });
  }
  if (!Number.isInteger(qtyNum) || qtyNum < 0) {
    return res.status(400).json({ error: 'Quantity must be an integer ≥ 0' });
  }
  if (expiryDate && Number.isNaN(Date.parse(expiryDate))) {
    return res.status(400).json({ error: 'Expiry date must be a valid date (YYYY-MM-DD)' });
  }

  const dupQ = 'SELECT 1 FROM inventory WHERE code = ? AND itemId != ? LIMIT 1';
  db.query(dupQ, [code, inventoryId], (checkErr, rows) => {
    if (checkErr) return res.status(500).json({ error: checkErr.sqlMessage });
    if (rows && rows.length > 0) {
      return res.status(409).json({ error: 'Product code already exists' });
    }

    const updateQ = `
      UPDATE inventory
      SET itemName = ?, brand = ?, code = ?, costUnit = ?, sellingPrice = ?, category = ?, quantity = ?, expiryDate = ?, logo = ?
      WHERE itemId = ?
    `;
    db.query(
      updateQ,
      [itemName, brand, code, costUnitNum, sellingPriceNum, category, qtyNum, expiryDate || null, logo, inventoryId],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
        return res.status(200).json({ message: 'Inventory item updated successfully' });
      }
    );
  });
});


router.get('/getInventory', verifyToken, (req, res) => {
  const q = 'SELECT itemId, itemName, brand, code, costUnit, sellingPrice, category, quantity, DATE_FORMAT(expiryDate, "%Y-%m-%d") as expiryDate, logo FROM inventory';
  
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.status(200).json(data);
  });
});

router.delete('/deleteInventory/:id', verifyToken, (req, res) => {
  const inventoryId = req.params.id;
  const q = 'DELETE FROM inventory WHERE itemId = ?';
  db.query(q, [inventoryId], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    return res.status(200).json({ message: 'Inventory item deleted successfully' });
  });
});

module.exports = router;
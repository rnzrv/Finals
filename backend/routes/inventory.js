const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');


router.post('/addInventory', verifyToken, (req, res) => {
  const {itemName, brand, code, price, category, quantity, logo } = req.body;
    if (!itemName || !brand || !code || !price || !category || !quantity) {   
    return res.status(400).json({ error: 'All fields are required' });
    }
    const q = `
    INSERT INTO inventory (itemName, brand, code, price, category, quantity, logo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    db.query(q, [itemName, brand, code, price, category, quantity, logo], (err) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.status(201).json({ message: 'Product added to inventory successfully' });
  }
    );
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
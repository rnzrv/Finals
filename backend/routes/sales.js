const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');

// GET ALL SALES WITH DATE FILTER
// GET ALL SALES WITH DATE FILTER
router.get('/getSales', verifyToken, (req, res) => {
  const { startDate, endDate } = req.query;

  let query = 'SELECT * FROM sales WHERE 1=1';
  const params = [];

  if (startDate) {
    query += ' AND saleDate >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND saleDate <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY saleDate DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch sales data' });
    }
    res.json(results);
  });
});

// GET ALL SALES WITHOUT FILTER
router.get('/getSalesAll', verifyToken, (req, res) => {
  const query = 'SELECT * FROM sales ORDER BY saleDate DESC';
    db.query(query, (err, results) => {
    if (err) {
        return err// 👈 CHECK TERMINAL
        
    }
    res.json(results);
  });
});

// GET SINGLE SALE BY ID
router.get('/getSales/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM sales WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch sale' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(results[0]);
  });
});

// CREATE NEW SALE
router.post('/addSale', verifyToken, (req, res) => {
  const { reference, customerName, paymentMethod, subTotal, taxAmount, totalAmount, totalPayment, changes } = req.body;

  if (!reference || !customerName || !paymentMethod || !subTotal || !totalAmount || !totalPayment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const date = new Date().toISOString().split('T')[0];
  const query = `
    INSERT INTO sales (reference, date, customerName, paymentMethod, subTotal, taxAmount, totalAmount, totalPayment, changes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [reference, date, customerName, paymentMethod, subTotal, taxAmount || 0, totalAmount, totalPayment, changes || 0];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to add sale' });
    }
    res.status(201).json({ message: 'Sale added successfully', id: result.insertId });
  });
});

// UPDATE SALE
router.put('/updateSale/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { reference, customerName, paymentMethod, subTotal, taxAmount, totalAmount, totalPayment, changes } = req.body;

  if (!reference || !customerName || !paymentMethod || !subTotal || !totalAmount || !totalPayment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    UPDATE sales 
    SET reference = ?, customerName = ?, paymentMethod = ?, subTotal = ?, taxAmount = ?, totalAmount = ?, totalPayment = ?, changes = ?
    WHERE id = ?
  `;

  const params = [reference, customerName, paymentMethod, subTotal, taxAmount || 0, totalAmount, totalPayment, changes || 0, id];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update sale' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({ message: 'Sale updated successfully' });
  });
});

// DELETE SALE
router.delete('/deleteSale/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM sales WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete sale' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted successfully' });
  });
});

// GET SALES SUMMARY (Total sales, count, etc.)
router.get('/summary', verifyToken, (req, res) => {
  const { startDate, endDate } = req.query;
  let query = 'SELECT COUNT(*) as totalSales, SUM(totalAmount) as totalRevenue FROM sales WHERE 1=1';
  const params = [];

  if (startDate) {
    query += ' AND DATE(date) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(date) <= ?';
    params.push(endDate);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }
    res.json(results[0]);
  });
});

module.exports = router;
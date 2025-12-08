const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype)) {
    return cb(new Error('Only image files (png, jpg, jpeg, gif, webp) are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting file:', err);
  });
};

// ADD INVENTORY
router.post('/addInventory', verifyToken, upload.single('logo'), (req, res) => {
  let {
    itemName, brand, code, costUnit, sellingPrice,
    reference, suppliers, quantity, grandTotal,
    expiryDate, category, forceUpdate
  } = req.body;

  // Normalize inputs
  itemName = String(itemName || '').trim();
  brand = String(brand || '').trim();
  code = String(code || '').trim();
  reference = String(reference || '').trim();
  suppliers = String(suppliers || '').trim();
  category = String(category || '').trim();
  const costUnitNum = Number(costUnit);
  const sellingPriceNum = Number(sellingPrice);
  const qtyNum = Number(quantity);
  const grandTotalNum = Number(grandTotal);
  const expDate = expiryDate ? String(expiryDate).trim() : null;
  const logo = req.file ? `uploads/${req.file.filename}` : null;

  const cleanupFile = () => { if (req.file) fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename), () => {}); };

  // Validations
  const ymd = /^\d{4}-\d{2}-\d{2}$/;
  if (!itemName || !brand || !code || !reference || !suppliers || !category) {
    cleanupFile(); return res.status(400).json({ error: 'All fields are required' });
  }
  if (!Number.isFinite(costUnitNum) || costUnitNum <= 0) {
    cleanupFile(); return res.status(400).json({ error: 'Cost unit must be a number greater than 0' });
  }
  if (!Number.isFinite(sellingPriceNum) || sellingPriceNum <= 0) {
    cleanupFile(); return res.status(400).json({ error: 'Selling price must be a number greater than 0' });
  }
  if (!Number.isInteger(qtyNum) || qtyNum < 0) {
    cleanupFile(); return res.status(400).json({ error: 'Quantity must be an integer ≥ 0' });
  }
  if (!Number.isFinite(grandTotalNum) || grandTotalNum < 0) {
    cleanupFile(); return res.status(400).json({ error: 'Grand total must be ≥ 0' });
  }
  // Expiry required for both Product and Service
  if (!expDate || !ymd.test(expDate) || Number.isNaN(Date.parse(expDate))) {
    cleanupFile(); return res.status(400).json({ error: 'Expiry date must be valid YYYY-MM-DD' });
  }

  if (category !== 'Product' && category !== 'Service') {
    cleanupFile(); return res.status(400).json({ error: 'Category must be either Product or Service' });
  }

  // 1) Check if inventory item exists by code and detect field mismatches
  const getInvQ = 'SELECT itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, logo FROM inventory WHERE code = ? LIMIT 1';
  db.query(getInvQ, [code], (invErr, invRows) => {
    if (invErr) { cleanupFile(); return res.status(500).json({ error: invErr.sqlMessage }); }

    const existing = invRows && invRows[0] ? invRows[0] : null;
    const mismatches = [];

    if (existing) {
      // Compare non-quantity fields; expiryDate can be null
      if (existing.itemName !== itemName) mismatches.push({ field: 'itemName', existing: existing.itemName, incoming: itemName });
      if (existing.brand !== brand) mismatches.push({ field: 'brand', existing: existing.brand, incoming: brand });
      if (Number(existing.costUnit) !== costUnitNum) mismatches.push({ field: 'costUnit', existing: Number(existing.costUnit), incoming: costUnitNum });
      if (Number(existing.sellingPrice) !== sellingPriceNum) mismatches.push({ field: 'sellingPrice', existing: Number(existing.sellingPrice), incoming: sellingPriceNum });
      if (existing.category !== category) mismatches.push({ field: 'category', existing: existing.category, incoming: category });
      const existingExpiry = existing.expiryDate ? existing.expiryDate.toISOString().slice(0, 10) : null;
      const incomingExpiry = expDate;
      if (existingExpiry !== incomingExpiry) mismatches.push({ field: 'expiryDate', existing: existingExpiry, incoming: incomingExpiry });
      if ((existing.logo || null) !== (logo || null)) mismatches.push({ field: 'logo', existing: existing.logo || null, incoming: logo || null });

      const forced = String(forceUpdate || '').toLowerCase() === 'true';
      if (mismatches.length && !forced) {
        return res.status(409).json({
          error: 'Existing product code has different details. Confirm to update fields and add quantity.',
          code,
          mismatches,
          canForceUpdate: true
        });
      }
    }

    // 2) Insert into purchases (store expDate as provided)
    const insertPurchase = `
      INSERT INTO purchases (itemName, brand, code, costUnit, sellingPrice, reference, suppliers, quantity, grandTotal, expiryDate, category, logo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertPurchase,
      [itemName, brand, code, costUnitNum, sellingPriceNum, reference, suppliers, qtyNum, grandTotalNum, expDate, category, logo],
      (pErr, pRes) => {
        if (pErr && pErr.code !== 'ER_DUP_ENTRY') {
          cleanupFile();
          return res.status(500).json({ error: pErr.sqlMessage });
        }

        // 3) Upsert inventory (store expDate for both Product and Service)
        const upsertInventory = `
          INSERT INTO inventory (itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, logo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            itemName = VALUES(itemName),
            brand = VALUES(brand),
            costUnit = VALUES(costUnit),
            sellingPrice = VALUES(sellingPrice),
            category = VALUES(category),
            quantity = quantity + VALUES(quantity),
            expiryDate = VALUES(expiryDate),
            logo = COALESCE(VALUES(logo), logo)
        `;
        db.query(
          upsertInventory,
          [itemName, brand, code, costUnitNum, sellingPriceNum, category, qtyNum, expDate, logo],
          (iErr) => {
            if (iErr) {
              cleanupFile();
              return res.status(500).json({ error: iErr.sqlMessage });
            }
            return res.status(201).json({
              message: existing
                ? (mismatches.length ? 'Inventory fields updated and quantity added' : 'Inventory quantity added')
                : 'Inventory item created',
              data: {
                purchaseId: pRes?.insertId || null,
                code,
                addedQuantity: qtyNum,
                updatedFields: mismatches.map(m => m.field),
              }
            });
          }
        );
      }
    );
  });
});

// UPDATE INVENTORY
router.put('/updateInventory/:id', verifyToken, upload.single('logo'), (req, res) => {
  const inventoryId = req.params.id;
  let { itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, forceUpdate } = req.body;
  let logo = req.file ? `/uploads/${req.file.filename}` : null;

  // normalize
  itemName = String(itemName || '').trim();
  brand = String(brand || '').trim();
  code = String(code || '').trim();
  category = String(category || '').trim();
  const costUnitNum = Number(costUnit);
  const sellingPriceNum = Number(sellingPrice);
  const qtyNum = Number(quantity);
  const expDate = typeof expiryDate === 'string' ? expiryDate.trim() : null;
  const forced = String(forceUpdate || '').toLowerCase() === 'true';

  // validations
  if (!itemName || !brand || !code || !category || !Number.isFinite(costUnitNum) || !Number.isFinite(sellingPriceNum) || !Number.isInteger(qtyNum)) {
    return res.status(400).json({ error: 'All fields are required and must be valid' });
  }
  if (costUnitNum < 0) return res.status(400).json({ error: 'Cost unit must be a number ≥ 0' });
  if (sellingPriceNum <= 0) return res.status(400).json({ error: 'Selling price must be a number > 0' });
  if (qtyNum < 0) return res.status(400).json({ error: 'Quantity must be an integer ≥ 0' });

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (expDate) {
    if (!dateRegex.test(expDate) || Number.isNaN(Date.parse(expDate))) {
      return res.status(400).json({ error: 'Expiry date must be a valid date (YYYY-MM-DD)' });
    }
    if (new Date(expDate) < new Date()) {
      return res.status(400).json({ error: 'Expiry date must be a future date' });
    }
  }

  // Load current record
  const getCurrentQ = 'SELECT itemId, itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, logo FROM inventory WHERE itemId = ? LIMIT 1';
  db.query(getCurrentQ, [inventoryId], (curErr, curRows) => {
    if (curErr) return res.status(500).json({ error: curErr.sqlMessage });
    if (!curRows.length) return res.status(404).json({ error: 'Item not found' });
    const current = curRows[0];

    // If no new file, keep existing logo
    if (!req.file) logo = current.logo;

    // Check if target code exists on another item
    const getByCodeQ = 'SELECT itemId, itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, logo FROM inventory WHERE code = ? LIMIT 1';
    db.query(getByCodeQ, [code], (codeErr, codeRows) => {
      if (codeErr) return res.status(500).json({ error: codeErr.sqlMessage });

      const existing = codeRows.length ? codeRows[0] : null;

      // If the code belongs to a different item
      if (existing && existing.itemId !== current.itemId) {
        const mismatches = [];
        if (existing.itemName !== itemName) mismatches.push({ field: 'itemName', existing: existing.itemName, incoming: itemName });
        if (existing.brand !== brand) mismatches.push({ field: 'brand', existing: existing.brand, incoming: brand });
        if (Number(existing.costUnit) !== costUnitNum) mismatches.push({ field: 'costUnit', existing: Number(existing.costUnit), incoming: costUnitNum });
        if (Number(existing.sellingPrice) !== sellingPriceNum) mismatches.push({ field: 'sellingPrice', existing: Number(existing.sellingPrice), incoming: sellingPriceNum });
        if (existing.category !== category) mismatches.push({ field: 'category', existing: existing.category, incoming: category });
        const existingExpiry = existing.expiryDate ? existing.expiryDate.toISOString().slice(0, 10) : null;
        const incomingExpiry = expDate;
        if (existingExpiry !== incomingExpiry) mismatches.push({ field: 'expiryDate', existing: existingExpiry, incoming: incomingExpiry });
        if ((existing.logo || null) !== (logo || null)) mismatches.push({ field: 'logo', existing: existing.logo || null, incoming: logo || null });

        if (mismatches.length && !forced) {
          return res.status(409).json({
            error: 'Existing product code has different details. Confirm to update fields and add quantity.',
            code,
            mismatches,
            canForceUpdate: true
          });
        }

        const updateExistingQ = `
          UPDATE inventory
          SET itemName = ?, brand = ?, costUnit = ?, sellingPrice = ?, category = ?, quantity = quantity + ?, expiryDate = ?, logo = ?
          WHERE itemId = ?
        `;
        db.query(
          updateExistingQ,
          [itemName, brand, costUnitNum, sellingPriceNum, category, qtyNum, expDate, logo, existing.itemId],
          (updErr) => {
            if (updErr) return res.status(500).json({ error: updErr.sqlMessage });
            return res.status(200).json({
              message: 'Existing item updated and quantity added',
              data: { targetItemId: existing.itemId, addedQuantity: qtyNum, updatedFields: mismatches.map(m => m.field) }
            });
          }
        );
      } else {
        // Code either same item or new code → simple update on current item
        const dupQ = 'SELECT 1 FROM inventory WHERE code = ? AND itemId != ? LIMIT 1';
        db.query(dupQ, [code, inventoryId], (checkErr, rows) => {
          if (checkErr) return res.status(500).json({ error: checkErr.sqlMessage });
          if (rows && rows.length > 0) {
            // proceed anyway; mismatches were zero
          }

          const updateQ = `
            UPDATE inventory
            SET itemName = ?, brand = ?, code = ?, costUnit = ?, sellingPrice = ?, category = ?, quantity = ?, expiryDate = ?, logo = ?
            WHERE itemId = ?
          `;
          db.query(
            updateQ,
            [itemName, brand, code, costUnitNum, sellingPriceNum, category, qtyNum, expDate, logo, inventoryId],
            (err, result) => {
              if (err) return res.status(500).json({ error: err.sqlMessage });
              if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
              return res.status(200).json({ message: 'Inventory item updated successfully' });
            }
          );
        });
      }
    });
  });
});

// LIST PURCHASES
router.get('/Purchases/inventory', verifyToken, (req, res) => {
  const q = 'SELECT itemId, itemName, DATE_FORMAT(created_at, "%Y-%m-%d") as Date, reference, suppliers, quantity, grandTotal, DATE_FORMAT(expiryDate, "%Y-%m-%d") as expiryDate, category FROM purchases';

  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.status(200).json(data);
  });
});

// LIST INVENTORY
router.get('/getInventory', verifyToken, (req, res) => {
  const q = 'SELECT itemId, itemName, brand, code, costUnit, sellingPrice, category, quantity, DATE_FORMAT(expiryDate, "%Y-%m-%d") as expiryDate, logo FROM inventory';
  
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.status(200).json(data);
  });
});

// DELETE INVENTORY
router.delete('/deleteInventory/:id', verifyToken, (req, res) => {
  const inventoryId = req.params.id;

  if (!inventoryId) {
    return res.status(400).json({ error: 'Inventory ID is required' });
  }

  const logoQ = 'Select logo FROM inventory WHERE itemId = ?';
  db.query(logoQ, [inventoryId], (logoErr, logoRes) => {
    if (logoErr) return res.status(500).json({error: logoErr.sqlMessage});
    if (logoRes.length === 0) return res.status(404).json({ error: 'Item not found' });

    const logoPath = logoRes[0].logo;
    if (logoPath) {
      deleteFile(path.join(__dirname, '..', logoPath));
    }

    const q = 'DELETE FROM inventory WHERE itemId = ?';
    db.query(q, [inventoryId], (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
      return res.status(200).json({ message: 'Inventory item deleted successfully' });
    });
  });
});

module.exports = router;
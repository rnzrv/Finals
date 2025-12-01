const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const verifyToken = require('../middleware/middleware');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({ error: err.message }); // e.g., file too large
//   }
//   if (err && err.message && err.message.startsWith('Only image files')) {
//     return res.status(400).json({ error: err.message });
//   }
//   next(err);
// });

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

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit



const uploadPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ...existing code...
router.post('/addInventory', verifyToken, upload.single('logo'), (req, res) => {
  let { itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate} = req.body;
  let logo = req.file ? `/uploads/${req.file.filename}` : null;

  itemName = typeof itemName === 'string' ? itemName.trim() : '';
  brand = typeof brand === 'string' ? brand.trim() : '';
  code = typeof code === 'string' ? code.trim() : '';
  costUnit = costUnit !== undefined ? Number(costUnit) : null;
  sellingPrice = sellingPrice !== undefined ? Number(sellingPrice) : null;
  category = typeof category === 'string' ? category.trim() : '';
  quantity = quantity !== undefined ? Number(quantity) : null;
  expiryDate = typeof expiryDate === 'string' ? expiryDate.trim() : null;
  logo = logo ?? null;

  

  const cleanupFile = () => {
    if (req.file) {
      fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename), () => {});
    }
  };

  const costUnitNum = Number(costUnit);
  const sellingPriceNum = Number(sellingPrice);
  const qtyNum = Number(quantity);

  if (!itemName || !brand || !code || costUnit === undefined || sellingPrice === undefined || quantity === undefined || !category || !expiryDate) {
    cleanupFile();
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (Number.isNaN(costUnitNum) || costUnitNum <= 0) {
    cleanupFile();
    return res.status(400).json({ error: 'Cost unit must be a number greater than 0' });
  }
  if (Number.isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
    cleanupFile();
    return res.status(400).json({ error: 'Selling price must be a number greater than 0' });
  }
  if (!Number.isInteger(qtyNum) || qtyNum < 0) {
    cleanupFile();
    return res.status(400).json({ error: 'Quantity must be an integer ≥ 0' });
  }
  if (!expiryDate) {
    cleanupFile();
    return res.status(400).json({ error: 'Expiry date is required' });
  }
  if (isNaN(Date.parse(expiryDate))) {
    cleanupFile();
    return res.status(400).json({ error: 'Expiry date must be a valid date' });
  }

  const regexDate = /^\d{4}-\d{2}-\d{2}$/;
  const dateNow = new Date();
  if (!regexDate.test(expiryDate) || isNaN(Date.parse(expiryDate))) {
    cleanupFile();
    return res.status(400).json({ error: 'Expiry date must be a valid date in YYYY-MM-DD format' });
  }
  if (new Date(expiryDate) < dateNow) {
    cleanupFile();
    return res.status(400).json({ error: 'Expiry date must be a future date' });
  }

  const checkQ = 'SELECT 1 FROM inventory WHERE code = ? LIMIT 1';
  db.query(checkQ, [code], (checkErr, rows) => {

    if (checkErr) {
      cleanupFile();
      return res.status(500).json({ error: checkErr.sqlMessage });
    }
    if (rows && rows.length > 0) {
      cleanupFile();
      return res.status(409).json({ error: 'Product code already exists' });
    }

    const insertQ = `
      INSERT INTO inventory (itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate, logo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertQ, [itemName, brand, code, costUnitNum, sellingPriceNum, category, qtyNum, expiryDate, logo], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          cleanupFile();
          return res.status(409).json({ error: 'Product code already exists' });
        }
        cleanupFile();
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


router.put('/updateInventory/:id', verifyToken, upload.single('logo'), (req, res) => {
  const inventoryId = req.params.id;
  let { itemName, brand, code, costUnit, sellingPrice, category, quantity, expiryDate} = req.body;
  let logo = req.file ? `/uploads/${req.file.filename}` : null;

  itemName = typeof itemName === 'string' ? itemName.trim() : '';
  brand = typeof brand === 'string' ? brand.trim() : '';
  code = typeof code === 'string' ? code.trim() : '';
  costUnit = costUnit !== undefined ? Number(costUnit) : null;
  sellingPrice = sellingPrice !== undefined ? Number(sellingPrice) : null;
  quantity = quantity !== undefined ? Number(quantity) : null;
  category = typeof category === 'string' ? category.trim() : '';
  logo = logo ?? null;
  expiryDate = typeof expiryDate === 'string' ? expiryDate.trim() : null;

  if (!itemName || !brand || !code || costUnit === undefined || sellingPrice === undefined || quantity === undefined || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const costUnitNum = Number(costUnit);
  const sellingPriceNum = Number(sellingPrice);
  const qtyNum = Number(quantity);
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const dateNow = new Date();

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
  if (expiryDate && !dateRegex.test(expiryDate)) {
    return res.status(400).json({ error: 'Expiry date must be in the format YYYY-MM-DD' });
  }

  if (expiryDate && new Date(expiryDate) < dateNow) {
    return res.status(400).json({ error: 'Expiry date must be a future date' });
  }

  const logoQ = 'Select logo FROM inventory WHERE itemId = ?';
  db.query(logoQ, [inventoryId], (logoErr, logoRes) => {
    if(logoErr) return res.status(500).json({ error: logoErr.sqlMessage });
    if(logoRes.length === 0) return res.status(404).json({ error: 'Item not found' });

    // Update logo if new file uploaded, else keep existing
    if (req.file) {
      const oldLogo = logoRes[0].logo;
      if (oldLogo) {
        const oldLogoPath = path.join(__dirname, '..', oldLogo);
        fs.unlink(oldLogoPath, (err) => {});
      }
      logo = `/uploads/${req.file.filename}`;
    } else {
      logo = logoRes[0].logo;
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
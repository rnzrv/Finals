const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');
const multer = require('multer');
const upload = multer();

router.get('/purchases', verifyToken, (req,res) => {
    const q = "SELECT * from purchases";
    db.query(q, (err,data) => {
        if(err) return res.status(500).json ({ error:err.sqlMessage});
        return res.json(data);
    });
})

// CREATE NEW PURCHASES FOR TABLES
// router.post()

// GET HISTORY

// router.get()

// EDIT PURCHASES
// router.put 


// DELETE PURCHASES
// router.delete()

// itemName, date, brand, code, costUnit, sellingPrice, 
// reference, suppliers, quantity, grandTotal, expiryDate, 
// category

/*Create Table if not exists purchases(
    itemId INT AUTO_INCREMENT PRIMARY KEY,
    itemName VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    costUnit DECIMAL(10,2) NULL,
    sellingPrice DECIMAL(10,2) NULL,
    date DATE NOT NULL,
    reference VARCHAR(100) NOT NULL UNIQUE,
    suppliers VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    grandTotal DECIMAL(10,2) NOT NULL,
    expiryDate DATE,
    category ENUM('Product', 'Service') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)*/
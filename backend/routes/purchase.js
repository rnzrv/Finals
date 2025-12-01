const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');

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
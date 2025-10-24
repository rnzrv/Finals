const mysql = require('mysql');


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})


db.connect((err) =>{
    if(err) return console.error('Error connecting to database:', err);
    console.log('Connected to database');
})

module.exports = db;
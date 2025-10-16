const express = require('express');
const mysql = require('mysql');
const cors = require('cors');


const app = express()
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'softeng'
})


app.get('/', (req, res) => {
  return res.json("From backend")
})

app.listen(8081, () => {
  console.log("Server is running on port 8081")
})


app.get('/users', (req, res) => {
    const q = "SELECT * FROM users"
    db.query(q, (err, data) => {
        if (err) return res.json(err)
        return res.json(data)
    })
})

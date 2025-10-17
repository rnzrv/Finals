const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // ✅ allows reading JSON body

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'softeng'
});

app.listen(8081, () => {
  console.log("✅ Server running on port 8081");
});

// Test route
app.get('/', (req, res) => {
  return res.json("Backend is running");
});

// Get all users
app.get('/users', (req, res) => {
  const q = "SELECT * FROM users";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// ✅ Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body; // destructuring
  const q = "SELECT * FROM users WHERE username = ? AND password = ?";
  
  db.query(q, [username, password], (err, data) => {
    if (err) return res.json(err);
    if (data.length > 0) {
      return res.json(data[0]); // success
    } else {
      return res.status(401).json("Invalid credentials");
    }
  });
});

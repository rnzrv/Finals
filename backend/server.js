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


app.get('/patients',(req,res)=>{
  const q = "SELECT * FROM patients";
  db.query(q,(err,data)=>{
    if(err) return res.json(err);
    return res.json(data);
  })
})


// Add a new patient
app.post("/addPatient", (req, res) => {
  const { name, email, number, last_visit } = req.body;
  const q = "INSERT INTO patients (name, email, number, last_visit) VALUES (?, ?, ?, ?)";

  db.query(q, [name, email, number, last_visit], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.status(200).json({ message: "Patient added successfully!" });
  });
});

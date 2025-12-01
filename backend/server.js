require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const verifyToken = require('./middleware/middleware');


const app = express();
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
console.log("Allowed frontend:", process.env.FRONTEND_URL);
app.use(express.json());
app.use(cookieParser());



// Import routes
const userRoutes = require('./routes/users');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointment')
const inventoryRoutes = require('./routes/inventory');




// Use routes
app.use('/users', userRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/inventory', inventoryRoutes);
// Test route

app.get('/', (req, res) => {
  return res.json("Backend is running");
});


app.get('/getusers', verifyToken, (req,res) => {
  const q = "SELECT * FROM users";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    return res.json(data);
  });
})

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
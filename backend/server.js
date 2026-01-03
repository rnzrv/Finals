require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const verifyToken = require('./middleware/middleware');
const path = require('path');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

console.log("Allowed frontend:", process.env.FRONTEND_URL);
app.use(express.json());
app.use(cookieParser());



// Import routes
const userRoutes = require('./routes/users');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointment')
const inventoryRoutes = require('./routes/inventory');
const purchaseRoutes = require('./routes/purchase');
const posRoutes = require('./routes/pos');
const services = require('./routes/services');
const summaryRoutes = require('./routes/summary');
const dashboardRoutes = require('./routes/dashboard');
const logoutRoutes = require('./routes/logout');
const salesRoutes = require('./routes/sales');
const loginRoutes = require('./routes/website/login');
const serviceRoutes = require('./routes/website/services');
const webAppointmentRoutes = require('./routes/website/webAppointment');
const notificationRoutes = require('./routes/notification');
const businessProfileRoutes = require('./routes/businessProfile');

// Use routes
app.use('/users', userRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/pos', posRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/services', services);
app.use('/summary', summaryRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/logout', logoutRoutes);
app.use('/sales', salesRoutes);
app.use('/notifications', notificationRoutes);
app.use('/business-profile', businessProfileRoutes);
app.use('/login', loginRoutes);
app.use('/website/services', serviceRoutes);
app.use('/web/appointments', webAppointmentRoutes);
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
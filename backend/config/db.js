const mysql = require('mysql');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const connection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    return;
  }
  console.log('✅ Connected to MySQL server.');

  // Step 1: Create database if not exists
  connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``, (err) => {
    if (err) throw err;
    console.log(`✅ Database '${dbConfig.database}' is ready.`);

    // Step 2: Switch to the database
    connection.changeUser({ database: dbConfig.database }, (err) => {
      if (err) throw err;

      // Step 3: Create tables if not exist
      const createPatientsTable = `
        CREATE TABLE IF NOT EXISTS patients (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          contact_number VARCHAR(20),
          age INT,
          gender ENUM('Male', 'Female', 'Other'),
          medical_notes TEXT,
          last_visit DATE,
          status ENUM('active', 'inactive', 'scheduled') NOT NULL DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`;

      const createAppointmentsTable = `
        CREATE TABLE IF NOT EXISTS appointments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id INT NOT NULL,
          doctor VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          service_type ENUM('Spa', 'Facial Services', 'Massage Therapy', 'Other') NOT NULL,
          status ENUM('Pending', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        )`;

      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          userId INT AUTO_INCREMENT PRIMARY KEY,
          userType VARCHAR(50) NOT NULL,
          username VARCHAR(50) NOT NULL,
          password VARCHAR(255) NOT NULL
        )`;

      const createInventoryTable = `
        CREATE TABLE IF NOT EXISTS inventory (
        itemId INT UNSIGNED NOT NULL AUTO_INCREMENT,
        itemName VARCHAR(100) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL,
        costUnit DECIMAL(10,2) NULL,        
        sellingPrice DECIMAL(10,2) NULL,    
        category VARCHAR(100) NOT NULL,
        quantity INT UNSIGNED NOT NULL DEFAULT 0,
        expiryDate DATE NULL,               
        logo VARCHAR(255) NULL,             
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (itemId),
        UNIQUE KEY ux_inventory_code (code),
        KEY ix_inventory_category (category)
      )`;

      const createPurchasesTable = `
        Create Table if not exists purchases(
        itemId INT AUTO_INCREMENT PRIMARY KEY,
        itemName VARCHAR(100) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL,
        costUnit DECIMAL(10,2) NULL,
        sellingPrice DECIMAL(10,2) NULL,
        reference VARCHAR(100) NOT NULL,
        suppliers VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        grandTotal DECIMAL(10,2) NOT NULL,
        expiryDate DATE,
        category ENUM('Product', 'Service') NOT NULL,
        logo VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`;


      connection.query(createPatientsTable, (err) => {
        if (err) throw err;
        console.log('✅ patients table ready.');
      });

      connection.query(createAppointmentsTable, (err) => {
        if (err) throw err;
        console.log('✅ appointments table ready.');
      });

      connection.query(createUsersTable, (err) => {
        if (err) throw err;
        console.log('✅ users table ready.');
      });

      connection.query(createInventoryTable, (err) => {
        if (err) throw err;
        console.log('✅ inventory table ready.');
      });

      connection.query(createPurchasesTable, (err) => {
        if (err) throw err;
        console.log('✅ purchases table ready.');
      });
    });
  });
});

module.exports = connection;

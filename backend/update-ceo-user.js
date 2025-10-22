// insert-users.js
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'softeng'
});

const users = [
  { usertype: 'ceo', username: 'ceo01', password: 'ceo123' },
  { usertype: 'admin', username: 'admin01', password: 'admin123' },
  { usertype: 'user', username: 'user01', password: 'user123' }
];

async function insertUsers() {
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`Generated hash for ${user.username}:`, hash);
    db.query(
      "INSERT INTO users (usertype, username, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE usertype = ?, password = ?",
      [user.usertype, user.username, hash, user.usertype, hash],
      (err, result) => {
        if (err) {
          console.error(`Error inserting ${user.username}:`, err.sqlMessage);
        } else {
          console.log(`✅ ${user.username} created or updated`);
        }
      }
    );
  }
  db.end();
}

insertUsers().catch(err => console.error('Error:', err));
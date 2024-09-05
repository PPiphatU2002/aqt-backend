const mysql = require('mysql2');

// สร้าง connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Export connection
module.exports = { connection };


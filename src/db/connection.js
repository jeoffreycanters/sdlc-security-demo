const mysql = require('mysql2/promise');

// VULNERABILITY: Hardcoded database credentials
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'rootpassword123',
  database: 'sdlc_demo'
});

module.exports = { db };

require('dotenv').config();
const mysql = require('mysql2/promise');

// MySQL 연결 풀(pool) 생성
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

module.exports = pool;
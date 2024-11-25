const express = require("express");
const mariadb = require("mariadb");

const app = express();
const port = 3005;

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function validateEnv() {
  if (!process.env.DB_HOST) {
    throw new Error("Environment variable DB_HOST is missing.");
  }
  if (!process.env.DB_USER) {
    throw new Error("Environment variable DB_USER is missing.");
  }
  if (!process.env.DB_PASSWORD) {
    throw new Error("Environment variable DB_PASSWORD is missing.");
  }
  if (!process.env.DB_NAME) {
    throw new Error("Environment variable DB_NAME is missing.");
  }
}

async function checkConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Connected to the database!");

    const rows = await conn.query("SELECT 1 as result");
    console.log("Test query result:", rows);
  } catch (err) {
    console.error("Database connection failed:", err);
  } finally {
    if (conn) conn.release(); // 연결 반환
  }
}
async function defineSchema() {
  let conn;
  try {
    conn = await pool.getConnection();
    // 데이터베이스 생성
    await conn.query("CREATE DATABASE IF NOT EXISTS db");
    await conn.query("USE db");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS diary (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database schema defined successfully!");
  } catch (err) {
    console.error("Error defining schema:", err);
  } finally {
    if (conn) conn.release();
  }
}

async function init() {
  validateEnv();
  await checkConnection();
  await defineSchema();
}

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

init();

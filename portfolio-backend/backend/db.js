const { Pool } = require("pg");

const connectionString = (process.env.DATABASE_URL || "").replace(/sslmode=[^&]+&?/, "").replace(/[?&]$/, "");

const pool = new Pool({
  connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => console.error("Postgres pool error:", err.message));

module.exports = pool;

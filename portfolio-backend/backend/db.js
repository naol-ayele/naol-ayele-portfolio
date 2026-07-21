const { Pool } = require("pg");

// Append uselibpqcompat=true so sslmode=require works correctly
// (pg v8 treats 'require' as 'verify-full' by default, which rejects self-signed certs)
const url = (process.env.DATABASE_URL || "").includes("?")
  ? process.env.DATABASE_URL + "&uselibpqcompat=true"
  : process.env.DATABASE_URL + "?uselibpqcompat=true";

const pool = new Pool({ connectionString: url });

pool.on("error", (err) => console.error("Postgres pool error:", err.message));

module.exports = pool;

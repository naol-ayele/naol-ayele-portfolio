require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const contactRoutes = require("./routes/contact");
const projectRoutes = require("./routes/projects");
const postRoutes = require("./routes/posts");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// ---------- middleware ----------
app.use(express.json({ limit: "100kb" }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow no-origin requests, null origin (file://), and any explicitly allowed origin
      if (!origin || origin === "null" || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);

// Basic rate limiting on the write-heavy public endpoints to prevent abuse
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
// Only rate-limit POST requests on contact (GET is admin-only)
app.post("/api/contact", writeLimiter);
app.post("/api/projects/:slug/like", writeLimiter);
app.use("/api/analytics", writeLimiter);

const db = require("./db");

// ---------- auto-init: create tables + seed projects ----------
async function initDb() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
        message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
        views INTEGER NOT NULL DEFAULT 0, likes INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
        body TEXT NOT NULL, published INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS pageviews (
        id SERIAL PRIMARY KEY, path TEXT NOT NULL, referrer TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const seedProjects = [
      { slug: "conwise", name: "ConWise" },
      { slug: "zenatech", name: "ZenaTech" },
      { slug: "banking-system", name: "Banking Management System" },
      { slug: "leafguard", name: "LeafGuard" },
    ];
    for (const p of seedProjects) {
      await db.query(
        "INSERT INTO projects (slug, name) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
        [p.slug, p.name]
      );
    }
    console.log("DB initialized — tables created, projects seeded.");
  } catch (err) {
    console.error("DB init error:", err.message);
  }
}

initDb();

// ---------- routes ----------
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/contact", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/analytics", analyticsRoutes);

// ---------- error handling ----------
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
});

const express = require("express");
const db = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.post("/pageview", async (req, res) => {
  const { path: pagePath, referrer } = req.body || {};
  if (!pagePath) {
    return res.status(400).json({ error: "path is required" });
  }

  try {
    await db.query(
      "INSERT INTO pageviews (path, referrer) VALUES ($1, $2)",
      [pagePath, referrer || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/summary", requireAdmin, async (req, res) => {
  try {
    const totals = await db.query(
      `SELECT path, COUNT(*)::int AS views
       FROM pageviews
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY path
       ORDER BY views DESC`
    );
    const totalViews = await db.query(
      `SELECT COUNT(*)::int AS count FROM pageviews WHERE created_at >= NOW() - INTERVAL '30 days'`
    );
    res.json({ totalViews: totalViews.rows[0].count, byPath: totals.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

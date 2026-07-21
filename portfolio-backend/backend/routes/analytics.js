const express = require("express");
const db = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// POST /api/analytics/pageview — log a page visit (call once per page load)
router.post("/pageview", (req, res) => {
  const { path: pagePath, referrer } = req.body || {};
  if (!pagePath) {
    return res.status(400).json({ error: "path is required" });
  }
  db.prepare("INSERT INTO pageviews (path, referrer) VALUES (?, ?)").run(
    pagePath,
    referrer || null
  );
  res.status(201).json({ ok: true });
});

// GET /api/analytics/summary — totals per path, last 30 days (admin only)
router.get("/summary", requireAdmin, (req, res) => {
  const totals = db
    .prepare(
      `SELECT path, COUNT(*) as views
       FROM pageviews
       WHERE created_at >= datetime('now', '-30 days')
       GROUP BY path
       ORDER BY views DESC`
    )
    .all();
  const totalViews = db
    .prepare(`SELECT COUNT(*) as count FROM pageviews WHERE created_at >= datetime('now', '-30 days')`)
    .get();
  res.json({ totalViews: totalViews.count, byPath: totals });
});

module.exports = router;

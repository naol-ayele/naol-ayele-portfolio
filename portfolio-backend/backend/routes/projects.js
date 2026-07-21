const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/projects — list all projects with counts
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT slug, name, views, likes FROM projects ORDER BY id").all();
  res.json(rows);
});

// POST /api/projects/:slug/view — increment view count (call once per page load / card impression)
router.post("/:slug/view", (req, res) => {
  const { slug } = req.params;
  const result = db
    .prepare("UPDATE projects SET views = views + 1 WHERE slug = ?")
    .run(slug);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Unknown project slug" });
  }
  const row = db.prepare("SELECT slug, views FROM projects WHERE slug = ?").get(slug);
  res.json(row);
});

// POST /api/projects/:slug/like — toggle like count (action: "like" | "unlike")
router.post("/:slug/like", (req, res) => {
  const { slug } = req.params;
  const { action = "like" } = req.body;

  if (action !== "like" && action !== "unlike") {
    return res.status(400).json({ error: "action must be 'like' or 'unlike'" });
  }

  const existing = db.prepare("SELECT slug FROM projects WHERE slug = ?").get(slug);
  if (!existing) return res.status(404).json({ error: "Unknown project slug" });

  if (action === "unlike") {
    db.prepare("UPDATE projects SET likes = MAX(likes - 1, 0) WHERE slug = ?").run(slug);
  } else {
    db.prepare("UPDATE projects SET likes = likes + 1 WHERE slug = ?").run(slug);
  }

  const row = db.prepare("SELECT slug, likes FROM projects WHERE slug = ?").get(slug);
  res.json(row);
});

module.exports = router;

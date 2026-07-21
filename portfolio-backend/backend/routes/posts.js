const express = require("express");
const db = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/posts — list published posts (newest first)
router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT slug, title, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC")
    .all();
  res.json(rows);
});

// GET /api/posts/:slug — single post
router.get("/:slug", (req, res) => {
  const row = db
    .prepare("SELECT slug, title, body, created_at FROM posts WHERE slug = ? AND published = 1")
    .get(req.params.slug);
  if (!row) return res.status(404).json({ error: "Post not found" });
  res.json(row);
});

// POST /api/posts — create a post (admin only, requires x-api-key header)
router.post("/", requireAdmin, (req, res) => {
  const { title, body, published = true } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }

  const slug = slugify(title);
  try {
    const result = db
      .prepare("INSERT INTO posts (slug, title, body, published) VALUES (?, ?, ?, ?)")
      .run(slug, title.trim(), body.trim(), published ? 1 : 0);
    res.status(201).json({ ok: true, slug, id: result.lastInsertRowid });
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "A post with that title/slug already exists" });
    }
    throw err;
  }
});

module.exports = router;

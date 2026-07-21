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

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT slug, title, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT slug, title, body, created_at FROM posts WHERE slug = $1 AND published = 1",
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, body, published = true } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }

  const slug = slugify(title);
  try {
    const result = await db.query(
      "INSERT INTO posts (slug, title, body, published) VALUES ($1, $2, $3, $4) RETURNING id",
      [slug, title.trim(), body.trim(), published ? 1 : 0]
    );
    res.status(201).json({ ok: true, slug, id: result.rows[0].id });
  } catch (err) {
    if (String(err.message).includes("unique")) {
      return res.status(409).json({ error: "A post with that title/slug already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT slug, name, views, likes FROM projects ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/:slug/view", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await db.query(
      "UPDATE projects SET views = views + 1 WHERE slug = $1 RETURNING slug, views",
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Unknown project slug" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/:slug/like", async (req, res) => {
  try {
    const { slug } = req.params;
    const { action = "like" } = req.body;

    if (action !== "like" && action !== "unlike") {
      return res.status(400).json({ error: "action must be 'like' or 'unlike'" });
    }

    const existing = await db.query("SELECT slug FROM projects WHERE slug = $1", [slug]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Unknown project slug" });
    }

    if (action === "unlike") {
      await db.query("UPDATE projects SET likes = GREATEST(likes - 1, 0) WHERE slug = $1", [slug]);
    } else {
      await db.query("UPDATE projects SET likes = likes + 1 WHERE slug = $1", [slug]);
    }

    const row = await db.query("SELECT slug, likes FROM projects WHERE slug = $1", [slug]);
    res.json(row.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

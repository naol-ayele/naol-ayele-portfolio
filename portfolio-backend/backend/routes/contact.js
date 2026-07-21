const express = require("express");
const { Resend } = require("resend");
const db = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.get("/", requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are all required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "That doesn't look like a valid email" });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: "Message is too long" });
  }

  try {
    const result = await db.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING id",
      [name.trim(), email.trim(), message.trim()]
    );

    if (resend && process.env.CONTACT_TO_EMAIL) {
      resend.emails
        .send({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: process.env.CONTACT_TO_EMAIL,
          replyTo: email,
          subject: `New portfolio message from ${name}`,
          text: message,
        })
        .catch((err) => console.error("Email send failed:", err));
    }

    res.status(201).json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

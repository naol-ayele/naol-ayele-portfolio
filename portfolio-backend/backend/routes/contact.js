const express = require("express");
const nodemailer = require("nodemailer");
const db = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// GET /api/contacts — list all messages (admin only)
router.get("/", requireAdmin, (req, res) => {
  const rows = db
    .prepare("SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC")
    .all();
  res.json(rows);
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

  const stmt = db.prepare(
    "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)"
  );
  const result = stmt.run(name.trim(), email.trim(), message.trim());

  // Fire-and-forget email notification — contact form still succeeds even if this fails
  if (transporter && process.env.CONTACT_TO_EMAIL) {
    transporter
      .sendMail({
        from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: email,
        subject: `New portfolio message from ${name}`,
        text: message,
      })
      .catch((err) => console.error("Email send failed:", err.message));
  }

  res.status(201).json({ ok: true, id: result.lastInsertRowid });
});

module.exports = router;

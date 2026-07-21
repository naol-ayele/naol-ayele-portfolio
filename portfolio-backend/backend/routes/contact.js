const express = require("express");
const https = require("https");
const db = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

function sendResendEmail({ to, replyTo, subject, text }) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to,
      replyTo,
      subject,
      text,
    });
    const req = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Resend API ${res.statusCode}: ${body}`));
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

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

    if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
      sendResendEmail({
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: email,
        subject: `New portfolio message from ${name}`,
        text: message,
      }).catch((err) => console.error("Email send failed:", err));
    }

    res.status(201).json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

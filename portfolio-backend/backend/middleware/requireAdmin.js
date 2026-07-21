function requireAdmin(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({ error: "Server misconfigured: ADMIN_API_KEY not set" });
  }
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

module.exports = requireAdmin;

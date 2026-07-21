const db = require("./db");

const createTables = `
  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS pageviews (
    id SERIAL PRIMARY KEY,
    path TEXT NOT NULL,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const projects = [
  { slug: "conwise", name: "ConWise" },
  { slug: "zenatech", name: "ZenaTech" },
  { slug: "banking-system", name: "Banking Management System" },
  { slug: "leafguard", name: "LeafGuard" },
];

async function seed() {
  console.log("Creating tables...");
  await db.query(createTables);

  console.log("Seeding projects...");
  for (const p of projects) {
    await db.query(
      "INSERT INTO projects (slug, name) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING",
      [p.slug, p.name]
    );
  }

  console.log(`Seeded ${projects.length} projects (existing rows left untouched).`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

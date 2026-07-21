const db = require("./db");

const projects = [
  { slug: "conwise", name: "ConWise" },
  { slug: "zenatech", name: "ZenaTech" },
  { slug: "banking-system", name: "Banking Management System" },
  { slug: "leafguard", name: "LeafGuard" },
];

const insert = db.prepare(
  "INSERT OR IGNORE INTO projects (slug, name) VALUES (?, ?)"
);

const tx = db.transaction((rows) => {
  for (const p of rows) insert.run(p.slug, p.name);
});

tx(projects);

console.log(`Seeded ${projects.length} projects (existing rows left untouched).`);

# Portfolio Backend

Node.js + Express + SQLite API powering the interactive parts of the portfolio:
contact form, project view/like counters, a blog/posts API, and lightweight
pageview analytics.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/api/contact` | — | Save a contact message (and email you, if SMTP is configured) |
| GET | `/api/projects` | — | List projects with view/like counts |
| POST | `/api/projects/:slug/view` | — | Increment a project's view count |
| POST | `/api/projects/:slug/like` | — | Increment a project's like count |
| GET | `/api/posts` | — | List published blog posts |
| GET | `/api/posts/:slug` | — | Get a single post |
| POST | `/api/posts` | `x-api-key` | Create a post |
| POST | `/api/analytics/pageview` | — | Log a page visit |
| GET | `/api/analytics/summary` | `x-api-key` | View totals for the last 30 days |

Project slugs seeded by default: `birrly`, `zenatech`, `conwise`, `leafguard`.

## Local setup

```bash
cd backend
npm install
cp .env.example .env      # then fill in ADMIN_API_KEY (and SMTP settings if you want email)
npm run seed               # creates the SQLite file and seeds the 4 projects
npm run dev                 # starts on http://localhost:4000
```

Test it:
```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/projects
```

## Deploying

**Railway or Render (recommended — both give you a persistent disk, which SQLite needs):**
1. Push this `backend/` folder to a GitHub repo.
2. Create a new Web Service pointing at it. Build command: `npm install`. Start command: `npm start`.
3. Add the environment variables from `.env.example` in the dashboard (set real values — don't skip `ADMIN_API_KEY`).
4. On Render, add a persistent disk mounted at `/opt/render/project/src/data` (or wherever `data/` resolves) so the SQLite file survives restarts. Railway volumes work similarly.
5. Once deployed, note your API's public URL — you'll plug it into the frontend as `API_BASE`.

**Serverless (Vercel/Netlify functions):** possible, but SQLite doesn't persist well on serverless filesystems. If you go this route, swap `better-sqlite3` for a hosted database instead (e.g. Postgres via Supabase/Neon, or Turso for hosted SQLite).

## Wiring up the frontend

In your portfolio HTML, set:
```js
const API_BASE = "https://your-deployed-backend-url.com";
```
The frontend snippet (provided alongside this backend) uses that constant to call `/api/contact`, `/api/projects/:slug/like`, and `/api/analytics/pageview`.

## Notes

- Contact messages are always saved to the database even if email sending isn't configured or fails — you won't lose a message.
- Rate limiting (60 requests / 15 min per IP) is applied to `/api/contact` and `/api/analytics` to curb abuse.
- `ADMIN_API_KEY` gates post-creation and the analytics summary — treat it like a password, don't commit it or expose it in frontend code.

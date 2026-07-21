# Naol Ayele — Portfolio

Personal developer portfolio for **Naol Ayele**, a full-stack software engineer
specializing in backend systems, mobile apps, and system design.

Built as a vanilla HTML/CSS/JS frontend paired with a real Node/Express +
SQLite backend — not just a static site, but a small full-stack project in
its own right (contact form, project like/view counters, a blog API, and
lightweight analytics).

**Live site:** [https://naol-ayele-portfolio.vercel.app]

---
## Tech stack

**Frontend**
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

**Backend**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)

**Also used across other projects referenced on the site**
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=springboot&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Flutter](https://img.shields.io/badge/Flutter-02569B?style=flat&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-0175C2?style=flat&logo=dart&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## Features

- 🎨 Custom-designed dark, cinematic UI — no template, no page builder
- 📱 Fully responsive, including a mobile nav drawer and hamburger menu
- ✉️ Working contact form backed by a real API (not a third-party form service)
- ❤️ Live like/view counters on each project card
- 📊 Lightweight visitor analytics (self-hosted, no third-party tracker)
- ✍️ Blog/posts API ready to wire up a writing section
- ⚡ Zero build step on the frontend — plain HTML/CSS/JS, deploy anywhere

---

## Project structure

```
.
├── index.html          # Frontend — single-file site (HTML/CSS/JS)
├── naol-photo.png       # Hero portrait
├── images/              # Project thumbnails
├── naol-ayele-resume.pdf
└── backend/             # Node/Express + SQLite API
    ├── server.js
    ├── db.js
    ├── seed.js
    ├── routes/
    │   ├── contact.js
    │   ├── projects.js
    │   ├── posts.js
    │   └── analytics.js
    ├── middleware/
    │   └── requireAdmin.js
    ├── .env.example
    └── README.md         # Backend-specific setup & deployment docs
```

---

## Getting started

### Frontend
The frontend is a single static HTML file — no build step required.

```bash
# just open it directly, or serve it locally:
npx serve .
```

Set `API_BASE` near the bottom of `index.html` to point at your backend
(defaults to `http://localhost:4000` for local development).

### Backend
See [`backend/README.md`](backend/README.md) for full setup and deployment
instructions (Railway/Render deployment, environment variables, API
reference).

```bash
cd backend
npm install
cp .env.example .env   # fill in ADMIN_API_KEY and SMTP settings
npm run seed
npm run dev
```

---

## Deployment

- **Frontend:** GitHub Pages, Netlify, or Vercel — all support plain static
  HTML with zero config.
- **Backend:** Railway or Render (both support the persistent disk SQLite
  needs). See `backend/README.md` for the full walkthrough.

Remember to update `ALLOWED_ORIGINS` in the backend's environment variables
to match wherever the frontend ends up deployed, or the browser will block
API requests with a CORS error.

---

## Contact

- ✉️ [naolayele85@gmail.com](mailto:naolayele85@gmail.com)
- 💼 [linkedin.com/in/naol-ayele](https://www.linkedin.com/in/naol-ayele/)
- 🧑‍💻 [github.com/naol-ayele](https://github.com/naol-ayele)

---

<sub>© 2026 Naol Ayele. This portfolio is personal work — feel free to draw
inspiration from the structure, but please don't copy the content wholesale.</sub>

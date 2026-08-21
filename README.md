# Quiz Management & Online Assessment Platform

A full-stack quiz platform with two roles — **Admin** and **Student** — built with:

- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **Frontend:** React 18 (Vite), Tailwind CSS (with light/dark theme), React Router, Axios, Recharts

---

## Live Demo

- **App:** https://quiz-management-platform-seven.vercel.app
- **API:** https://quiz-management-platform-q55x.onrender.com/api

Default admin login: `admin@quizplatform.com` / `Admin@123`

> The backend is hosted on Render's free tier, which spins down after 15 minutes of
> inactivity. If the app seems stuck loading on first visit, give it 30-50 seconds to wake up
> and try again — this is expected behavior, not a bug.

quiz-platform/
├── backend/ ← Spring Boot project (open this folder in IntelliJ), includes Dockerfile
└── frontend/ ← React + Vite project (run with npm)


---

## 1. Prerequisites

- **JDK 17+**
- **IntelliJ IDEA** (Community or Ultimate) with the Java/Spring plugins
- **PostgreSQL 13+** running locally (or update the connection settings to point elsewhere)
- **Node.js 18+** and npm, for the frontend
- **Docker** — only needed if you want to build/test the container image locally before deploying; not required to run the app locally via IntelliJ/Maven

---

## 2. Database setup (local)

Create the database once, using `psql` or any GUI client (pgAdmin, TablePlus, DBeaver...):

```sql
CREATE DATABASE quizplatform;
```

The backend uses Hibernate's `ddl-auto=update`, so all tables are created automatically the
first time the app starts — no manual migration scripts needed.

If your PostgreSQL username/password aren't the defaults, update them in:
`backend/src/main/resources/application.properties`

```properties
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/quizplatform}
spring.datasource.username=${DATABASE_USERNAME:postgres}
spring.datasource.password=${DATABASE_PASSWORD:postgres}
```

Note: these use `${VAR_NAME:default}` syntax. Locally (no env vars set) it falls back to the
defaults shown above. In production, setting `DATABASE_URL` / `DATABASE_USERNAME` /
`DATABASE_PASSWORD` as environment variables overrides these automatically — see the
deployment section below.

**Homebrew Postgres note:** if you installed Postgres via `brew install postgresql`, the
default superuser is usually your Mac username (not `postgres`), often with no password. If
`postgres`/`postgres` doesn't work locally, run `psql postgres` to check what username connects
without a password, and use that in `application.properties` instead.

---

## 3. Running the backend in IntelliJ (local dev)

1. Open IntelliJ IDEA → **File → Open** → select the `backend` folder (the one containing `pom.xml`).
2. IntelliJ will detect it as a Maven project and download all dependencies automatically
   (this requires an internet connection the first time).
3. Once indexing/dependency resolution finishes, open
   `src/main/java/com/quizplatform/QuizPlatformApplication.java`.
4. Click the green ▶ run icon next to the `main` method (or right-click → Run).
5. The backend starts on **http://localhost:8080**.

On first startup, a default admin account is created automatically. Watch the console output:
======================================================
Default admin created:
Email: admin@quizplatform.com
Password: Admin@123

You can change these defaults via the `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD`
environment variables, or by editing the fallback values in `application.properties`.

### Alternative: run from the command line

```bash
cd backend
mvn spring-boot:run
```

### Quick API sanity check

POST http://localhost:8080/api/auth/login
Content-Type: application/json

{ "email": "admin@quizplatform.com", "password": "Admin@123" }

should return a JWT token.

---

## 4. Running the frontend (local dev)

```bash
cd frontend
npm install
npm run dev
```

This starts the dev server on **http://localhost:5173**, already wired to call the backend at
`http://localhost:8080/api` (see `frontend/.env.example` — copy it to `.env` if you need to
change the API URL).

Open **http://localhost:5173** in your browser. You can:
- Log in as the seeded admin to create categories, quizzes, and questions, then publish a quiz.
- Register a new student account to browse and attempt published quizzes.
- Use the sun/moon toggle in the navbar to switch between light and dark theme — the choice
  is remembered across visits.

---

## 5. What's implemented

**Core (from the spec):**
- Student & Admin authentication (register/login/logout/forgot-reset password), JWT-secured
- Registration name field restricted to letters/spaces only (frontend + backend validation)
- Password fields have a show/hide toggle
- Light/dark theme toggle, persisted per-browser, with no flash-of-wrong-theme on load
- Admin dashboard with live stats + analytics charts (attempts over time, average score trend,
  student registrations, pass/fail ratio, popular quizzes/categories)
- Student management (search, view profile & history, activate/deactivate, delete)
- Quiz management (create/edit/delete/publish, draft/published/unpublished status)
- Category management (CRUD) + "view quizzes under category" panel
- Question management (multiple choice, single correct answer, marks, explanation, difficulty)
- Quiz discovery: search by title *or* category, filter by category/difficulty/duration,
  sort by recently-added/most-popular/shortest-first
- Quiz attempt flow: start → timed multi-question navigator → submit → auto-submit on timeout
- **All scoring happens on the backend** — the frontend never computes or can fake a score,
  and correct answers are never sent to the browser while an attempt is in progress
  (see `QuestionPublicResponse` / `AttemptService.getSanitizedQuestions`)
- Server-validated attempt timer (`Attempt.expiresAt`), max-attempts enforcement, and
  publish-status checks all happen server-side, not just in the UI
- Result page with full answer review (correct answer + explanation shown after submission)
- Student dashboard, attempt history
- Leaderboard: overall/weekly/monthly, category-wise, rankable by average score, highest
  score, or quizzes completed — both a student-facing view and an admin "leaderboard
  management" view with the same filters
- Security: BCrypt password hashing, stateless JWT auth, role-based authorization on every
  endpoint, input validation (`jakarta.validation`), a basic in-memory rate limiter on
  `/api/auth/**`, generic error responses that don't leak internals, CORS restricted to the
  configured frontend origin(s)

**Not implemented (left as extensions, called out in the spec as "Advanced Features"):**
question randomization/option shuffling, negative marking, certificate generation, email
notifications, and CSV/Excel question import. The architecture (services/DTOs) is
structured so any of these can be added without a rewrite — e.g. negative marking just needs a
few lines in `AttemptService.submitAttempt`, and randomization can be applied in
`AttemptService.getSanitizedQuestions` before returning the list.

---

## 6. Deploying for free (GitHub + Render + Vercel + Neon)

This stack costs nothing to run at low traffic:

- **Neon** — free serverless PostgreSQL
- **Render** — free web service hosting for the Spring Boot backend, deployed via Docker
- **Vercel** — free static hosting for the React frontend

Free-tier terms on these platforms change fairly often, so if anything below looks different
from what you see on the actual site, that's the platform's policy having shifted, not a wrong
step — check their current docs and adjust.

### 6.1 Push the project to GitHub

```bash
cd quiz-platform
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on github.com (no README/gitignore — you already have those), then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

### 6.2 Create the database (Neon)

1. Sign up at neon.tech (free, no card required for the free tier)
2. Create a new project → it gives you a connection string that looks like:
   `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`
3. From that string, note down: username, password, host, and database name — you'll need
   each piece separately in the next step.

### 6.3 Deploy the backend (Render)

1. Sign up at render.com and connect your GitHub account
2. **New → Web Service** → select your repo
3. Set:
   - **Root Directory:** `backend`
   - **Language / Runtime:** **Docker** (Render has no native Java runtime — the repo includes
     a `Dockerfile` in `backend/` that builds and runs the Spring Boot jar, so Build/Start
     Command fields aren't needed once Docker is selected)
   - **Instance Type:** Free
4. Add these **environment variables** (Render dashboard → Environment):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | `jdbc:postgresql://<neon-host>/<db>?sslmode=require&channel_binding=require` (note the **jdbc:** prefix — Neon's raw string doesn't include it) |
   | `DATABASE_USERNAME` | from Neon |
   | `DATABASE_PASSWORD` | from Neon |
   | `JWT_SECRET` | any long random string (don't reuse the default) |
   | `CORS_ALLOWED_ORIGINS` | your Vercel URL, added after step 6.4 (e.g. `https://your-app.vercel.app`) |

5. Click **Deploy Web Service**. Docker builds are slower than native buildpacks — expect
   5-10 minutes on the first deploy. Watch the logs for:

Default admin created: ...
==> Your service is live 🎉
==> Available at your primary URL https://your-service.onrender.com

6. Save that URL — you need it in step 6.4.

**Free-tier caveat:** this service spins down after 15 minutes idle, so the first request
after inactivity takes 30-50 seconds to wake up. That's normal on Render's free plan, not a bug.

### 6.4 Deploy the frontend (Vercel)

1. Sign up at vercel.com, connect GitHub, import the same repo
2. Set:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. Add environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-service.onrender.com/api` (your Render URL from 6.3 + `/api`) |

4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`

### 6.5 Connect them (CORS)

Go back to Render → your backend service → **Environment** → set `CORS_ALLOWED_ORIGINS` to
your actual Vercel URL from step 6.4 (no trailing slash), then save — Render automatically
redeploys with the new setting.

Without this step the frontend loads fine but every API call (login, quizzes, etc.) fails
with a CORS error in the browser console.

### 6.6 Verify

Open your Vercel URL, log in with the seeded admin
(`admin@quizplatform.com` / `Admin@123` unless you overrode `ADMIN_PASSWORD`), and confirm
quizzes/categories load. If login fails, open the browser console first — a CORS error means
step 6.5 needs fixing or hasn't finished redeploying yet; a "Login failed" *without* a console
error usually means a database connection issue (double-check the Render env vars).

The backend already reads all of `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`,
`JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `PORT`, and the `ADMIN_*` variables from the environment
(see `application.properties`) with sensible localhost defaults, so no code changes are needed
to deploy.

---

## 7. Project structure (backend)

backend/
├── Dockerfile Multi-stage build for Render/Docker deployment
├── pom.xml
└── src/main/java/com/quizplatform/
├── config/ SecurityConfig, RateLimitFilter, DataSeeder (default admin)
├── controller/ REST controllers (one per resource)
├── dto/ Request/response payloads, incl. "public" (answer-safe) DTOs
├── entity/ JPA entities
├── enums/ Role, UserStatus, QuizStatus, Difficulty, AttemptStatus
├── exception/ Custom exceptions + a global @RestControllerAdvice handler
├── repository/ Spring Data JPA repositories
├── security/ JWT util, filter, UserDetails implementation
└── service/ Business logic (this is where scoring, publishing rules, etc. live)


## 8. Default ports (local dev)

| Service   | Port |
|-----------|------|
| Backend   | 8080 |
| Frontend  | 5173 |
| Postgres  | 5432 |

If you need different ports locally, update `server.port` in `application.properties` and
`server.port` in `frontend/vite.config.js` (plus `VITE_API_URL`) accordingly. In production,
`server.port` already defers to Render's injected `PORT` variable automatically.

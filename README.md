# Quiz Management & Online Assessment Platform

A full-stack quiz platform with two roles — **Admin** and **Student** — built with:

- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **Frontend:** React 18 (Vite), Tailwind CSS, React Router, Axios, Recharts

```
quiz-platform/
├── backend/     ← Spring Boot project (open this folder in IntelliJ)
└── frontend/    ← React + Vite project (run with npm)
```

---

## 1. Prerequisites

- **JDK 17+**
- **IntelliJ IDEA** (Community or Ultimate) with the Java/Spring plugins
- **PostgreSQL 13+** running locally (or update the connection settings to point elsewhere)
- **Node.js 18+** and npm, for the frontend

---

## 2. Database setup

Create the database once, using `psql` or any GUI client (pgAdmin, TablePlus, DBeaver...):

```sql
CREATE DATABASE quizplatform;
```

The backend uses Hibernate's `ddl-auto=update`, so all tables are created automatically the
first time the app starts — no manual migration scripts needed.

If your PostgreSQL username/password aren't the defaults, update them in:
`backend/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/quizplatform
spring.datasource.username=postgres
spring.datasource.password=postgres
```

---

## 3. Running the backend in IntelliJ

1. Open IntelliJ IDEA → **File → Open** → select the `backend` folder (the one containing `pom.xml`).
2. IntelliJ will detect it as a Maven project and download all dependencies automatically
   (this requires an internet connection the first time).
3. Once indexing/dependency resolution finishes, open
   `src/main/java/com/quizplatform/QuizPlatformApplication.java`.
4. Click the green ▶ run icon next to the `main` method (or right-click → Run).
5. The backend starts on **http://localhost:8080**.

On first startup, a default admin account is created automatically. Watch the console output:

```
======================================================
 Default admin created:
 Email:    admin@quizplatform.com
 Password: Admin@123
======================================================
```

You can change these defaults in `application.properties` (`app.admin.*`) before first run.

### Quick API sanity check

```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{ "email": "admin@quizplatform.com", "password": "Admin@123" }
```
should return a JWT token.

---

## 4. Running the frontend

The frontend is a separate Vite/React app — run it from a terminal (not IntelliJ's Java runner):

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

---

## 5. What's implemented

**Core (from the spec):**
- Student & Admin authentication (register/login/logout/forgot-reset password), JWT-secured
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
  frontend origin

**Not implemented (left as extensions, called out in the spec as "Advanced Features"):**
question randomization/option shuffling, negative marking, certificate generation, email
notifications, dark mode, and CSV/Excel question import. The architecture (services/DTOs) is
structured so any of these can be added without a rewrite — e.g. negative marking just needs a
few lines in `AttemptService.submitAttempt`, and randomization can be applied in
`AttemptService.getSanitizedQuestions` before returning the list.

---

## 6. Project structure (backend)

```
backend/src/main/java/com/quizplatform/
├── config/          SecurityConfig, RateLimitFilter, DataSeeder (default admin)
├── controller/       REST controllers (one per resource)
├── dto/              Request/response payloads, incl. "public" (answer-safe) DTOs
├── entity/           JPA entities
├── enums/             Role, UserStatus, QuizStatus, Difficulty, AttemptStatus
├── exception/        Custom exceptions + a global @RestControllerAdvice handler
├── repository/       Spring Data JPA repositories
├── security/         JWT util, filter, UserDetails implementation
└── service/          Business logic (this is where scoring, publishing rules, etc. live)
```

## 7. Default ports

| Service   | Port |
|-----------|------|
| Backend   | 8080 |
| Frontend  | 5173 |
| Postgres  | 5432 |

If you need different ports, update `server.port` in `application.properties` and
`server.port` in `frontend/vite.config.js` (plus `VITE_API_URL`) accordingly.

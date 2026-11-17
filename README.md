# NovaWorks AI Project Manager — Meeting to Project CRM

> The Infinity Hack ’26 · AI Project Manager Challenge
> Paste a meeting transcript → AI creates projects, assigns managers and developers, and sets deadlines and estimated hours automatically.

## Team
- **Team name:** [Trew]
- **Members & responsibilities:**
  - Shanawar — full-stack development, AI integration, deployment
  - [Hassan Nawaz] — [Frontend developer]
  - [Taiba saleem] — [Backend developer]
- **Repository:** https://github.com/shanawartaha31-rgb/novaworks-crm

## Links
- **Live application:** [https://novaworks-crm.vercel.app]
- **Demo login:** `admin@novaworks.example` / `Demo123!`

## What Works
- ✅ **Login/logout** with the 10 seeded demo accounts (signed http-only session cookie; passwords hashed with bcrypt). No signup needed.
- ✅ **Idempotent seeder** (`npm run setup`) creates the tables and upserts all 10 users by email. Re-running never creates duplicates.
- ✅ **Admin → Create from Transcript**: paste the meeting, and the AI extracts projects and tasks, matches people to the team directory, and sets deadlines and estimated hours. It follows final decisions (revised dates, hours and owners) and ignores rejected features (payments, inventory, maps, email/ticketing) and non-employees (e.g. Kamran).
- ✅ **Validation before saving**: manager must be an existing MANAGER, assignee an existing AGENT, dates must be valid, hours > 0, and a task deadline can't be later than its project deadline. If anything is unresolved, **nothing is saved**. The admin sees the problems and can correct them in an editable form, then re-validate.
- ✅ **All-or-nothing save** in one database transaction. The button is disabled while processing, so double clicks can't create duplicates. There's a loading state, a success summary and a clear error message.
- ✅ **Role-based access enforced on the server** (pages and API routes, not just hidden buttons):
  - **Admin** → all projects and tasks, plus transcript creation
  - **Manager** → only projects where they are the manager
  - **Agent** → only their own tasks, plus the related project's name and manager
  - Direct requests for someone else's project return **403**; requests without a login return **401**
- ✅ Screens: Login (one-click demo accounts), Projects (cards), Project detail (client, manager, deadline, tasks), My Tasks, read-only Team Directory.
- ✅ Persistent PostgreSQL storage: data survives refreshes and restarts.
- ➖ Not built (not required by the brief): signup, password reset, user management, cost calculation, progress monitoring.

## Technology Stack
- **Frontend + Backend:** Next.js 15 (App Router, React 19, TypeScript), with API routes in `src/app/api`
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL on **Neon** (works with any Postgres: local, Aiven, Supabase), using the `pg` driver
- **AI:** **Groq** API, model `openai/gpt-oss-120b`, through an OpenAI-compatible endpoint (JSON mode, temperature 0). Google Gemini is also supported through `GEMINI_API_KEY`.
- **Auth/session:** HS256-signed JWT in an http-only cookie (`jose`). The current user is always read from the session, never from request parameters.

## Project Structure
```
db/
  schema.sql            tables: users, projects, tasks
  setup.mjs             creates tables + seeds 10 demo users (idempotent)
  reset-projects.mjs    deletes generated projects/tasks, keeps users
  users.mjs             demo account definitions
src/lib/
  ai.ts                 prompt + AI call (Groq / OpenAI-compatible / Gemini)
  validate.ts           draft validation & name→ID resolution
  access.ts             role-based data access (used by pages and APIs)
  auth.ts               login session
src/app/
  api/transcript        POST: AI extraction → validate → transactional save
  api/projects, api/projects/[id], api/tasks, api/team, api/auth/*
  login, projects, projects/[id], my-tasks, team, transcript   (UI pages)
public/sample-transcript.txt   the supplied meeting transcript
```

## Requirements
- Node.js 20 or 22 LTS, and npm
- A PostgreSQL database (free Neon: https://neon.tech)
- A Groq API key (free: https://console.groq.com/keys) **or** a Gemini API key

## Run Locally
```sh
git clone https://github.com/shanawartaha31-rgb/novaworks-crm.git
cd novaworks-crm
npm install
cp .env.example .env          # Windows: copy .env.example .env
# edit .env → set DATABASE_URL, SESSION_SECRET and the AI variables (see below)
npm run setup                 # creates tables + seeds the 10 demo users (safe to re-run)
npm run dev                   # open http://localhost:3000
```
Only one process needs to keep running (`npm run dev`), because the frontend and backend are the same Next.js app.
Production mode: `npm run build && npm start`.

**Reset generated projects/tasks between tests (keeps users):**
```sh
npm run reset:projects
```

## Environment Variables
| Variable | Purpose | Where configured |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (ends with `?sslmode=require` for Neon) | `.env` / Vercel |
| `SESSION_SECRET` | Signs the login session cookie | `.env` / Vercel |
| `OPENAI_API_KEY` | Groq API key (`gsk_...`) | backend only |
| `OPENAI_BASE_URL` | `https://api.groq.com/openai/v1` | backend |
| `OPENAI_MODEL` | `openai/gpt-oss-120b` | backend |
| `GEMINI_API_KEY` | Optional alternative AI provider; leave empty to use Groq | backend only |
| `GEMINI_MODEL` | Gemini model name, if Gemini is used | backend |

Example `.env`:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
SESSION_SECRET=any-long-random-string
GEMINI_API_KEY=
OPENAI_API_KEY=gsk_your_key
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=openai/gpt-oss-120b
```
Secrets are never exposed to the browser, and only `.env.example` (placeholders) is committed.

## Demo Login Accounts
Fictional identifiers created by `npm run setup`. The login page also has one-click buttons for each account.

| Ref | Role | Name | Specialization | Demo email | Password |
| --- | --- | --- | --- | --- | --- |
| ADMIN | Admin | Admin | Administrator | admin@novaworks.example | Demo123! |
| PM01 | Manager | Ayesha Khan | Web PM | ayesha@novaworks.example | Demo123! |
| PM02 | Manager | Bilal Ahmed | Mobile PM | bilal@novaworks.example | Demo123! |
| PM03 | Manager | Hina Malik | AI PM | hina@novaworks.example | Demo123! |
| DEV01 | Agent | Ali Raza | Full-Stack | ali@novaworks.example | Demo123! |
| DEV02 | Agent | Hamza Shah | Full-Stack | hamza@novaworks.example | Demo123! |
| DEV03 | Agent | Sara Noor | App Developer | sara@novaworks.example | Demo123! |
| DEV04 | Agent | Usman Tariq | App Developer | usman@novaworks.example | Demo123! |
| DEV05 | Agent | Zain Abbas | AI Developer | zain@novaworks.example | Demo123! |
| DEV06 | Agent | Maryam Asif | AI Developer | maryam@novaworks.example | Demo123! |

## How Judges Can Test
1. Log in as **admin** → **Create from Transcript**.
2. Click **📄 Load supplied transcript** (file: `public/sample-transcript.txt`) or paste any transcript.
3. Click **✨ Create from Transcript** → expect **3 projects with 12 tasks**.

   | Project | Manager | Deadline | Tasks | Hours |
   | --- | --- | --- | --- | --- |
   | UrbanCart Website | Ayesha | 2026-10-20 | 4 | 40 |
   | QuickServe Mobile App | Bilal | 2026-10-24 | 4 | 46 |
   | HelpDeskPro AI Assistant | Hina | 2026-10-22 | 4 | 38 |

4. Open **UrbanCart**: client UrbanCart Clothing, manager Ayesha, deadline 20 Oct 2026, 4 tasks with owners, deadlines and hours.
5. Log out → log in as **Ayesha** → only UrbanCart is visible.
6. Log in as **Ali** → **My Tasks** shows only his 3 UrbanCart tasks.
7. Log in as **Hamza** → his 2 API tasks across UrbanCart and QuickServe.
8. Direct access check: while logged in as Ayesha, open `/api/projects/<QuickServe project id>` → **403 Forbidden**.
9. Refresh the page → data persists.
10. **Modified transcript test:** run `npm run reset:projects` (or use a fresh database), change Usman's final estimate in the recap to **12 hours / 23 October**, and create again → only that task changes.

## Deployment Details (Vercel + Neon + Groq)
1. Created a free PostgreSQL database on **Neon** (https://neon.tech) and copied the connection string (ending `?sslmode=require`).
2. Locally, set that string as `DATABASE_URL` in `.env` and ran `npm run setup` to create the tables and seed the 10 demo users in the hosted database.
3. Pushed to GitHub → imported the repository in **Vercel** (framework auto-detected: Next.js, build command `next build`).
4. In Vercel → Settings → Environment Variables, added `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, `OPENAI_BASE_URL` and `OPENAI_MODEL`.
5. Deployed → opened the live URL and logged in with the demo accounts.

- **Deployment status:** Live
- **Live link:** [https://YOUR-APP.vercel.app]
- **Frontend + backend host:** Vercel (single Next.js app)
- **Database:** Neon PostgreSQL (free tier)
- **AI provider:** Groq — `openai/gpt-oss-120b`
- **Deployed branch/commit:** main / [COMMIT SHA]

## Known Limitations
- Gemini's free tier was overloaded (HTTP 503) during the hackathon, so the deployed app uses Groq. Gemini is still supported through `GEMINI_API_KEY`.
- AI output depends on the model. Validation blocks invalid output from being saved, and the admin can correct it before saving.
- Free AI tiers may rate-limit; if that happens, wait a few seconds and retry.
- Running the same transcript twice creates a second copy of the projects. Use `npm run reset:projects` between tests.
- Editing projects/tasks after they are created isn't built (it was optional). Corrections are made in the pre-save correction form.

## Submission Summary
- **Source repository:** https://github.com/shanawartaha31-rgb/novaworks-crm
- **Live link:** [https://YOUR-APP.vercel.app]
- **Demo video:** [VIDEO LINK]
- **Setup and seed commands:** `npm install` → `npm run setup` → `npm run dev`
- **Demo login accounts:** all 10 working (password `Demo123!`)
- **Features completed:** login/logout, seeded accounts, AI transcript → projects/tasks, validation and correction, transactional save, role-based access (Admin / Manager / Agent), projects list and detail, My Tasks, Team Directory, persistence, live deployment

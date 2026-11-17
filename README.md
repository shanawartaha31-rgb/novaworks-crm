# NovaWorks AI Project Manager — Meeting to Project CRM

> The Infinity Hack ’26 · AI Project Manager Challenge

## Team
- Team name: [Trew]
- Members & responsibilities: [shanawar Taha,full stack development], [Hassan Nawaz — Frontend developer], [Taiba saleem — backend developer]
- Repository: [GitHub URL]

## What Works
- ✅ **Login/logout** with the 10 seeded demo accounts (signed, http-only session cookie; passwords bcrypt-hashed).
- ✅ **Idempotent seeder** (`npm run setup`) creates the tables and upserts all 10 users. Re-running never duplicates.
- ✅ **Admin → Create from Transcript**: paste the meeting, and the AI extracts projects and tasks, resolves managers and developers against the team directory, and sets deadlines and estimated hours.
- ✅ **Validation before saving**: manager must be a MANAGER, assignee must be an AGENT, valid dates, hours > 0, task deadline ≤ project deadline. If anything is unresolved, **nothing is saved**; the admin sees the issues and can correct them in an editable form, then re-validate.
- ✅ **All-or-nothing save** in a single database transaction. The button is disabled while processing, so double clicks can't create duplicates.
- ✅ **Role-based access enforced on the server** (pages and API routes):
  - Admin → all projects and tasks, plus transcript creation
  - Manager → only projects where they are the manager
  - Agent → only their own tasks, plus the related project's name and manager
  - Direct requests for someone else's project return **403**
- ✅ Projects list (cards), project detail (client, manager, deadline, tasks), My Tasks, read-only Team Directory.
- ✅ Persistent PostgreSQL storage (data survives a refresh or restart).
- Not built (not required): signup, password reset, user management, cost, progress tracking.

## Technology Stack
- Frontend + Backend: **Next.js 15** (App Router, React 19, TypeScript) — API routes in `src/app/api`
- Styling: Tailwind CSS 4 (UI designed in Google Stitch style: sidebar dashboard, cards, tables)
- Database: **PostgreSQL** (local Postgres 14+ or hosted Aiven / Neon) via `pg`
- AI: **Google Gemini** (`gemini-2.5-flash`, JSON schema output, temperature 0) — or any OpenAI-compatible API (OpenAI, Groq, OpenRouter)
- Auth: HS256-signed JWT in an http-only cookie (`jose`). The current user is always read from the session, never from request params.

## Links
- Live application: [novaworks-crm.vercel.app]

## Requirements
- Node.js 18.18+ (20 or 22 recommended) and npm
- PostgreSQL database (local, or free hosted Aiven/Neon)
- A Gemini API key (free at https://aistudio.google.com/apikey) **or** an OpenAI-compatible key

## Run Locally
```sh
git clone [YOUR_REPOSITORY_URL]
cd novaworks-crm
npm install
cp .env.example .env          # Windows: copy .env.example .env
# edit .env → set DATABASE_URL, SESSION_SECRET and GEMINI_API_KEY
npm run setup                 # creates tables + seeds 10 demo users (safe to re-run)
npm run dev                   # http://localhost:3000
```
Only one process needs to stay running (`npm run dev`), since frontend and backend are the same Next.js app.
For production mode: `npm run build && npm start`.

**Reset generated projects/tasks (keeps users):** `npm run reset:projects`

## Environment Variables
| Variable | Purpose | Where configured |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (add `?sslmode=require` for Aiven/Neon) | backend / Vercel |
| `SESSION_SECRET` | Signs the session cookie | backend / Vercel |
| `GEMINI_API_KEY` | Gemini credential (option A) | backend only |
| `GEMINI_MODEL` | Gemini model, default `gemini-2.5-flash` | backend |
| `OPENAI_API_KEY` | OpenAI-compatible credential (option B) | backend only |
| `OPENAI_BASE_URL` | e.g. `https://api.groq.com/openai/v1` | backend |
| `OPENAI_MODEL` | e.g. `gpt-4o-mini` / `llama-3.3-70b-versatile` | backend |

No secret is exposed to the browser. Only `.env.example` (placeholders) is committed.

## Demo Login Accounts
Fictional identifiers. No signup is needed; they are created by `npm run setup`. The login page also has one-click demo account buttons.

| Ref | Role | Name | Demo email | Password |
| --- | --- | --- | --- | --- |
| ADMIN | Admin | Admin | admin@novaworks.example | Demo123! |
| PM01 | Manager | Ayesha Khan | ayesha@novaworks.example | Demo123! |
| PM02 | Manager | Bilal Ahmed | bilal@novaworks.example | Demo123! |
| PM03 | Manager | Hina Malik | hina@novaworks.example | Demo123! |
| DEV01 | Agent | Ali Raza | ali@novaworks.example | Demo123! |
| DEV02 | Agent | Hamza Shah | hamza@novaworks.example | Demo123! |
| DEV03 | Agent | Sara Noor | sara@novaworks.example | Demo123! |
| DEV04 | Agent | Usman Tariq | usman@novaworks.example | Demo123! |
| DEV05 | Agent | Zain Abbas | zain@novaworks.example | Demo123! |
| DEV06 | Agent | Maryam Asif | maryam@novaworks.example | Demo123! |

## How Judges Can Test
1. Log in as **admin** → **Create from Transcript**.
2. Click **📄 Load supplied transcript** (file: `public/sample-transcript.txt`) or paste your own.
3. Click **✨ Create from Transcript** → expect **3 projects, 12 tasks** (UrbanCart 40h, QuickServe 46h, HelpDeskPro 38h).
4. Open UrbanCart: manager Ayesha, deadline 20 Oct 2026, 4 tasks.
5. Log in as **Ayesha** → only UrbanCart.
6. Log in as **Ali** → My Tasks shows only his 3 UrbanCart tasks.
7. Log in as **Hamza** → 2 API tasks across UrbanCart and QuickServe.
8. Direct access check: as Ayesha, open `/api/projects/<QuickServe id>` → `403`.
9. Refresh → data persists.
10. Modified transcript: run `npm run reset:projects`, change Usman's final estimate to 12 hours / 23 October, then create again → only that task changes.

## Deployment Details (Vercel + Aiven)
1. Create a free PostgreSQL database on **Aiven** (https://aiven.io/free-postgresql-database) and copy the Service URI (`...?sslmode=require`).
2. Locally, put that URI in `.env` as `DATABASE_URL` and run `npm run setup` to create tables and seed users in the hosted DB.
3. Push to GitHub → import the repo in **Vercel** (framework auto-detected: Next.js, build `next build`).
4. In Vercel → Settings → Environment Variables add `DATABASE_URL`, `SESSION_SECRET`, `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`).
5. Deploy → open the URL and log in with the demo accounts.
- Deployment status: [Live / Local only]
- Frontend + backend host: Vercel (same Next.js app)
- Database: Aiven PostgreSQL
- Deployed branch/commit: [main / SHA]

## Known Limitations
- AI output quality depends on the chosen model; validation blocks bad output from being saved, and the admin can correct it.
- Free AI tiers can rate-limit. Wait a few seconds and retry.
- Editing projects/tasks after creation is only available through the correction form (optional feature).
- Running the transcript twice creates a second copy. Use `npm run reset:projects` between tests.

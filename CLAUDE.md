# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Docker (Primary Workflow)

```bash
# Start all services
docker-compose up -d
# or
make up

# Development mode (frontend hot reload on port 5173)
docker-compose --profile dev up
# or
make dev

# Rebuild after code changes
docker-compose up -d --build

# Seed sample job postings
docker-compose exec backend python seed_data.py

# Create default user accounts (admin/hr/candidate)
docker-compose exec backend python seed_users.py

# Stop services
docker-compose down

# Full reset (removes volumes/data)
docker-compose down -v

# View logs
docker-compose logs -f [backend|frontend|postgres]
```

### Local Development (Without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
venv/Scripts/activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Vite dev server on :5173
npm run build      # tsc + vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Database Migrations (Alembic)

```bash
docker-compose exec backend alembic upgrade head
docker-compose exec backend alembic revision --autogenerate -m "description"
```

### Useful Docker Shortcuts

```bash
make shell-be     # bash into backend container
make shell-db     # psql into hris_db
docker-compose ps # check service health
```

## Architecture

### Service Ports

| Service | URL |
|---------|-----|
| Frontend (prod) | http://localhost (port 80) |
| Frontend (dev) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### Default Accounts (after running seed_users.py)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hris.com | admin123 |
| HR | hr@hris.com | hr123 |
| Candidate | candidate@hris.com | candidate123 |

### Backend (FastAPI)

Located in `backend/app/`:

- **`main.py`** — App entry point; creates all DB tables on startup, registers the router, configures CORS
- **`core/config.py`** — All settings via `pydantic_settings.BaseSettings`, reads from `backend/.env`; includes JWT config and Gemini API key for resume parsing
- **`core/dependencies.py`** — FastAPI `Depends` helpers: `get_db`, `get_current_user`, `get_current_hr_or_admin`
- **`core/security.py`** — JWT creation/verification, password hashing
- **`api/v1/api.py`** — Mounts all routers under `/api/v1/`
- **`api/v1/endpoints/`** — One file per domain: `auth`, `users`, `profile`, `dashboard`, `job_postings`, `applications`, `interviews`, `matching`
- **`models/`** — SQLAlchemy ORM models; tables are auto-created by `main.py` (no migration required for initial setup)
- **`schemas/`** — Pydantic request/response schemas
- **`services/`** — Business logic: `resume_parser.py` (Gemini AI), `matching/` (hybrid candidate-job scoring with embedding cache)

**User roles:** `admin`, `hr`, `candidate` (enum in `models/user.py`). Role-based access is enforced in dependencies.

### Frontend (React + TypeScript + Vite)

Located in `frontend/src/`:

- **`App.tsx`** — Router setup; wraps everything in `<AuthProvider>`; separates public routes (`/login`, `/register`) from protected routes (all others via `<ProtectedRoute>`)
- **`contexts/AuthContext.tsx`** — Global auth state; stores JWT in `localStorage`; exposes `useAuth()` hook with `user`, `token`, `isAuthenticated`, `login`, `logout`, `register`, `refreshUser`
- **`services/api.ts`** — Single `apiService` object; all API calls go through here; reads `VITE_API_URL` from env (defaults to `http://localhost:8000/api/v1`); attaches Bearer token from `localStorage` automatically
- **`components/Layout.tsx`** — Shell with `<Sidebar>` and `<Outlet>` for nested routes
- **`components/Sidebar.tsx`** — Role-aware navigation (HR/Admin vs Candidate views)
- **`pages/`** — One page component per route

**Role-based UI:** The sidebar and available routes differ by `user.role`. HR/Admin see job postings management, applications, interviews, and candidate matching. Candidates see browse jobs, my applications, and my interviews.

### Key Patterns

- **API base URL** is set in `frontend/.env.development` as `VITE_API_URL`. For Docker production, Nginx proxies API calls.
- **JWT auth flow**: Login → receive `access_token` → store in `localStorage` → attach as `Authorization: Bearer <token>` on every request via `apiService`.
- **Candidate matching** (`/matching`) uses a hybrid scorer combining keyword-based skills matching with optional embedding similarity. Results are cached in `backend/app/models/embedding_cache.py`. Requires no external API unless embeddings are enabled.
- **Resume parsing** uses the Google Gemini API (`GEMINI_API_KEY` in `backend/.env`). Only PDF uploads are supported (max 10 MB).
- **Database tables** are created automatically on backend startup via `metadata.create_all()`. Alembic is available for schema migrations going forward.

### Environment Variables

**`backend/.env`:**
```
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/hris_db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost
JWT_SECRET_KEY=<change-in-production>
GEMINI_API_KEY=<optional, for resume parsing>
```

**`frontend/.env.development`:**
```
VITE_API_URL=http://localhost:8000/api/v1
```

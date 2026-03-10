# AGENTS.md

Universal protocol for AI coding agents working in this repository.
Applies to Claude Code, Cursor, GitHub Copilot, and any other AI assistant.

---

## 1. Project Identity

**HRIS** — Human Resource Information System.
Full-stack web app: React/TypeScript frontend + FastAPI backend + PostgreSQL.
Deployed via Docker Compose. Primary workflow is Docker; local dev is secondary.

Three user roles drive the entire system: `admin`, `hr`, `candidate`.
Role determines which API routes are accessible and which UI is rendered.

---

## 2. Running the System

### Preferred: Docker

```bash
docker-compose up -d                                    # start all services
docker-compose up -d --build                            # rebuild after changes
docker-compose --profile dev up                         # frontend hot reload on :5173
docker-compose exec backend python seed_data.py         # sample job postings
docker-compose exec backend python seed_users.py        # default accounts
docker-compose down                                     # stop
docker-compose down -v                                  # stop + wipe volumes
docker-compose logs -f [backend|frontend|postgres]      # tail logs
```

### Local Backend (no Docker)

```bash
cd backend
python -m venv venv && venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload        # http://localhost:8000
```

### Local Frontend (no Docker)

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
npm run lint     # ESLint (0 warnings allowed)
```

### Database Migrations

```bash
docker-compose exec backend alembic upgrade head
docker-compose exec backend alembic revision --autogenerate -m "description"
```

---

## 3. Service Map

| Service       | URL                          |
|---------------|------------------------------|
| Frontend prod | http://localhost (port 80)   |
| Frontend dev  | http://localhost:5173         |
| Backend API   | http://localhost:8000/api/v1 |
| Swagger docs  | http://localhost:8000/docs   |
| PostgreSQL    | localhost:5432 / hris_db     |

Default accounts (after `seed_users.py`):

| Role      | Email                | Password     |
|-----------|----------------------|--------------|
| Admin     | admin@hris.com       | admin123     |
| HR        | hr@hris.com          | hr123        |
| Candidate | candidate@hris.com   | candidate123 |

---

## 4. Backend Conventions

### Project layout

```
backend/app/
├── api/v1/endpoints/   # one file per domain: auth, users, profile, dashboard,
│                       # job_postings, applications, interviews, matching
├── core/
│   ├── config.py       # pydantic_settings; reads backend/.env
│   ├── security.py     # JWT creation/verify, password hashing (bcrypt)
│   └── dependencies.py # FastAPI Depends: get_db, get_current_user,
│                       #   get_current_hr_or_admin
├── db/database.py      # SQLAlchemy engine, SessionLocal, Base, get_db
├── models/             # ORM models (one file per entity)
├── schemas/            # Pydantic request/response schemas
└── services/
    ├── resume_parser.py             # Gemini AI PDF → structured JSON
    └── matching/
        ├── hybrid_matcher.py        # 70% semantic + 30% keyword scoring
        ├── embedding_service.py     # Gemini embeddings
        └── cache_service.py         # DB-backed embedding cache
```

### Adding a new endpoint

1. Create `app/api/v1/endpoints/<domain>.py` with an `APIRouter`.
2. Register it in `app/api/v1/api.py` with `api_router.include_router(...)`.
3. Add a model in `models/`, schema in `schemas/`, and import both in `app/main.py`'s `create_all` block if a new table is needed.

### Model conventions

- All PKs: `UUID(as_uuid=True)`, default `uuid.uuid4`.
- All tables have `created_at` and `updated_at` `DateTime` columns with `default=datetime.utcnow` and `onupdate=datetime.utcnow`.
- Enums in models use `str, enum.Enum` so values are strings (not ints).
- JSON columns (`requirements`, `responsibilities`, `documents`, `timeline`) store Python lists/dicts.
- Binary files (resumes, avatars) are stored as `LargeBinary` (BYTEA) directly in PostgreSQL — no object storage.

### Schema conventions

- Use `Base → Create → Update → Response` inheritance where appropriate.
- `Update` schemas use `Optional` for every field and call `model_dump(exclude_unset=True)` in the endpoint.
- `Response` schemas set `model_config = ConfigDict(from_attributes=True)` (or `class Config: from_attributes = True`).

### Auth and permissions

- `get_current_user` — any authenticated user.
- `get_current_hr_or_admin` — role must be `hr` or `admin`; raises 403 otherwise.
- Endpoints that only admin/HR should reach must `Depends(get_current_hr_or_admin)`.
- JWT: HS256, expires in 30 min (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).

### Matching service

- Scoring: `total_score = 0.7 * semantic_score + 0.3 * keyword_score` (0–100).
- Keyword score: exact match = 1.0, substring match = 0.5, averaged across requirements.
- Semantic score: cosine similarity between Gemini text embeddings (768-dim); requires `GEMINI_API_KEY`.
- Without `GEMINI_API_KEY`, semantic score is 0 and only keyword matching runs.
- Embeddings are cached in the `embedding_cache` table; invalidated when job requirements change.

---

## 5. Frontend Conventions

### Project layout

```
frontend/src/
├── contexts/AuthContext.tsx   # global auth state; useAuth() hook
├── services/api.ts            # ALL API calls live here (ApiService class)
├── components/
│   ├── Layout.tsx             # shell: <Sidebar> + <Outlet>
│   ├── ProtectedRoute.tsx     # redirects to /login if not authenticated
│   ├── Sidebar.tsx            # role-filtered nav items
│   └── [domain]/              # modals, sub-components per domain
├── pages/                     # one file per route
└── types/                     # shared TypeScript interfaces (mostly in api.ts)
```

### Auth pattern

- `AuthProvider` wraps the entire app in `App.tsx`.
- JWT is stored in `localStorage` under the key `"token"`.
- `useAuth()` exposes: `user`, `token`, `isAuthenticated`, `isLoading`, `login`, `logout`, `register`, `refreshUser`.
- `ProtectedRoute` blocks unauthenticated access; redirects to `/login`.

### API calls

- Every API call goes through the singleton `apiService` in `services/api.ts`.
- `apiService` reads the JWT from `localStorage` and attaches `Authorization: Bearer <token>` automatically.
- Base URL is `VITE_API_URL` (env var) — defaults to `http://localhost:8000/api/v1`.
- Errors: `handleResponse` throws `new Error(error.detail)` matching FastAPI's `HTTPException` shape.
- When adding a new API method: add the TypeScript interface(s) at the top of `api.ts`, then add the method to the `ApiService` class.

### Role-based UI

- `user.role` is `"admin"`, `"hr"`, or `"candidate"` (lowercase strings).
- Sidebar filters `allMenuItems` by `item.roles.includes(userRole)`.
- HR/Admin routes: `/job-postings`, `/applications`, `/interviews`, `/matching`.
- Candidate routes: `/jobs`, `/my-applications`, `/my-interviews`.
- When adding a new route, update both `App.tsx` (add `<Route>`) and `Sidebar.tsx` (add to `allMenuItems` with correct `roles`).

### Component rules

- Modals are in `components/modals/` or `components/<domain>/`.
- Pages fetch their own data on mount (no global state beyond auth).
- `lucide-react` for all icons — do not import from other icon libraries.
- Styling is Tailwind CSS only — no CSS modules, no inline style objects unless dynamic.

---

## 6. Environment Variables

### `backend/.env`

```
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/hris_db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost
JWT_SECRET_KEY=<min-32-chars, change in production>
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=          # optional; enables semantic matching + resume parsing
MAX_RESUME_SIZE_MB=10
```

### `frontend/.env.development`

```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 7. Data Flow Reference

```
User action (React page)
  → apiService method (services/api.ts)
    → FastAPI endpoint (api/v1/endpoints/<domain>.py)
      → Depends(get_db) injects SQLAlchemy session
      → ORM model query / mutation
      → Pydantic Response schema serialization
  ← JSON response
← State update → re-render
```

---

## 8. Key Constraints

- **No test suite exists.** Manual testing via Swagger (`/docs`) and the UI is the current practice.
- **No migrations pre-exist.** `main.py` calls `create_all()` to bootstrap tables. Use Alembic only for schema changes after initial setup.
- **Resume files are stored as BYTEA in PostgreSQL** — avoid refactoring this to filesystem/S3 without explicit instruction.
- **Do not change the role strings** (`admin`, `hr`, `candidate`) — they are stored in the DB and matched in code as plain strings.
- **Frontend has no test runner configured.** Do not add test files without first adding a test framework.
- **ESLint max-warnings is 0.** `npm run lint` must pass clean before any frontend build.

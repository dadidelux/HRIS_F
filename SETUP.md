# HRIS Setup Guide

This guide will help you get the HRIS application up and running quickly.

## 🎯 What You'll Get

After setup, you'll have a fully functional HRIS system with:
- **React Frontend** on http://localhost
- **FastAPI Backend** on http://localhost:8000
- **PostgreSQL Database** on localhost:5432
- **Interactive API Docs** on http://localhost:8000/docs

## 🚀 Quick Start (Recommended)

### Option 1: Windows Users
Simply double-click `start.bat` or run:
```cmd
start.bat
```

### Option 2: Linux/Mac Users
```bash
./start.sh
```

### Option 3: Using Make
```bash
make up
make seed
```

### Option 4: Manual Docker Compose
```bash
docker-compose up -d
docker-compose exec backend python seed_data.py
```

## 📋 Prerequisites

Before you start, ensure you have:

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Ensure it's running (check system tray/menu bar)

2. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

3. **Make** (optional, for using Makefile commands)
   - Windows: Install via Chocolatey or MinGW
   - Mac: Comes pre-installed
   - Linux: Usually pre-installed

## 🔧 Detailed Setup Steps

### Step 1: Verify Docker is Running

```bash
docker --version
docker-compose --version
```

You should see version numbers. If not, install Docker Desktop first.

### Step 2: Navigate to Project Directory

```bash
cd HRIS_F
```

### Step 3: Start the Application

Choose one of the quick start methods above. The first time will take a few minutes as Docker downloads and builds images.

### Step 4: Verify Services are Running

```bash
docker-compose ps
```

You should see three services running:
- `hris_frontend`
- `hris_backend`
- `hris_postgres`

### Step 5: Seed Database (Optional but Recommended)

```bash
docker-compose exec backend python seed_data.py
```

This adds 3 sample job postings so you can see the app in action immediately.

### Step 6: Access the Application

Open your browser and go to:
- **Main App**: http://localhost
- **API Docs**: http://localhost:8000/docs
- **API**: http://localhost:8000/api/v1/job-postings/

## 🎨 Using the Application

### Create a Job Posting
1. Click "Add Job Posting" button
2. Fill in Basic Information (step 1)
3. Add Job Description (step 2)
4. Add Requirements & Responsibilities (step 3)
5. Set Application Deadline (step 4)
6. Click "Create Job Posting"

### View Job Details
- Click the eye icon on any job card

### Edit a Job Posting
- Click the pencil icon on any job card
- Modify the fields
- Click "Save Changes"

### Delete a Job Posting
- Click the trash icon on any job card
- Confirm deletion in the modal

## 🛠️ Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Clean Slate (Remove Everything)
```bash
docker-compose down -v
```

## 🔍 Troubleshooting

### "Port already in use" Error

**Problem**: Another service is using ports 80, 3000, 8000, or 5432

**Solution**:
1. Stop other services using those ports, or
2. Edit `docker-compose.yml` to change port mappings:
```yaml
ports:
  - "8080:80"  # Instead of "80:80"
```

### "Cannot connect to Docker daemon"

**Problem**: Docker Desktop is not running

**Solution**: Start Docker Desktop and wait for it to fully start

### Backend Shows Database Connection Error

**Problem**: PostgreSQL not ready yet

**Solution**: Wait 10-15 seconds and refresh. First startup takes longer.

### Frontend Shows "Failed to fetch"

**Problem**: Backend not running or CORS issue

**Solutions**:
1. Check backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify CORS settings in `backend/app/core/config.py`

### No Job Postings Showing

**Problem**: Database not seeded

**Solution**: Run seed command:
```bash
docker-compose exec backend python seed_data.py
```

## 🔧 Development Mode

For frontend development with hot reload:

```bash
docker-compose --profile dev up
```

Access the dev server at http://localhost:5173

## 📊 Checking System Health

### Check All Services
```bash
docker-compose ps
```

### Check Backend Health
```bash
curl http://localhost:8000/health
```

### Check Database Connection
```bash
docker-compose exec postgres pg_isready -U postgres
```

### View Backend Logs
```bash
docker-compose logs backend
```

### View Frontend Logs
```bash
docker-compose logs frontend
```

### View Database Logs
```bash
docker-compose logs postgres
```

## 🗄️ Database Access

### Access PostgreSQL Shell
```bash
docker-compose exec postgres psql -U postgres -d hris_db
```

### Useful SQL Commands
```sql
-- List all tables
\dt

-- View job postings
SELECT * FROM job_postings;

-- Count job postings
SELECT COUNT(*) FROM job_postings;

-- Exit
\q
```

## 🔄 Updating the Application

### Pull Latest Changes (if using Git)
```bash
git pull origin main
```

### Rebuild and Restart
```bash
docker-compose down
docker-compose up -d --build
```

## 🌐 Accessing Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | Main application UI |
| Frontend (Alt) | http://localhost:3000 | Alternative port |
| Backend API | http://localhost:8000 | REST API |
| API Docs (Swagger) | http://localhost:8000/docs | Interactive API documentation |
| API Docs (ReDoc) | http://localhost:8000/redoc | Alternative API documentation |
| PostgreSQL | localhost:5432 | Database (use client like pgAdmin) |

## 📝 Environment Variables

### Backend (.env)
Located at `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/hris_db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost
API_V1_PREFIX=/api/v1
PROJECT_NAME=HRIS API
DEBUG=True
```

### Frontend (.env.development)
Located at `frontend/.env.development`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 🎯 Next Steps

1. ✅ **Explore the UI** - Navigate through different sections
2. ✅ **Create Job Postings** - Try the multi-step form
3. ✅ **Test CRUD Operations** - Create, read, update, delete
4. ✅ **Check API Docs** - Visit http://localhost:8000/docs
5. ✅ **Review Code** - Explore frontend and backend code

## 💡 Tips

- Use `make help` to see all available commands
- The first startup takes longer (downloads images)
- Subsequent startups are much faster
- Data persists between restarts (stored in Docker volumes)
- Use `docker-compose down -v` to completely reset

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. View logs: `docker-compose logs`
3. Check Docker Desktop is running
4. Ensure ports aren't in use
5. Try a clean restart: `docker-compose down -v && docker-compose up -d`

## ✨ Success!

If everything is working, you should see:
- ✅ Frontend loads at http://localhost
- ✅ Backend API responds at http://localhost:8000
- ✅ API docs accessible at http://localhost:8000/docs
- ✅ Job postings are visible (if seeded)
- ✅ All CRUD operations work

Enjoy using HRIS! 🎉

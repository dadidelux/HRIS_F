@echo off
echo 🚀 Starting HRIS Application...
echo ================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    exit /b 1
)

REM Build and start services
echo 📦 Building Docker images...
docker-compose build

echo 🔄 Starting services...
docker-compose up -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if backend is running
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Backend might not be ready yet
) else (
    echo ✅ Backend is running
)

REM Ask if user wants to seed database
set /p SEED="📊 Do you want to seed the database with sample data? (y/n): "
if /i "%SEED%"=="y" (
    echo 🌱 Seeding database...
    docker-compose exec backend python seed_data.py
)

echo.
echo ✨ HRIS Application is ready!
echo ================================
echo 🌐 Frontend:    http://localhost
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs:    http://localhost:8000/docs
echo.
echo To stop: docker-compose down
echo To view logs: docker-compose logs -f
pause

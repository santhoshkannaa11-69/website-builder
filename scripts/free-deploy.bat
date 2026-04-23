@echo off
REM 🆓 Completely Free Website Builder Deployment Script for Windows
REM No credit card required - 100% free hosting

echo 🆓 Starting FREE Website Builder Deployment...
echo 🚀 This deployment costs $0 forever!

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo 🔍 Checking environment variables...

REM Set default values if not set
if "%AI_API_KEY%"=="" (
    echo ⚠️  AI_API_KEY not set. Using fallback generation (no API key needed).
    set AI_API_KEY=
)

if "%BETTER_AUTH_SECRET%"=="" (
    echo 🔐 Using default auth secret...
    set BETTER_AUTH_SECRET=7fNv0oXPNSSa69BMPQLGF2Q3GIHWvvek
)

set BETTER_AUTH_URL=http://localhost
set TRUSTED_ORIGINS=http://localhost
set VITE_BASEURL=http://localhost

echo ✅ Environment variables configured

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.free.yml down 2>nul

REM Build Docker images
echo 🐳 Building Docker images...
docker-compose -f docker-compose.free.yml build --no-cache

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

echo ✅ Docker images built successfully

REM Start database and redis first
echo 🗄️ Starting database and Redis...
docker-compose -f docker-compose.free.yml up -d db redis

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
:wait_db
docker-compose -f docker-compose.free.yml exec -T db pg_isready -U postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database is ready
    goto wait_redis
)
echo ⏳ Waiting for database...
timeout /t 2 >nul
goto wait_db

:wait_redis
echo ⏳ Waiting for Redis to be ready...
:wait_redis_loop
docker-compose -f docker-compose.free.yml exec -T redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis is ready
    goto migrate
)
echo ⏳ Waiting for Redis...
timeout /t 1 >nul
goto wait_redis_loop

:migrate
echo 🗄️ Running database migrations...
docker-compose -f docker-compose.free.yml run --rm migrate

if %errorlevel% neq 0 (
    echo ⚠️  Database migration failed! Continuing anyway...
)

REM Start all services
echo 🚀 Starting all services...
docker-compose -f docker-compose.free.yml up -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
:wait_backend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy
    goto wait_frontend
)
echo ⏳ Waiting for backend...
timeout /t 2 >nul
goto wait_backend

:wait_frontend
curl -s http://localhost >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is healthy
    goto done
)
echo ⏳ Waiting for frontend...
timeout /t 2 >nul
goto wait_frontend

:done
echo.
echo 🎉 FREE DEPLOYMENT COMPLETE!
echo.
echo 🌐 Your Website Builder is now running at:
echo    ➡️  http://localhost
echo.
echo 📋 What's included (100%% FREE):
echo    ✅ PostgreSQL Database
echo    ✅ Redis Cache
echo    ✅ Backend API
echo    ✅ Frontend Website
echo    ✅ AI Website Generation
echo    ✅ User Authentication
echo.
echo 🔧 Management commands:
echo    View logs: docker-compose -f docker-compose.free.yml logs -f
echo    Stop: docker-compose -f docker-compose.free.yml down
echo    Restart: docker-compose -f docker-compose.free.yml restart
echo.
echo 🌍 Next steps for internet deployment:
echo    1. Get free domain: https://cloudflare.com
echo    2. Set up free database: https://supabase.com
echo    3. Deploy to Play with Docker: https://play-with-docker.com
echo.
echo 🚀 Your free website builder is ready!
echo.
pause

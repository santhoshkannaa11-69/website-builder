@echo off
REM 🐳 Simple Docker Deployment Script
REM No credit card required - uses local Docker

echo 🐳 Starting Docker Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Set environment variables
if "%AI_API_KEY%"=="" (
    echo ⚠️  AI_API_KEY not set. Using fallback generation.
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

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.simple.yml down 2>nul

REM Build and start services
echo 🐳 Building and starting services...
docker-compose -f docker-compose.simple.yml up --build -d

if %errorlevel% neq 0 (
    echo ❌ Docker deployment failed!
    pause
    exit /b 1
)

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 >nul

REM Check if services are running
echo 📊 Checking service status...
docker-compose -f docker-compose.simple.yml ps

echo.
echo 🎉 Docker deployment complete!
echo.
echo 🌐 Your Website Builder is running at:
echo    ➡️  http://localhost
echo.
echo 📋 Services running:
echo    ✅ PostgreSQL Database (port 5432)
echo    ✅ Redis Cache (port 6379)
echo    ✅ Backend API (port 3000)
echo    ✅ Frontend (port 80)
echo.
echo 🔧 Management commands:
echo    View logs: docker-compose -f docker-compose.simple.yml logs -f
echo    Stop: docker-compose -f docker-compose.simple.yml down
echo    Restart: docker-compose -f docker-compose.simple.yml restart
echo.
echo 🌍 For internet deployment:
echo    1. Set up free database: https://supabase.com
echo    2. Deploy to Play with Docker: https://play-with-docker.com
echo    3. Get free domain: https://cloudflare.com
echo.
echo 🚀 Your Docker website builder is ready!
echo.
pause

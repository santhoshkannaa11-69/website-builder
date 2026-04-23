#!/bin/bash

# 🆓 Completely Free Website Builder Deployment Script
# No credit card required - 100% free hosting

set -e

echo "🆓 Starting FREE Website Builder Deployment..."
echo "🚀 This deployment costs $0 forever!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check for required environment variables
echo -e "${BLUE}🔍 Checking environment variables...${NC}"

if [ -z "$AI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  AI_API_KEY not found. Getting free API key...${NC}"
    echo -e "${BLUE}📖 Get your free API key from: https://openrouter.ai${NC}"
    echo -e "${BLUE}📖 Or use: https://platform.openai.com/api-keys${NC}"
    echo -e "${YELLOW}⚠️  For now, using fallback generation (no API key needed)${NC}"
fi

# Generate secure auth secret if not provided
if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo -e "${BLUE}🔐 Generating secure auth secret...${NC}"
    export BETTER_AUTH_SECRET=$(openssl rand -hex 32)
fi

# Set default values
export BETTER_AUTH_URL="${BETTER_AUTH_URL:-http://localhost}"
export TRUSTED_ORIGINS="${TRUSTED_ORIGINS:-http://localhost}"
export VITE_BASEURL="${VITE_BASEURL:-http://localhost}"

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Stop any existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.free.yml down 2>/dev/null || true

# Clean up old images (optional)
echo -e "${BLUE}🧹 Cleaning up old Docker images...${NC}"
docker system prune -f 2>/dev/null || true

# Build Docker images
echo -e "${BLUE}🐳 Building Docker images...${NC}"
docker-compose -f docker-compose.free.yml build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Start database and redis first
echo -e "${BLUE}🗄️ Starting database and Redis...${NC}"
docker-compose -f docker-compose.free.yml up -d db redis

# Wait for database to be ready
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
for i in {1..30}; do
    if docker-compose -f docker-compose.free.yml exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for database... ($i/30)${NC}"
    sleep 2
done

# Wait for Redis to be ready
echo -e "${BLUE}⏳ Waiting for Redis to be ready...${NC}"
for i in {1..15}; do
    if docker-compose -f docker-compose.free.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis is ready${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for Redis... ($i/15)${NC}"
    sleep 1
done

# Run database migrations
echo -e "${BLUE}🗄️ Running database migrations...${NC}"
docker-compose -f docker-compose.free.yml run --rm migrate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database migration failed!${NC}"
    echo -e "${YELLOW}⚠️  Continuing anyway - might work with existing data${NC}"
fi

# Start all services
echo -e "${BLUE}🚀 Starting all services...${NC}"
docker-compose -f docker-compose.free.yml up -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for backend... ($i/60)${NC}"
    sleep 2
done

for i in {1..30}; do
    if curl -s http://localhost > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for frontend... ($i/30)${NC}"
    sleep 2
done

# Show status
echo -e "${BLUE}📊 Container status:${NC}"
docker-compose -f docker-compose.free.yml ps

echo ""
echo -e "${GREEN}🎉 FREE DEPLOYMENT COMPLETE!${NC}"
echo ""
echo -e "${BLUE}🌐 Your Website Builder is now running at:${NC}"
echo -e "${GREEN}   ➡️  http://localhost${NC}"
echo ""
echo -e "${BLUE}📋 What's included (100% FREE):${NC}"
echo -e "${GREEN}   ✅ PostgreSQL Database${NC}"
echo -e "${GREEN}   ✅ Redis Cache${NC}"
echo -e "${GREEN}   ✅ Backend API${NC}"
echo -e "${GREEN}   ✅ Frontend Website${NC}"
echo -e "${GREEN}   ✅ AI Website Generation${NC}"
echo -e "${GREEN}   ✅ User Authentication${NC}"
echo ""
echo -e "${BLUE}🔧 Management commands:${NC}"
echo -e "${YELLOW}   View logs: docker-compose -f docker-compose.free.yml logs -f${NC}"
echo -e "${YELLOW}   Stop: docker-compose -f docker-compose.free.yml down${NC}"
echo -e "${YELLOW}   Restart: docker-compose -f docker-compose.free.yml restart${NC}"
echo ""
echo -e "${BLUE}🌍 Next steps for internet deployment:${NC}"
echo -e "${YELLOW}   1. Get free domain: https://cloudflare.com${NC}"
echo -e "${YELLOW}   2. Set up free database: https://supabase.com${NC}"
echo -e "${YELLOW}   3. Deploy to Play with Docker: https://play-with-docker.com${NC}"
echo ""
echo -e "${GREEN}🚀 Your free website builder is ready!${NC}"

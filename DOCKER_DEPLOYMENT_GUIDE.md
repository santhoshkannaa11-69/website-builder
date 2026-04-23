# 🐳 Docker Deployment Guide - 100% Free

## 🎉 Your Docker Deployment is Working!

Your website builder is now running successfully with Docker:
- ✅ **Frontend**: http://localhost (port 80)
- ✅ **Backend**: http://localhost:3000 (port 3000)
- ✅ **Database**: PostgreSQL (port 5432)
- ✅ **Cache**: Redis (port 6379)

---

## 🚀 Local Docker Deployment (Working)

### Quick Start:
```bash
# Run the Windows deployment script
scripts\docker-deploy.bat

# Or run manually
docker-compose -f docker-compose.simple.yml up --build -d
```

### Check Status:
```bash
# View running containers
docker-compose -f docker-compose.simple.yml ps

# View logs
docker-compose -f docker-compose.simple.yml logs -f

# Stop all services
docker-compose -f docker-compose.simple.yml down
```

---

## 🌐 Internet Deployment Options

### Option 1: Play with Docker (Free & Easy)
**Best for testing and demos**

1. **Go to [play-with-docker.com](https://play-with-docker.com)**
2. **Sign in with Docker Hub**
3. **Create new instance** (4 hours, renewable)
4. **Clone your repository**:
   ```bash
   git clone https://github.com/yourusername/website-builder.git
   cd website-builder
   ```
5. **Deploy**:
   ```bash
   docker-compose -f docker-compose.simple.yml up --build -d
   ```
6. **Get your URL** from the top of the page

### Option 2: DigitalOcean App Platform (Free Tier)
**Best for production**

1. **Go to [digitalocean.com](https://digitalocean.com)**
2. **Create App Platform account** (free tier available)
3. **Connect your GitHub repository**
4. **Configure app**:
   - **Build Command**: `docker-compose -f docker-compose.simple.yml build`
   - **Run Command**: `docker-compose -f docker-compose.simple.yml up -d`
   - **HTTP Port**: 80

### Option 3: AWS EC2 (Free Tier)
**Best for full control**

1. **Go to [aws.amazon.com](https://aws.amazon.com)**
2. **Create free tier account**
3. **Launch EC2 instance** (t2.micro - free)
4. **Install Docker**:
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```
5. **Deploy your app**:
   ```bash
   git clone https://github.com/yourusername/website-builder.git
   cd website-builder
   docker-compose -f docker-compose.simple.yml up --build -d
   ```

---

## 🗄️ External Database Setup (For Production)

### Supabase (Free PostgreSQL)
1. **Go to [supabase.com](https://supabase.com)**
2. **Create free account**
3. **Create new project**
4. **Get connection string** from Settings → Database
5. **Update your environment**:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
   ```

### Upstash Redis (Free Redis)
1. **Go to [upstash.com](https://upstash.com)**
2. **Create free account**
3. **Create Redis database**
4. **Get connection string**:
   ```env
   REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]
   ```

---

## 🌍 Domain & SSL Setup

### Cloudflare (Free)
1. **Go to [cloudflare.com](https://cloudflare.com)**
2. **Create free account**
3. **Add your domain** (or get free subdomain)
4. **Configure DNS** to point to your server
5. **Enable SSL** (automatic)

### Example DNS Setup:
```
A Record: @ → YOUR_SERVER_IP
CNAME: www → your-domain.com
```

---

## 📱 Production Docker Configuration

### Production docker-compose.yml:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      AI_API_KEY: ${AI_API_KEY}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL}
      TRUSTED_ORIGINS: ${TRUSTED_ORIGINS}
      NODE_ENV: production
    ports:
      - "3000:3000"
    restart: unless-stopped

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    environment:
      VITE_BASEURL: ${VITE_BASEURL}
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

---

## 🔧 Environment Variables for Production

### Create `.env.production`:
```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres

# Redis (Upstash)
REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]

# AI Service (OpenRouter)
AI_API_KEY=sk-or-v1-your-api-key

# Authentication
BETTER_AUTH_SECRET=your-secure-secret-here
BETTER_AUTH_URL=https://your-domain.com
TRUSTED_ORIGINS=https://your-domain.com

# Frontend
VITE_BASEURL=https://your-domain.com
```

---

## 🚀 Quick Deployment Commands

### Local Testing:
```bash
# Start locally
docker-compose -f docker-compose.simple.yml up --build -d

# Check status
docker-compose -f docker-compose.simple.yml ps

# View logs
docker-compose -f docker-compose.simple.yml logs -f

# Stop
docker-compose -f docker-compose.simple.yml down
```

### Production Deployment:
```bash
# Set production environment
export $(cat .env.production | xargs)

# Deploy to production
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 📊 Free Tier Limits

### Play with Docker:
- ✅ 4-hour sessions (renewable)
- ✅ Public repositories
- ✅ No credit card required

### DigitalOcean App Platform:
- ✅ $5 free credit
- ✅ 3 free apps
- ✅ 256MB RAM per app

### AWS EC2:
- ✅ 750 hours/month (t2.micro)
- ✅ 1 GB RAM
- ✅ 8 GB storage

### Supabase:
- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ Real-time subscriptions

---

## 🎯 Recommended Production Stack

### **Best Free Option: Play with Docker + Supabase**
- ✅ **Hosting**: Play with Docker (free, renewable)
- ✅ **Database**: Supabase (500MB free)
- ✅ **Domain**: Cloudflare (free SSL)
- ✅ **Total Cost**: $0 forever

### **Alternative: DigitalOcean App Platform**
- ✅ **Hosting**: DigitalOcean ($5 free credit)
- ✅ **Database**: Built-in PostgreSQL
- ✅ **Domain**: Custom domain supported
- ✅ **Total Cost**: $0 (first 3 months)

---

## 🛠️ Troubleshooting

### Common Issues:
1. **Port conflicts**: Change ports in docker-compose.yml
2. **Database connection**: Check DATABASE_URL format
3. **Build failures**: Check Dockerfile syntax
4. **Memory issues**: Use smaller containers

### Debug Commands:
```bash
# Check container logs
docker logs website-builder-backend
docker logs website-builder-frontend

# Check container status
docker-compose -f docker-compose.simple.yml ps

# Restart specific service
docker-compose -f docker-compose.simple.yml restart backend

# Rebuild everything
docker-compose -f docker-compose.simple.yml up --build --force-recreate
```

---

## 🎉 Success! Your Docker App is Live!

### What You Have:
- ✅ **Working Docker deployment**
- ✅ **Database and cache**
- ✅ **AI website generation**
- ✅ **User authentication**
- ✅ **Production-ready code**

### Next Steps:
1. **Choose your hosting platform**
2. **Set up external database**
3. **Configure your domain**
4. **Deploy to production**

### Your App is Ready for:
- 🌐 **Internet deployment**
- 👥 **Multiple users**
- 💰 **Payment processing**
- 📊 **Analytics and monitoring**

---

## 🚀 Ready to Go Live?

**Choose your deployment option:**

1. **Quick Test**: Play with Docker (instant, 4-hour sessions)
2. **Production**: DigitalOcean App Platform (free tier)
3. **Full Control**: AWS EC2 (free tier)

**Your Docker website builder is ready for the internet!** 🎊✨

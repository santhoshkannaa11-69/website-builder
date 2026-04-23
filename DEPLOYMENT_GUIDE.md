# 🌐 Website Builder Deployment Guide

## 🚀 Deployment Options

### Option 1: Railway (Recommended - Easiest)
- ✅ Free tier ($5/month credit)
- ✅ Built-in PostgreSQL & Redis
- ✅ Automatic SSL & custom domains
- ✅ GitHub integration
- ✅ Perfect for Docker apps

### Option 2: DigitalOcean App Platform
- ✅ Free tier available
- ✅ Managed databases
- ✅ Simple deployment
- ✅ Good performance

### Option 3: Vercel (Frontend only)
- ✅ Excellent for frontend
- ❌ Limited backend support
- ❌ Need separate database

---

## 🛠️ Railway Deployment Steps

### 1. Prepare Your Project
```bash
# Make sure your project is ready
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Set Up Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Get $5 free credit

### 3. Create Railway Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your website-builder repo
4. Railway will detect your docker-compose.yml

### 4. Configure Environment Variables
Add these in Railway dashboard:
```
DATABASE_URL=postgresql://postgres:password@host:port/database
REDIS_URL=redis://host:port
AI_API_KEY=your_openai_api_key
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=https://your-app.railway.app
TRUSTED_ORIGINS=https://your-app.railway.app
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 5. Set Up Database
1. Railway will create PostgreSQL automatically
2. Run migrations:
   ```bash
   # In Railway console
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 6. Configure Domain
1. Go to Settings → Domains
2. Add your custom domain (optional)
3. Railway provides free subdomain

---

## 🔧 Production Environment Setup

### Required Services:
- **PostgreSQL Database** (Railway provides)
- **Redis Cache** (Railway provides)
- **AI API Key** (OpenRouter/OpenAI)
- **Auth Secret** (Generate new one)
- **Domain** (Optional custom domain)

### Environment Variables Template:
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://host:port

# AI Service
AI_API_KEY=sk-or-v1-your-api-key

# Authentication
BETTER_AUTH_SECRET=generate-secure-random-string
BETTER_AUTH_URL=https://your-domain.com
TRUSTED_ORIGINS=https://your-domain.com

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
VITE_BASEURL=https://your-domain.com
```

---

## 🌐 Custom Domain Setup (Optional)

### 1. Buy a Domain
- GoDaddy, Namecheap, Cloudflare, etc.

### 2. Configure DNS
```
A Record: @ → Railway IP
CNAME: www → your-app.railway.app
```

### 3. SSL Certificate
- Railway provides automatic SSL
- Or use Cloudflare for free SSL

---

## 📊 Monitoring & Scaling

### Railway Features:
- **Auto-scaling** based on traffic
- **Logs** and monitoring
- **Error tracking**
- **Performance metrics**

### Scaling Options:
- **Free**: $5/month credit
- **Pro**: $20/month (more resources)
- **Team**: $50/month (collaboration)

---

## 🚀 Deployment Checklist

### Pre-Deployment:
- [ ] Test locally with docker-compose
- [ ] Fix any bugs
- [ ] Optimize images and assets
- [ ] Set up analytics (Google Analytics)

### Deployment:
- [ ] Push to GitHub
- [ ] Connect Railway
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Test all features
- [ ] Set up custom domain

### Post-Deployment:
- [ ] Monitor performance
- [ ] Set up error alerts
- [ ] Configure backups
- [ ] Test payment system
- [ ] Update documentation

---

## 🎯 Quick Start Commands

```bash
# 1. Test locally
docker-compose up -d

# 2. Push to GitHub
git add .
git commit -m "Production ready"
git push origin main

# 3. Deploy on Railway
# Go to railway.app → New Project → GitHub repo

# 4. Run migrations
npx prisma migrate deploy

# 5. Test your live app
# Open your Railway URL
```

---

## 💡 Pro Tips

### Performance:
- Enable Redis caching
- Optimize images
- Use CDN for assets
- Monitor database queries

### Security:
- Use HTTPS everywhere
- Secure environment variables
- Rate limiting
- Input validation

### Cost Optimization:
- Start with free tier
- Monitor usage
- Scale as needed
- Use managed services

---

## 🆘 Troubleshooting

### Common Issues:
1. **Build fails**: Check Dockerfile syntax
2. **Database errors**: Verify DATABASE_URL
3. **Auth issues**: Check BETTER_AUTH_SECRET
4. **AI not working**: Verify AI_API_KEY

### Debug Commands:
```bash
# Check logs
docker-compose logs backend

# Test database
npx prisma db pull

# Reset migrations
npx prisma migrate reset
```

---

## 📞 Support

### Railway Support:
- Discord community
- Email support
- Documentation

### Additional Resources:
- [Railway Docs](https://docs.railway.app)
- [Docker Deployment](https://docs.docker.com)
- [Prisma Production](https://www.prisma.io/docs/guides/deployment)

---

🎉 **Your website builder is ready for production deployment!**

Choose Railway for the easiest and most cost-effective deployment experience.

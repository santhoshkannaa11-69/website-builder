# 🚀 GitHub Pages + Vercel Deployment Guide

## 🎯 Professional Free Deployment Method

This method gives you:
- ✅ **Frontend**: GitHub Pages (unlimited bandwidth)
- ✅ **Backend**: Vercel Functions (100k invocations/month free)
- ✅ **Database**: Supabase (500MB free)
- ✅ **Total Cost**: $0 forever

---

## 📋 Step 1: Prepare Your Repository

### Push Your Code to GitHub
```bash
# Make sure your code is on GitHub
git add .
git commit -m "Ready for GitHub Pages + Vercel deployment"
git push origin main
```

### Create GitHub Repository (if not done)
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it `website-builder`
4. Make it Public (required for GitHub Pages)
5. Click "Create repository"
6. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/website-builder.git
   git push -u origin main
   ```

---

## 🌐 Step 2: Deploy Frontend to GitHub Pages

### Method 1: Using GitHub Actions (Automatic)

Create `.github/workflows/deploy-frontend.yml`:
```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: client/package-lock.json
    
    - name: Install Dependencies
      run: |
        cd client
        npm ci
    
    - name: Build Frontend
      run: |
        cd client
        npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./client/dist
```

### Method 2: Manual Deployment

```bash
# Install gh-pages globally
npm install -g gh-pages

# Build frontend
cd client
npm ci
npm run build

# Deploy to GitHub Pages
gh-pages -d dist

# Or use the automatic method above
```

### Enable GitHub Pages
1. Go to your GitHub repository
2. Click "Settings"
3. Scroll down to "Pages"
4. Source: "Deploy from a branch"
5. Branch: "gh-pages"
6. Folder: "/(root)"
7. Click "Save"

Your frontend will be live at: `https://yourusername.github.io/website-builder`

---

## ⚙️ Step 3: Prepare Backend for Vercel

### Create Vercel Configuration

Create `server/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/dist/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/server.js"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "REDIS_URL": "@redis_url",
    "AI_API_KEY": "@ai_api_key",
    "BETTER_AUTH_SECRET": "@better_auth_secret",
    "BETTER_AUTH_URL": "@better_auth_url",
    "TRUSTED_ORIGINS": "@trusted_origins",
    "NODE_ENV": "production"
  },
  "functions": {
    "dist/server.js": {
      "maxDuration": 10
    }
  }
}
```

### Update Backend for Serverless

Create `server/api/index.js`:
```javascript
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Your registration logic here
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project routes
app.post('/api/projects', async (req, res) => {
  try {
    const { name, userId } = req.body;
    // Your project creation logic here
    res.json({ message: 'Project created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Generation
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    // Your AI generation logic here
    res.json({ 
      html: '<html><body><h1>Generated Website</h1></body></html>',
      message: 'Website generated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
```

---

## 🚀 Step 4: Deploy Backend to Vercel

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy to Vercel
```bash
cd server
vercel --prod
```

### Follow Vercel Prompts:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Your personal account
3. **Link to existing project?** → No
4. **Project name?** → website-builder-api
5. **Directory?** → ./
6. **Override settings?** → Yes

### Add Environment Variables in Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Open your project
3. Go to "Settings" → "Environment Variables"
4. Add these variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
   REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]
   AI_API_KEY=sk-or-v1-your-api-key
   BETTER_AUTH_SECRET=7fNv0oXPNSSa69BMPQLGF2Q3GIHWvvek
   BETTER_AUTH_URL=https://your-app.vercel.app
   TRUSTED_ORIGINS=https://yourusername.github.io,https://your-app.vercel.app
   NODE_ENV=production
   ```

---

## 🗄️ Step 5: Set Up Free Database (Supabase)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Click "New Project"
4. Choose organization
5. Set project name: `website-builder-db`
6. Set database password
7. Choose region
8. Click "Create new project"

### Get Database URL
1. Go to your project in Supabase
2. Click "Settings" → "Database"
3. Copy the "Connection string"
4. Replace `[YOUR-PASSWORD]` with your password

### Run Database Migrations
1. Go to Supabase "SQL Editor"
2. Run this SQL:
```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    credits INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create versions table
CREATE TABLE versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    html_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_versions_project_id ON versions(project_id);
```

---

## 🔗 Step 6: Connect Frontend to Backend

### Update Frontend API Configuration

Create `client/src/api/config.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app/api' 
  : 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  PROJECTS: {
    CREATE: `${API_BASE_URL}/projects`,
    GET: `${API_BASE_URL}/projects`,
    UPDATE: (id) => `${API_BASE_URL}/projects/${id}`,
    DELETE: (id) => `${API_BASE_URL}/projects/${id}`,
  },
  GENERATE: `${API_BASE_URL}/generate`,
};
```

### Update Frontend Environment

Create `client/.env.production`:
```env
VITE_API_URL=https://your-app.vercel.app/api
VITE_BASE_URL=https://yourusername.github.io/website-builder
```

---

## 🌐 Step 7: Set Up Custom Domain (Optional)

### Get Free Domain from Cloudflare
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for free account
3. Get free subdomain or use your own domain

### Configure DNS
```
# Frontend (GitHub Pages)
CNAME @ → yourusername.github.io

# Backend (Vercel)
CNAME api → your-app.vercel.app
```

### Update Vercel Domain
1. Go to Vercel project settings
2. Add your custom domain
3. Verify DNS configuration

### Update GitHub Pages
1. Go to repository settings
2. Under "Pages", add your custom domain
3. Verify DNS configuration

---

## 🚀 Step 8: Test Your Deployment

### Test Frontend
1. Go to `https://yourusername.github.io/website-builder`
2. Test all pages load correctly
3. Test navigation and forms

### Test Backend
1. Go to `https://your-app.vercel.app/api/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### Test Integration
1. Test user registration
2. Test website generation
3. Test project saving

---

## 📊 Your Live URLs

After deployment:
- **Frontend**: `https://yourusername.github.io/website-builder`
- **Backend API**: `https://your-app.vercel.app/api`
- **Custom Domain**: `https://your-domain.com` (if configured)

---

## 🔧 Management Commands

### Update Frontend
```bash
cd client
npm run build
gh-pages -d dist
# GitHub Actions will auto-deploy
```

### Update Backend
```bash
cd server
npm run build
vercel --prod
```

### View Logs
```bash
# Vercel logs
vercel logs

# GitHub Actions logs
# Go to repository → Actions
```

---

## 🎉 Success! Your App is Live!

### What You Have:
- ✅ **Professional deployment**
- ✅ **Unlimited bandwidth** (GitHub Pages)
- ✅ **100k API calls/month** (Vercel)
- ✅ **500MB database** (Supabase)
- ✅ **Custom domain support**
- ✅ **SSL certificates**
- ✅ **CI/CD automation**

### Total Cost: **$0 forever**

---

## 🆘 Troubleshooting

### Common Issues:
1. **Frontend not updating**: Clear browser cache, check GitHub Actions
2. **Backend errors**: Check Vercel logs, verify environment variables
3. **Database connection**: Verify Supabase URL, check network access
4. **CORS errors**: Update TRUSTED_ORIGINS environment variable

### Get Help:
- **GitHub Pages**: [docs.github.com/en/pages](https://docs.github.com/en/pages)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

---

## 🚀 Ready to Go Live!

**Your professional website builder is now deployed and accessible worldwide!** 🎊✨

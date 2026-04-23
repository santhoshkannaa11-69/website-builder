#!/bin/bash

# Website Builder Deployment Script
# This script prepares your project for deployment to Railway

echo "🚀 Starting Website Builder Deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Website Builder project"
    
    echo "🔗 Please create a GitHub repository and add it as remote:"
    echo "   git remote add origin https://github.com/yourusername/website-builder.git"
    echo "   git push -u origin main"
    echo ""
    echo "⚠️  After adding remote, run this script again."
    exit 1
fi

# Check current branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "🌿 Switching to main branch..."
    git checkout main
fi

# Stage all changes
echo "📋 Staging changes..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "✅ No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Production ready: Updated for Railway deployment"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://railway.app"
echo "2. Sign up with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select your website-builder repository"
echo "5. Configure environment variables (see .env.production)"
echo "6. Deploy! 🚀"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 Your app will be available at: https://your-app-name.railway.app"

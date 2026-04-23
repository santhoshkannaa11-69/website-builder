# Website Builder Setup Guide

## Quick Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

#### AI API Key (Most Important for Website Generation)
- Get an API key from [OpenRouter](https://openrouter.ai/keys)
- Add it to `.env`: `AI_API_KEY="sk-or-v1-..."`

#### Database Setup
- Option A: Use PostgreSQL locally
- Option B: Use a cloud PostgreSQL service (Supabase, Neon, etc.)
- Add connection string: `DATABASE_URL="postgresql://..."`

#### Authentication
- Generate a random secret: `BETTER_AUTH_SECRET="your-random-secret"`
- Set the auth URL: `BETTER_AUTH_URL="http://localhost:3000"`

#### Stripe (Optional - for payments)
- Get Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/)
- Add: `STRIPE_SECRET_KEY="sk_test_..."`

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with test data
npx prisma db seed
```

### 4. Start Development Servers
```bash
# Terminal 1: Start server
cd server
npm run server

# Terminal 2: Start client
cd client
npm run dev
```

## Troubleshooting

### "Website creation not working" - Most Common Causes:

1. **Missing AI_API_KEY** - Website generation requires AI
2. **Database not connected** - Projects can't be saved
3. **Credits issue** - User needs at least 5 credits

### Testing the Fix:
1. Sign up/login to get credits
2. Enter a website prompt (e.g., "Create a portfolio website")
3. Click "Create with AI"
4. Check browser console and server logs for errors

### Default Credits for Testing:
If needed, you can manually add credits in the database:
```sql
UPDATE "User" SET credits = 50 WHERE email = "your-email@example.com";
```

## Features Working After Setup:
- AI Website Generation
- Project Revisions
- Version History
- Project Publishing
- Credit System
- Payment Integration (with Stripe)

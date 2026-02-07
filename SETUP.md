# Job Tracker - Local Setup Guide

This guide will help you get the Job Tracker application running locally in under 10 minutes.

---

## Quick Start (3 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

**Option A: Using Supabase (Recommended - Already Configured)**

1. Get your Supabase database password from:
   - Dashboard: https://supabase.com/dashboard/project/yewtpupxbsgfdswjtyxy/settings/database
   - Look for "Database password" section

2. Open `.env` and replace `[YOUR-DB-PASSWORD]` with your actual password:

```bash
DATABASE_URL="postgresql://postgres.yewtpupxbsgfdswjtyxy:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Option B: Using Local PostgreSQL**

1. Install PostgreSQL on your machine:
   - Mac: `brew install postgresql@14` then `brew services start postgresql@14`
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. Create a database:
```bash
createdb jobtracker
```

3. Update `.env`:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobtracker?schema=public"
```

### 3. Run Migrations & Start

```bash
# Apply database migrations
npm run prisma:migrate:deploy

# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser!

---

## First-Time Usage

### Create Your Account

**Option 1: Demo Account (Instant Access)**
1. Go to http://localhost:3000/signin
2. Click "Demo Account" button
3. Automatically creates account + sample data

**Option 2: Create Your Own Account**
1. Go to http://localhost:3000/signup
2. Enter email + password
3. Click "Sign up"

### Try Core Features

**Import Jobs:**
1. Go to `/jobs` page
2. Click "Import from Remotive"
3. See 20+ remote jobs appear

**Track a Job:**
1. Click "Track" on any job
2. Go to `/applications` page
3. See job in "Interested" column

**Move Through Pipeline:**
1. Drag job card from "Interested" to "Applied"
2. Click on the card to see details
3. Set a follow-up date

**Add Your Skills:**
1. Go to `/profile` page
2. Add skills: TypeScript, React, Node.js, etc.
3. Go back to `/jobs`
4. Click "Score All Jobs"
5. Wait 10-30 seconds → Match scores appear

---

## Environment Variables Reference

### Required

```bash
# Database connection (choose one option above)
DATABASE_URL="postgresql://..."

# Auth.js session security (already generated for you)
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

### Optional Features

```bash
# Google OAuth (for Gmail integration)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# OpenAI (for AI writing + match scoring)
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"

# SerpAPI (for broader job search)
SERPAPI_API_KEY="your-serpapi-key"

# Demo mode (enabled by default)
ALLOW_DEV_LOGIN="true"
ALLOW_DEMO_LOGIN="true"
```

---

## Troubleshooting

### Issue: `npm install` fails

**Solution:**
- Make sure you have Node.js v18.17 or higher: `node --version`
- Update npm: `npm install -g npm@latest`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: Database migration fails

**Error:** `P1001: Can't reach database server`

**Solution:**
1. Check that your `DATABASE_URL` is correct
2. For Supabase: Verify password is correct
3. For local Postgres: Make sure PostgreSQL is running:
   ```bash
   # Mac
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Issue: "Unauthorized" when accessing pages

**Solution:**
- Sign out and sign back in
- Clear browser cookies for `localhost:3000`
- Check that `AUTH_SECRET` is set in `.env`

### Issue: AI features not working

**Solution:**
- Make sure `OPENAI_API_KEY` is set in `.env`
- Verify key is valid: https://platform.openai.com/api-keys
- Check you have API credits remaining

---

## Database Management

### View Database Contents

```bash
npm run prisma:studio
```

Opens a web UI at http://localhost:5555 to browse/edit data.

### Reset Database

```bash
# Warning: This deletes all data!
npx prisma migrate reset

# Then re-run migrations
npm run prisma:migrate:deploy
```

### Create New Migration

```bash
# After changing prisma/schema.prisma
npm run prisma:migrate
```

### Generate Prisma Client

```bash
# Automatically runs on `npm install` and `npm run build`
# To run manually:
npm run prisma:generate
```

---

## Production Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

```bash
# Use production database URL
DATABASE_URL="postgresql://..."

# Set production URL
AUTH_URL="https://yourdomain.com"

# Generate new secret for production
AUTH_SECRET="$(openssl rand -hex 32)"

# Optional: Set NODE_ENV
NODE_ENV="production"
```

### Hosting Recommendations

**Recommended Platforms:**
- Railway (easiest - auto-detects Next.js + Postgres)
- Vercel + Supabase
- Render
- Fly.io

**Database Hosting:**
- Supabase (already configured)
- Railway Postgres
- Render Postgres
- Neon.tech

---

## Next Steps

### Explore Features

- **Jobs:** Import, filter, score matches
- **Applications:** Kanban board, follow-up reminders
- **Profile:** Add skills, set preferences
- **Network:** Import contacts, track hiring signals
- **Outreach:** AI-powered email drafts
- **Settings:** Export/import your data

### Optional Integrations

**Google OAuth (Gmail Integration):**
1. Create OAuth client: https://console.cloud.google.com/apis/credentials
2. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Enable Gmail API: https://console.cloud.google.com/apis/library/gmail.googleapis.com
4. Add credentials to `.env`:
   ```bash
   AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
   AUTH_GOOGLE_SECRET="your-client-secret"
   ```

**OpenAI (AI Features):**
1. Create API key: https://platform.openai.com/api-keys
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY="sk-..."
   ```

**SerpAPI (Job Search):**
1. Create account: https://serpapi.com/
2. Get API key from dashboard
3. Add to `.env`:
   ```bash
   SERPAPI_API_KEY="your-key"
   ```

---

## Getting Help

**Check the Audit Report:**
- See `AUDIT_FINDINGS.md` for comprehensive system documentation

**Common Issues:**
- Database connection: Check `DATABASE_URL` format
- Auth issues: Regenerate `AUTH_SECRET`
- Build errors: Delete `.next` folder and rebuild

**Contact:**
- GitHub Issues: (your repo URL)
- Email: (your contact)

---

**Ready to start?** Run `npm run dev` and open http://localhost:3000!

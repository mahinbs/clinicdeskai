# Supabase Deployment Guide

## 🚨 IMPORTANT: This is a Serverless Backend

- **No traditional backend server**
- **Everything runs on Supabase** (PostgreSQL + Edge Functions)
- **Frontend only needs**: ANON_KEY (safe to expose)
- **SERVICE_ROLE_KEY**: NEVER goes in frontend! Only in Edge Functions

---

## 🎯 Deployment Methods

### Method 1: Supabase Dashboard (Easiest - No CLI needed)

#### Step 1: Create Tables & RLS

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** → Click **"New Query"**
4. Copy and paste each migration file **in order**:

   **Migration 1: Database Schema**
   - Copy contents of `supabase/migrations/20260213000000_initial_schema.sql`
   - Paste in SQL Editor
   - Click **"Run"**

   **Migration 2: RLS Policies**
   - Copy contents of `supabase/migrations/20260213000001_rls_policies.sql`
   - Paste in SQL Editor
   - Click **"Run"**

   **Migration 3: Storage Setup**
   - Copy contents of `supabase/migrations/20260213000002_storage_setup.sql`
   - Paste in SQL Editor
   - Click **"Run"**

   **Migration 4: Utility Functions**
   - Copy contents of `supabase/migrations/20260213000003_utility_functions.sql`
   - Paste in SQL Editor
   - Click **"Run"**

5. Verify tables created:
   - Go to **Table Editor**
   - You should see: clinics, users, patients, appointments, etc.

#### Step 2: Deploy Edge Functions

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find project ref in Dashboard → Settings → General)

4. Deploy functions:
   ```bash
   # Deploy all 3 functions
   supabase functions deploy create-user
   supabase functions deploy send-appointment-reminder
   supabase functions deploy send-billing-message
   ```

#### Step 3: Set Edge Function Secrets

**Option A: Via Dashboard**
1. Go to **Edge Functions** → **Secrets**
2. Add these secrets:
   - `RESEND_API_KEY` = your_resend_key
   - `WHATSAPP_API_URL` = your_whatsapp_url
   - `WHATSAPP_API_TOKEN` = your_whatsapp_token

**Option B: Via CLI**
```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set WHATSAPP_API_URL=https://api.whatsapp.com/xxx
supabase secrets set WHATSAPP_API_TOKEN=your_token
```

#### Step 4: Setup Cron Job (Appointment Reminders)

1. Go to **SQL Editor** → New Query
2. Run this:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule appointment reminders every hour
SELECT cron.schedule(
  'appointment-reminders',
  '0 * * * *', -- Every hour at :00
  $$
  SELECT net.http_post(
    url := 'https://qzmieigkwetmqkfkbmdl.supabase.co/functions/v1/send-appointment-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bWllaWdrd2V0bXFrZmtibWRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk2NTUwNSwiZXhwIjoyMDg2NTQxNTA1fQ.AmAPuyGSZFxMV3XTUBra7ys2rTPz2rEvvzGFZVGIlDI',
      'Content-Type', 'application/json'
    )
  );
  $$
);

-- Verify cron job created
SELECT * FROM cron.job;
```

---

### Method 2: Via CLI (For Developers)

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push all migrations at once
supabase db push

# Deploy functions
supabase functions deploy

# Set secrets
supabase secrets set RESEND_API_KEY=xxx
supabase secrets set WHATSAPP_API_URL=xxx
supabase secrets set WHATSAPP_API_TOKEN=xxx
```

---

## 🔒 Security Setup

### Frontend Environment Variables

**`.env` (Frontend - Safe)**
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=http://localhost:5173
```

**What's Safe:**
- ✅ ANON_KEY - Only works with RLS enabled (users can only see their own data)
- ✅ Project URL - Public information

**What's DANGEROUS:**
- ❌ SERVICE_ROLE_KEY - Bypasses RLS, gives full database access!
- ❌ API keys (Resend, WhatsApp) - Can be abused

### Edge Function Secrets (Backend - Secure)

These are **ONLY accessible to Edge Functions**, never exposed to frontend:
- `RESEND_API_KEY`
- `WHATSAPP_API_URL`
- `WHATSAPP_API_TOKEN`

**Set in Supabase Dashboard or via CLI, never in `.env`!**

---

## 🎯 Create Master Admin

### Step 1: Create Auth User

1. Go to **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - Email: `admin@clinicdesk.ai`
   - Password: (choose strong password)
   - Auto Confirm: ✅ **YES**
4. Click **"Create User"**
5. **Copy the User ID** from the users list

### Step 2: Add to Users Table

1. Go to **SQL Editor** → New Query
2. Run:

```sql
INSERT INTO users (
  id,
  role,
  full_name,
  email,
  is_temp_password,
  status
) VALUES (
  'paste-user-id-here', -- Replace with actual user ID
  'master_admin',
  'Master Admin',
  'admin@clinicdesk.ai',
  false,
  'active'
);
```

---

## ✅ Verify Deployment

### Check Tables
```sql
-- Should return all 10 tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check RLS
```sql
-- Should show policies for each table
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Storage Buckets
1. Go to **Storage**
2. Should see 3 buckets:
   - `clinic-logos` (public)
   - `prescriptions` (private)
   - `patient-reports` (private)

### Check Edge Functions
1. Go to **Edge Functions**
2. Should see 3 functions:
   - `create-user`
   - `send-appointment-reminder`
   - `send-billing-message`

### Test Login
1. Run frontend: `npm run dev`
2. Login with master admin credentials
3. Should see dashboard (if UI built)

---

## 🐛 Common Issues

### Issue: Migrations fail

**Solution**: Run migrations in order, one at a time. Check error messages.

### Issue: Edge Functions fail to deploy

**Solution**: 
```bash
# Make sure you're linked
supabase link --project-ref your-ref

# Deploy individually
supabase functions deploy create-user --project-ref your-ref
```

### Issue: Cron job not running

**Solution**: 
1. Check if `pg_cron` is enabled
2. Verify `net` extension is enabled (for http_post)
3. Check Edge Function URL is correct

### Issue: RLS blocks everything

**Solution**: Make sure you:
1. Created user in Auth
2. Added user to `users` table with correct role
3. User status is `active`
4. Clinic status is `active` (for non-master-admin)

---

## 📊 Monitor Your Backend

### Database
- **Table Editor**: View/edit data
- **SQL Editor**: Run queries
- **Logs**: See query logs

### Edge Functions
- **Logs**: See function invocations and errors
- **Metrics**: See request counts and response times

### Authentication
- **Users**: Manage users
- **Policies**: View/edit RLS policies

### Storage
- **Buckets**: View uploaded files
- **Policies**: View/edit storage RLS

---

## 🚀 Deploy Frontend

Once backend is ready:

```bash
# Build frontend
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

**Set environment variables in hosting platform:**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=https://yourdomain.com
```

---

## 📝 Summary

### What Goes Where:

| Secret | Location | Why |
|--------|----------|-----|
| ANON_KEY | Frontend `.env` (VITE_) | Safe - RLS protects data |
| SERVICE_ROLE_KEY | Supabase Secrets ONLY | Bypasses RLS - dangerous! |
| RESEND_API_KEY | Supabase Secrets | Should not be public |
| WHATSAPP_TOKEN | Supabase Secrets | Should not be public |
| Project URL | Frontend `.env` (VITE_) | Public information |

### Deployment Checklist:

- [ ] Create Supabase project
- [ ] Run 4 migration files in SQL Editor
- [ ] Deploy 3 Edge Functions via CLI
- [ ] Set 3 secrets in Supabase Dashboard
- [ ] Create cron job for reminders
- [ ] Create Master Admin user
- [ ] Test login
- [ ] Build and deploy frontend

---

**Your backend is 100% serverless on Supabase! No traditional server needed! 🚀**

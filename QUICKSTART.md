# ClinicDesk AI - Quick Start Guide

Get up and running in 15 minutes! ⚡

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Supabase account ([sign up free](https://supabase.com))
- ✅ Git installed

## Step 1: Clone and Install (2 min)

```bash
cd clinicdeskai
npm install
```

## Step 2: Create Supabase Project (3 min)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - Name: `clinicdesk-ai`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait for project to be ready (~2 min)

## Step 3: Get Your Credentials (1 min)

In your Supabase project:

1. Go to **Settings** → **API**
2. Copy these values:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

## Step 4: Configure Environment (1 min)

Update `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 5: Setup Database (3 min)

### Option A: Using Supabase CLI (Recommended)

```bash
# Install CLI globally
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations (this creates all tables, RLS, functions)
supabase db push
```

### Option B: Manual (if CLI doesn't work)

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy-paste each migration file in order:
   - `supabase/migrations/20260213000000_initial_schema.sql`
   - `supabase/migrations/20260213000001_rls_policies.sql`
   - `supabase/migrations/20260213000002_storage_setup.sql`
   - `supabase/migrations/20260213000003_utility_functions.sql`
4. Click "Run" for each file

## Step 6: Create Master Admin (2 min)

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click "Add User" → "Create new user"
3. Fill in:
   - Email: `admin@clinicdesk.ai` (or your email)
   - Password: (choose a strong password)
   - Auto Confirm: ✅ Yes
4. Click "Create User"
5. **Copy the User ID** (you'll need it)

6. Go to **SQL Editor** and run:

```sql
INSERT INTO users (
  id,
  role,
  full_name,
  email,
  is_temp_password,
  status
) VALUES (
  'paste-the-user-id-here',
  'master_admin',
  'Master Admin',
  'admin@clinicdesk.ai',
  false,
  'active'
);
```

## Step 7: Start Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 8: Test Login (1 min)

Login with:
- Email: `admin@clinicdesk.ai`
- Password: (the one you set)

You should see the Master Admin dashboard!

---

## 🎉 You're Ready!

### What You Can Do Now:

1. **Create a Test Clinic**
   - As Master Admin, create a new clinic
   - Upload a logo
   - Set theme colors

2. **Create a Clinic Admin**
   - Add a clinic admin for your test clinic
   - Check email for credentials (if Resend configured)
   - Login as clinic admin

3. **Create Staff**
   - As Clinic Admin, create a doctor
   - Create a receptionist
   - Test their logins

4. **Add Patients**
   - Login as Receptionist
   - Add test patients
   - Note the auto-generated Patient ID

5. **Book Appointments**
   - Set doctor's schedule first
   - Book appointments for patients
   - View as doctor

---

## 📚 Next Steps

### To Enable Full Functionality:

#### 1. Email Notifications (Resend)
```bash
# Sign up at resend.com
# Add your API key to .env:
RESEND_API_KEY=re_xxxxx

# Deploy edge function
supabase functions deploy create-user
supabase secrets set RESEND_API_KEY=re_xxxxx
```

#### 2. WhatsApp Notifications
```bash
# Get WhatsApp Business API credentials
# Add to .env:
WHATSAPP_API_URL=your_url
WHATSAPP_API_TOKEN=your_token

# Deploy functions
supabase functions deploy send-appointment-reminder
supabase functions deploy send-billing-message

# Set secrets
supabase secrets set WHATSAPP_API_URL=your_url
supabase secrets set WHATSAPP_API_TOKEN=your_token
```

#### 3. Set Up Cron Job (for reminders)
Run in Supabase SQL Editor:

```sql
SELECT cron.schedule(
  'appointment-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-appointment-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

---

## 🐛 Troubleshooting

### Can't login?
- Check if user exists in Auth → Users
- Verify user has entry in `users` table
- Check `status = 'active'`

### RLS errors?
- Make sure migrations ran successfully
- Check user has correct role in `users` table
- Verify clinic is `active` if not master admin

### Functions not working?
- Deploy functions: `supabase functions deploy function-name`
- Check function logs in Supabase Dashboard
- Verify secrets are set

### Need help?
- Check [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed setup
- Review [API_REFERENCE.md](./API_REFERENCE.md) for API docs
- Check Supabase Dashboard → Logs for errors

---

## 🔥 Pro Tips

1. **Use PostgreSQL client** for easier database management
   ```bash
   psql -h db.your-project.supabase.co -U postgres
   ```

2. **Enable real-time** for live updates in dashboard

3. **Test RLS policies** before production:
   ```sql
   SET LOCAL role = 'authenticated';
   SET LOCAL request.jwt.claim.sub = 'user-id';
   SELECT * FROM patients; -- Should only show user's clinic
   ```

4. **Monitor usage** in Supabase Dashboard to stay within free tier

5. **Backup regularly**:
   ```bash
   supabase db dump -f backup.sql
   ```

---

## 📖 Documentation

- **[Backend Setup](./BACKEND_SETUP.md)** - Complete backend guide
- **[API Reference](./API_REFERENCE.md)** - All APIs documented
- **[Deployment](./DEPLOYMENT.md)** - Production deployment
- **[System Prompt](./systemprompt.md)** - System specifications

---

**Ready to build something awesome? Let's go! 🚀**

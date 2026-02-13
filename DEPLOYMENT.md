# ClinicDesk AI - Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Environment Setup

- [ ] Supabase project created
- [ ] All environment variables configured in `.env`
- [ ] Resend API key obtained and configured
- [ ] WhatsApp Business API credentials obtained
- [ ] Production database URL and keys obtained

### 2. Database Setup

- [ ] All migrations run successfully
  - [ ] `20260213000000_initial_schema.sql` - Database schema
  - [ ] `20260213000001_rls_policies.sql` - RLS policies
  - [ ] `20260213000002_storage_setup.sql` - Storage buckets
  - [ ] `20260213000003_utility_functions.sql` - Utility functions

- [ ] Master Admin user created
- [ ] Test clinic created
- [ ] Test users created for each role

### 3. Storage Setup

- [ ] Storage buckets created:
  - [ ] `clinic-logos` (public)
  - [ ] `prescriptions` (private)
  - [ ] `patient-reports` (private)

- [ ] Storage RLS policies verified
- [ ] Test file upload/download working

### 4. Edge Functions

- [ ] All Edge Functions deployed:
  - [ ] `create-user`
  - [ ] `send-appointment-reminder`
  - [ ] `send-billing-message`

- [ ] Edge Function secrets configured:
  - [ ] `RESEND_API_KEY`
  - [ ] `WHATSAPP_API_URL`
  - [ ] `WHATSAPP_API_TOKEN`

- [ ] Edge Functions tested

### 5. Cron Jobs

- [ ] `pg_cron` extension enabled
- [ ] Appointment reminder cron job created
- [ ] Cron job tested and verified

### 6. Frontend Setup

- [ ] Supabase client configured
- [ ] All utility files created
- [ ] Environment variables properly prefixed with `VITE_`
- [ ] Build successful with no errors

### 7. Security Verification

- [ ] RLS policies tested for all roles
- [ ] Multi-tenant isolation verified
- [ ] Suspension logic tested (user and clinic level)
- [ ] Password reset flow tested
- [ ] Temporary password flow tested

### 8. Testing

- [ ] Master Admin flow tested
- [ ] Clinic Admin flow tested
- [ ] Doctor flow tested
- [ ] Receptionist flow tested
- [ ] Patient creation and search tested
- [ ] Appointment booking tested
- [ ] Prescription creation tested
- [ ] Billing creation tested
- [ ] WhatsApp notifications tested
- [ ] File upload/download tested

---

## 🚀 Deployment Steps

### Step 1: Setup Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

### Step 2: Push Database Migrations

```bash
# Push all migrations
supabase db push

# Verify migrations
supabase db diff
```

### Step 3: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy create-user
supabase functions deploy send-appointment-reminder
supabase functions deploy send-billing-message

# Set secrets
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set WHATSAPP_API_URL=your_url
supabase secrets set WHATSAPP_API_TOKEN=your_token
```

### Step 4: Setup Cron Jobs

Run this in Supabase SQL Editor:

```sql
-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule appointment reminders (runs every hour)
SELECT cron.schedule(
  'appointment-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/send-appointment-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);

-- Verify cron job
SELECT * FROM cron.job;
```

### Step 5: Create Master Admin

1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user with email and password
3. Copy the user ID
4. Run in SQL Editor:

```sql
INSERT INTO users (
  id,
  role,
  full_name,
  email,
  is_temp_password,
  status
) VALUES (
  'paste-user-id-here',
  'master_admin',
  'Master Admin',
  'admin@clinicdesk.ai',
  false,
  'active'
);
```

### Step 6: Build and Deploy Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel (or your hosting platform)
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

### Step 7: Configure Production Environment Variables

In your hosting platform (Vercel/Netlify), set:

```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_URL=your_production_app_url
```

---

## 🧪 Post-Deployment Testing

### 1. Authentication Tests

- [ ] Master Admin can login
- [ ] Master Admin can create Clinic Admin
- [ ] Clinic Admin receives email with credentials
- [ ] Clinic Admin can login with temp password
- [ ] Clinic Admin must change password on first login
- [ ] Password reset flow works

### 2. Multi-tenant Tests

- [ ] Create two test clinics
- [ ] Create users in each clinic
- [ ] Verify Clinic A cannot see Clinic B's data
- [ ] Verify RLS is enforcing isolation

### 3. Suspension Tests

- [ ] Master Admin can suspend a clinic
- [ ] All users in suspended clinic cannot login
- [ ] Clinic Admin can suspend a doctor
- [ ] Suspended doctor cannot login

### 4. Workflow Tests

- [ ] Complete patient registration flow
- [ ] Book appointment with available slot check
- [ ] Doctor marks appointment as completed
- [ ] Create prescription
- [ ] Generate bill
- [ ] WhatsApp invoice sent
- [ ] Dashboard stats update correctly

### 5. Performance Tests

- [ ] Test with 100+ patients
- [ ] Test with 50+ appointments per day
- [ ] Test with 20+ concurrent users
- [ ] Monitor query performance
- [ ] Check Edge Function response times

---

## 📊 Monitoring Setup

### 1. Supabase Dashboard

Monitor:
- Database connections
- API requests
- Storage usage
- Edge Function invocations
- Error logs

### 2. Set Up Alerts

Configure alerts for:
- Database connection limit
- Storage limit approaching
- Edge Function errors
- Failed cron jobs

### 3. Application Monitoring

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Analytics (Google Analytics, Mixpanel)

---

## 🔄 Backup Strategy

### Automated Backups

Supabase provides:
- Daily automated backups (Pro plan)
- Point-in-time recovery (Enterprise plan)

### Manual Backup

```bash
# Backup database
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Backup with Supabase CLI
supabase db dump -f backup.sql
```

### Restore from Backup

```bash
# Restore database
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## 🔐 Security Hardening

### 1. Enable Additional Security

- [ ] Enable 2FA for Supabase dashboard
- [ ] Restrict database access to specific IPs
- [ ] Review and minimize service role key usage
- [ ] Enable audit logging

### 2. Review RLS Policies

```sql
-- Test RLS for each role
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claim.sub = 'user-uuid';

-- Should return only user's clinic data
SELECT * FROM patients;
```

### 3. Monitor Suspicious Activity

- [ ] Set up alerts for multiple failed login attempts
- [ ] Monitor for unusual data access patterns
- [ ] Track admin actions in audit logs

---

## 📈 Scaling Considerations

### Database Optimization

- [ ] Add indexes for frequently queried columns
- [ ] Enable connection pooling
- [ ] Monitor slow queries
- [ ] Consider read replicas for heavy read loads

### Edge Function Optimization

- [ ] Implement caching where appropriate
- [ ] Optimize database queries in functions
- [ ] Consider implementing rate limiting

### Storage Optimization

- [ ] Implement image compression
- [ ] Set up CDN for public assets
- [ ] Archive old reports to cheaper storage

---

## 🆘 Troubleshooting

### Common Issues

1. **RLS blocking queries**
   - Verify user is authenticated
   - Check user has correct role in users table
   - Review RLS policies

2. **Edge function timeout**
   - Optimize database queries
   - Increase timeout in function config
   - Consider breaking into smaller functions

3. **Storage upload fails**
   - Check bucket policies
   - Verify file size limits
   - Check MIME type restrictions

4. **Cron job not running**
   - Verify pg_cron is enabled
   - Check cron.job_run_details for errors
   - Verify Edge Function URL is correct

### Getting Help

- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- GitHub Issues: Create issues in your repository

---

## ✅ Final Checklist

Before going live:

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Security hardening complete
- [ ] Master Admin credentials secured
- [ ] Support team trained
- [ ] Disaster recovery plan documented

---

## 🎉 Launch!

Once all checklist items are complete:

1. Announce to stakeholders
2. Monitor closely for first 24-48 hours
3. Be ready to respond to issues quickly
4. Gather user feedback
5. Plan improvements based on real usage

**Congratulations on deploying ClinicDesk AI!** 🚀

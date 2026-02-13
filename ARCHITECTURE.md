# ClinicDesk AI - Serverless Architecture

## 🏗️ Architecture Overview

**This is a 100% SERVERLESS application. There is NO traditional backend server!**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Browser (Client-side only)                          │   │
│  │  - React UI                                          │   │
│  │  - Supabase JS Client                                │   │
│  │  - ANON_KEY only (safe, RLS-protected)              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS (RLS + Auth)
                         │
┌────────────────────────▼─────────────────────────────────────┐
│              SUPABASE (Serverless Backend)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                   │ │
│  │  • Row Level Security (RLS) - Multi-tenant isolation   │ │
│  │  • Tables: clinics, users, patients, appointments...   │ │
│  │  • Database Functions: suspend_user(), get_stats()...  │ │
│  │  • Triggers: auto-generate IDs, timestamps            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication                                         │ │
│  │  • JWT tokens                                          │ │
│  │  • Session management                                  │ │
│  │  • Password reset                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Storage (S3-compatible)                               │ │
│  │  • clinic-logos (public)                               │ │
│  │  • prescriptions (private, RLS)                        │ │
│  │  • patient-reports (private, RLS)                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Edge Functions (Deno Runtime)                         │ │
│  │  • create-user                                         │ │
│  │  • send-appointment-reminder                           │ │
│  │  • send-billing-message                                │ │
│  │  • Has SERVICE_ROLE_KEY (server-side only!)           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Cron Jobs (pg_cron)                                   │ │
│  │  • Hourly appointment reminders                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ External APIs
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  Resend  │   │ WhatsApp │   │  Email   │
   │   API    │   │ Business │   │  Client  │
   └──────────┘   └──────────┘   └──────────┘
```

---

## 🔐 Security Model

### Frontend (Public)
```javascript
// .env (Safe to expose)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... // Public key - RLS protects data
```

**What ANON_KEY Can Do:**
- ✅ Create authenticated sessions
- ✅ Query tables (but RLS filters data automatically)
- ✅ Upload files (but RLS restricts access)
- ❌ **CANNOT** bypass RLS
- ❌ **CANNOT** access other clinic's data
- ❌ **CANNOT** perform admin operations

### Backend (Secure - Edge Functions Only)
```javascript
// Supabase Secrets (Never exposed to frontend)
SERVICE_ROLE_KEY=eyJ... // Full database access - bypasses RLS!
RESEND_API_KEY=re_xxx
WHATSAPP_API_TOKEN=xxx
```

**What SERVICE_ROLE_KEY Can Do:**
- ✅ Bypass RLS (for admin operations)
- ✅ Create users in Supabase Auth
- ✅ Access any data in any table
- ⚠️ **DANGEROUS** if exposed to frontend!

---

## 🛡️ How Multi-Tenant Isolation Works

### Row Level Security (RLS)

Every table has policies like:

```sql
-- Example: Patients table
CREATE POLICY "Users can only see patients in their clinic"
ON patients FOR SELECT
USING (
  clinic_id = auth.user_clinic_id()  -- Automatic filtering!
);
```

**What This Means:**
1. User logs in → JWT token contains user ID
2. User queries `SELECT * FROM patients`
3. PostgreSQL automatically adds `WHERE clinic_id = 'user-clinic-id'`
4. User ONLY sees their clinic's patients
5. **No way to bypass this from frontend!**

### Why This is Secure:

- ✅ Database-level isolation (not just frontend)
- ✅ Impossible to bypass with API calls
- ✅ Works even if someone inspects network traffic
- ✅ Each clinic's data is completely isolated

---

## 📡 Data Flow Examples

### Example 1: Receptionist Books Appointment

```
1. Receptionist (Frontend)
   ↓
2. supabase.from('appointments').insert({...})
   ↓
3. ANON_KEY + JWT token sent to Supabase
   ↓
4. Supabase Auth validates JWT
   ↓
5. RLS checks: user.clinic_id matches appointment.clinic_id?
   ↓
6. If YES: Insert succeeds
   If NO: Insert blocked (403 Forbidden)
```

### Example 2: Master Admin Creates Clinic Admin

```
1. Master Admin (Frontend)
   ↓
2. supabase.functions.invoke('create-user', {...})
   ↓
3. Edge Function receives request
   ↓
4. Edge Function uses SERVICE_ROLE_KEY
   ↓
5. Creates user in Supabase Auth (bypasses RLS)
   ↓
6. Inserts into users table
   ↓
7. Sends email via Resend API
   ↓
8. Returns temp password to frontend
```

### Example 3: Automatic Appointment Reminder

```
1. Cron job triggers every hour
   ↓
2. Calls Edge Function with SERVICE_ROLE_KEY
   ↓
3. Edge Function queries appointments (no RLS filtering)
   ↓
4. Finds appointments 5-6 hours away
   ↓
5. For each appointment:
   - Formats WhatsApp message
   - Calls WhatsApp Business API
   - Updates reminder_sent_at timestamp
```

---

## 🚀 Why Serverless?

### No Traditional Backend Means:

❌ **No Node.js/Express server**  
❌ **No server deployment**  
❌ **No server scaling concerns**  
❌ **No server monitoring**  
❌ **No server costs when idle**

✅ **Database handles everything**  
✅ **Auto-scales to demand**  
✅ **Pay per request**  
✅ **Global edge deployment**  
✅ **Built-in security (RLS)**

### What Runs Where:

| Component | Runs On | Language | Access |
|-----------|---------|----------|--------|
| UI | Browser | React/JS | ANON_KEY |
| Database | Supabase | PostgreSQL | RLS-filtered |
| Edge Functions | Supabase Edge | Deno/TS | SERVICE_ROLE_KEY |
| Cron Jobs | Supabase | PostgreSQL | SERVICE_ROLE_KEY |
| Storage | Supabase | - | RLS-filtered |

---

## 📦 Deployment

### What You Deploy:

1. **Database Schema** → Supabase SQL Editor
2. **Edge Functions** → `supabase functions deploy`
3. **Frontend** → Vercel/Netlify (static site)

### What You DON'T Deploy:

- ❌ Backend server
- ❌ API routes
- ❌ Database server
- ❌ Authentication server

**Everything is managed by Supabase!**

---

## 🔑 Environment Variables

### Frontend `.env` (Vite)
```env
VITE_SUPABASE_URL=xxx           # ✅ Safe to expose
VITE_SUPABASE_ANON_KEY=xxx      # ✅ Safe to expose (RLS protects)
VITE_APP_URL=xxx                # ✅ Safe to expose
```

### Supabase Secrets (Dashboard)
```env
RESEND_API_KEY=xxx              # ⚠️ Never expose to frontend!
WHATSAPP_API_URL=xxx            # ⚠️ Never expose to frontend!
WHATSAPP_API_TOKEN=xxx          # ⚠️ Never expose to frontend!
```

### Where SERVICE_ROLE_KEY Lives:
- ✅ Supabase Dashboard (for you to see)
- ✅ Edge Functions (automatic, never exposed)
- ❌ **NEVER** in frontend .env
- ❌ **NEVER** in Git repository
- ❌ **NEVER** in client-side code

---

## 🎯 Key Concepts

### 1. Row Level Security (RLS)
- Database-level multi-tenant isolation
- Automatic data filtering based on user's clinic
- Cannot be bypassed from frontend

### 2. Edge Functions
- Serverless functions that run on Supabase
- Have full database access (SERVICE_ROLE_KEY)
- Can call external APIs (Resend, WhatsApp)
- Only way to bypass RLS securely

### 3. ANON_KEY vs SERVICE_ROLE_KEY

**ANON_KEY** (Public):
- Safe to expose in frontend
- Respects RLS policies
- Users only see their own clinic's data

**SERVICE_ROLE_KEY** (Secret):
- Bypasses ALL security
- Full admin access
- Must NEVER be exposed
- Only in Edge Functions

---

## 📊 Cost Model

### Supabase Free Tier:
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ 500K Edge Function invocations
- ✅ 50K monthly active users

### When You Scale (Pro Plan):
- $25/month base
- Additional usage-based pricing
- Auto-scales with demand

---

## 🚨 Critical Security Rules

### ❌ NEVER DO THIS:
```javascript
// .env
SUPABASE_SERVICE_ROLE_KEY=xxx  // ❌ DANGEROUS!
```

### ✅ ALWAYS DO THIS:
```javascript
// .env
VITE_SUPABASE_ANON_KEY=xxx     // ✅ Safe

// Edge Function (server-side)
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')  // ✅ Secure
```

---

## 📚 Learn More

- **[Supabase Docs](https://supabase.com/docs)**
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)**
- **[Edge Functions](https://supabase.com/docs/guides/functions)**
- **[Supabase CLI](https://supabase.com/docs/guides/cli)**

---

## 🎓 Summary

**ClinicDesk AI is:**
- 100% serverless
- Database-first architecture
- Multi-tenant with RLS
- Edge Functions for server-side logic
- Zero backend servers to maintain

**Security is at the database level, not the application level!**

This is the modern way to build SaaS applications. 🚀

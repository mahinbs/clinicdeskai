# ClinicDesk AI - Multi-Clinic SaaS Platform

A comprehensive, multi-tenant clinic management system built with React and Supabase.

## 🚀 Features

### Multi-Tenant Architecture
- **Isolated Data**: Complete data isolation between clinics using Row Level Security (RLS)
- **Custom Branding**: Each clinic can have its own logo and theme
- **Scalable**: Built on serverless architecture with Supabase

### Role-Based Access Control (4 Portals)

1. **Master Admin** - Platform owner
   - Create and manage multiple clinics
   - Create clinic admins
   - Suspend/reactivate clinics
   - View system-wide analytics

2. **Clinic Admin** - Lead doctor/clinic owner
   - Manage clinic staff (doctors, receptionists)
   - View clinic dashboard and revenue
   - Reset user passwords
   - Suspend/reactivate staff

3. **Doctor** - Medical practitioners
   - View appointments and patient list
   - Access complete patient medical history
   - Create prescriptions (digital or upload)
   - Update appointment status

4. **Receptionist** - Front desk staff
   - Register patients
   - Book appointments
   - Generate bills and invoices
   - Manage token system

### Core Functionality

- 📅 **Appointment Management**: Book, schedule, and track appointments with token system
- 👥 **Patient Management**: Complete patient records with medical history
- 💊 **Prescription System**: Digital prescriptions or scanned/photo uploads
- 💰 **Billing System**: Invoice generation with cash/UPI/card tracking
- 📊 **Dashboard Analytics**: Real-time earnings and appointment statistics
- 📲 **WhatsApp Automation**: Automatic appointment reminders and billing messages
- 🔒 **Secure Storage**: Cloud storage for prescriptions and medical reports

## 🏗️ Tech Stack

### 🚨 100% SERVERLESS ARCHITECTURE (No Traditional Backend!)

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend (Supabase - Fully Managed)
- **PostgreSQL Database** with Row Level Security (RLS) for multi-tenant isolation
- **Supabase Auth** - JWT-based authentication
- **Edge Functions** (Deno) - Serverless functions for server-side logic
- **Storage** (S3-compatible) - File storage with RLS
- **Resend API** - Email service (called from Edge Functions)
- **WhatsApp Business API** - Automated messaging (called from Edge Functions)

**Key Point:** No Node.js/Express server, no backend deployment! Everything runs on Supabase.

## 📁 Project Structure

```
clinicdeskai/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components for each portal
│   ├── lib/           # Supabase client configuration
│   ├── utils/         # Utility functions (auth, storage, database)
│   ├── types/         # TypeScript type definitions
│   └── routes/        # Route configuration
├── supabase/
│   ├── migrations/    # Database schema and migrations
│   └── functions/     # Edge Functions
├── public/            # Static assets
├── BACKEND_SETUP.md   # Backend setup guide
├── API_REFERENCE.md   # API documentation
└── DEPLOYMENT.md      # Deployment checklist
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up](https://supabase.com))
- Resend account ([sign up](https://resend.com))
- WhatsApp Business API access

### 1. Clone and Install

```bash
git clone <repository-url>
cd clinicdeskai
npm install
```

### 2. Configure Environment

**Frontend `.env` file (only these - safe to expose):**

```env
# Supabase (Public - RLS protects data)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:5173
```

**⚠️ NEVER put SERVICE_ROLE_KEY or API keys in frontend `.env`!**

These go in **Supabase Dashboard → Edge Functions → Secrets**:
- `RESEND_API_KEY`
- `WHATSAPP_API_URL`
- `WHATSAPP_API_TOKEN`

### 3. Setup Database

**Option A: Supabase Dashboard (No CLI needed)**
1. Go to SQL Editor in your Supabase project
2. Run each migration file in order (copy-paste and click "Run"):
   - `supabase/migrations/20260213000000_initial_schema.sql`
   - `supabase/migrations/20260213000001_rls_policies.sql`
   - `supabase/migrations/20260213000002_storage_setup.sql`
   - `supabase/migrations/20260213000003_utility_functions.sql`

**Option B: Supabase CLI**
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

See **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)** for detailed steps.

### 4. Deploy Edge Functions

```bash
supabase functions deploy create-user
supabase functions deploy send-appointment-reminder
supabase functions deploy send-billing-message

# Set secrets
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set WHATSAPP_API_URL=your_url
supabase secrets set WHATSAPP_API_TOKEN=your_token
```

### 5. Create Master Admin

1. Go to Authentication → Users in Supabase Dashboard
2. Create user with email/password
3. Copy user ID
4. Run in SQL Editor:
```sql
INSERT INTO users (id, role, full_name, email, is_temp_password, status)
VALUES ('user-id-here', 'master_admin', 'Master Admin', 'admin@example.com', false, 'active');
```

See **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)** for details.

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📚 Documentation

- **[🚀 Quick Start](./QUICKSTART.md)** - Get running in 15 minutes
- **[⚡ Supabase Deployment](./SUPABASE_DEPLOYMENT.md)** - Step-by-step serverless deployment
- **[🏗️ Architecture](./ARCHITECTURE.md)** - Understanding the serverless architecture
- **[📖 API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[🎯 Deployment Checklist](./DEPLOYMENT.md)** - Production deployment guide
- **[📋 System Specifications](./systemprompt.md)** - Complete system requirements

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level multi-tenant isolation
- **Role-based Access**: Granular permissions for each role
- **Suspension System**: Clinic and user-level suspension with automatic enforcement
- **Secure Storage**: Private file storage with signed URLs
- **Audit Logging**: Track all important system actions
- **Password Management**: Temporary passwords with forced reset on first login

### Environment Variables Security

**✅ Frontend `.env` (Safe to expose - RLS protects data):**
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=http://localhost:5173
```

**⚠️ Supabase Secrets (Set in Dashboard - Never in frontend!):**
- `RESEND_API_KEY` - For sending emails
- `WHATSAPP_API_URL` - For WhatsApp messages
- `WHATSAPP_API_TOKEN` - WhatsApp authentication

**🚨 NEVER add to frontend `.env`:**
- ❌ `SERVICE_ROLE_KEY` - Bypasses ALL security!
- ❌ Third-party API keys - Can be stolen from browser

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed security explanation.**

## 🔄 Key Workflows

### User Creation Flow
1. Master Admin creates Clinic Admin (or Clinic Admin creates staff)
2. System generates temporary password
3. Email sent with credentials
4. User must reset password on first login

### Appointment Flow
1. Receptionist books appointment based on doctor's schedule
2. System assigns token number
3. 5-6 hours before appointment, WhatsApp reminder sent
4. Doctor marks appointment as completed
5. Receptionist generates bill
6. WhatsApp invoice sent to patient

### Suspension Flow
1. Admin suspends user/clinic
2. Immediate access revocation
3. Login attempts show suspension message
4. Existing sessions invalidated

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Database Schema

Main tables:
- `clinics` - Clinic information with branding
- `users` - Extended user profiles (linked to auth.users)
- `patients` - Patient records with auto-generated ID
- `appointments` - Appointment scheduling with token system
- `prescriptions` - Digital and scanned prescriptions
- `billing` - Invoice and payment tracking
- `doctor_schedules` - Doctor availability
- `patient_reports` - Uploaded medical reports
- `audit_logs` - System audit trail
- `notification_queue` - WhatsApp/Email queue

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

### Edge Functions
- `POST /functions/v1/create-user` - Create new user with temporary password
- `POST /functions/v1/send-appointment-reminder` - Send appointment reminders
- `POST /functions/v1/send-billing-message` - Send billing invoice via WhatsApp

### Database Functions (RPC)
- `validate_user_session()` - Check user access status
- `suspend_user(user_id)` - Suspend a user
- `suspend_clinic(clinic_id)` - Suspend entire clinic
- `get_available_slots(doctor_id, date)` - Get available appointment slots
- `get_clinic_dashboard_stats(...)` - Get clinic analytics
- `get_patient_history(patient_id)` - Get complete patient history

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation.

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment checklist.

Quick deploy to Vercel:

```bash
npm run build
vercel --prod
```

Don't forget to set environment variables in your hosting platform!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues or questions:
- Check documentation in `/docs` folder
- Review [BACKEND_SETUP.md](./BACKEND_SETUP.md) for setup help
- Check Supabase Dashboard logs for backend issues

## 🎯 MVP Goals

Replace traditional clinic operations:
- ❌ Manual registers → ✅ Digital patient records
- ❌ Paper prescriptions → ✅ Digital/scanned prescriptions
- ❌ Manual token system → ✅ Automated appointment tokens
- ❌ Manual billing → ✅ Digital invoices with WhatsApp delivery
- ❌ Single clinic software → ✅ Multi-clinic SaaS platform

---

**Built with ❤️ using React, Vite, and Supabase**

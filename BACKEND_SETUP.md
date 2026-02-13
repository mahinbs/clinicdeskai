# ClinicDesk AI - Backend Setup Guide

## 🏗️ Architecture Overview

ClinicDesk AI is built on a **serverless architecture** using Supabase:

- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage with RLS
- **Edge Functions**: Deno-based serverless functions
- **Email**: Resend API
- **WhatsApp**: WhatsApp Business API

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install via `npm install -g supabase`
3. **Resend Account**: Sign up at [resend.com](https://resend.com)
4. **WhatsApp Business API**: Set up WhatsApp Business API access

## 🚀 Initial Setup

### 1. Environment Variables

Already configured in `.env` file. Update these values:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email
RESEND_API_KEY=your_resend_api_key

# WhatsApp
WHATSAPP_API_URL=your_whatsapp_api_url
WHATSAPP_API_TOKEN=your_whatsapp_api_token
```

### 2. Database Setup

#### Option A: Using Supabase CLI (Recommended)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Option B: Manual Setup

1. Go to your Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `supabase/migrations/20260213000000_initial_schema.sql`
   - `supabase/migrations/20260213000001_rls_policies.sql`
   - `supabase/migrations/20260213000002_storage_setup.sql`
   - `supabase/migrations/20260213000003_utility_functions.sql`

### 3. Create Master Admin User

```sql
-- First, create the user in Supabase Auth Dashboard
-- Then run this SQL to add them to users table:

INSERT INTO users (
  id,
  role,
  full_name,
  email,
  is_temp_password,
  status
) VALUES (
  'auth-user-id-from-supabase-auth',
  'master_admin',
  'Master Admin',
  'admin@clinicdesk.ai',
  false,
  'active'
);
```

### 4. Deploy Edge Functions

```bash
# Deploy create-user function
supabase functions deploy create-user

# Deploy appointment reminder function
supabase functions deploy send-appointment-reminder

# Deploy billing message function
supabase functions deploy send-billing-message

# Set environment variables for functions
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set WHATSAPP_API_URL=your_url
supabase secrets set WHATSAPP_API_TOKEN=your_token
```

### 5. Set Up Cron Job for Reminders

In Supabase Dashboard → Database → Extensions:
1. Enable `pg_cron` extension
2. Add cron job:

```sql
-- Run appointment reminders every hour
SELECT cron.schedule(
  'appointment-reminders',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/send-appointment-reminder',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  );
  $$
);
```

## 📚 Database Schema

### Core Tables

1. **clinics**: Multi-tenant clinic information
2. **users**: Extended user profiles (links to auth.users)
3. **patients**: Patient records
4. **appointments**: Appointment scheduling
5. **prescriptions**: Digital and scanned prescriptions
6. **billing**: Invoice and payment tracking
7. **doctor_schedules**: Doctor availability
8. **patient_reports**: Uploaded medical reports
9. **audit_logs**: Audit trail
10. **notification_queue**: Notification tracking

### Key Features

- ✅ Auto-generated IDs (Patient ID, Invoice Number)
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Row Level Security on all tables
- ✅ Multi-tenant isolation
- ✅ Referential integrity with foreign keys

## 🔒 Security Implementation

### Row Level Security (RLS)

All tables have RLS enabled with policies:

1. **Multi-tenant Isolation**: Users can only access data from their clinic
2. **Role-based Access**: Different permissions for each role
3. **Suspension Checks**: Automatic validation of user/clinic status

### Key RLS Policies

- Master Admin: Full access to all clinics
- Clinic Admin: Access to their clinic data, can manage staff
- Doctor: Access to patients, appointments, prescriptions in their clinic
- Receptionist: Access to patients, appointments, billing in their clinic

## 📡 API Usage

### Using Supabase Client

```javascript
import { supabase } from './lib/supabase';

// Get all patients in user's clinic (RLS automatically filters)
const { data: patients, error } = await supabase
  .from('patients')
  .select('*')
  .order('created_at', { ascending: false });

// Create appointment
const { data: appointment, error } = await supabase
  .from('appointments')
  .insert({
    patient_id: 'patient-uuid',
    doctor_id: 'doctor-uuid',
    appointment_date: '2026-02-15',
    time_slot: '10:00:00',
    status: 'scheduled'
  });
```

### Calling Edge Functions

```javascript
// Create a new user
const { data, error } = await supabase.functions.invoke('create-user', {
  body: {
    email: 'doctor@example.com',
    full_name: 'Dr. John Doe',
    role: 'doctor',
    phone: '+91XXXXXXXXXX',
    specialization: 'General Medicine'
  }
});

// Send billing message
const { data, error } = await supabase.functions.invoke('send-billing-message', {
  body: {
    billing_id: 'billing-uuid'
  }
});
```

### Using Database Functions

```javascript
// Get dashboard stats
const { data, error } = await supabase
  .rpc('get_clinic_dashboard_stats', {
    p_clinic_id: 'clinic-uuid',
    p_start_date: '2026-02-01',
    p_end_date: '2026-02-28'
  });

// Get available slots
const { data: slots, error } = await supabase
  .rpc('get_available_slots', {
    p_doctor_id: 'doctor-uuid',
    p_date: '2026-02-15'
  });

// Suspend user
const { data, error } = await supabase
  .rpc('suspend_user', {
    p_user_id: 'user-uuid'
  });
```

## 💾 Storage Usage

### Upload Files

```javascript
import { uploadPrescription, uploadPatientReport } from './utils/storage';

// Upload prescription
const filePath = await uploadPrescription(clinicId, patientId, file);

// Upload patient report
const filePath = await uploadPatientReport(clinicId, patientId, file);

// Save to database
await supabase.from('prescriptions').insert({
  patient_id: patientId,
  doctor_id: doctorId,
  prescription_type: 'image',
  file_url: filePath
});
```

### Access Private Files

```javascript
import { getPrescriptionUrl } from './utils/storage';

// Get signed URL (valid for 1 hour)
const signedUrl = await getPrescriptionUrl(filePath);
```

## 🔄 User Creation Flow

### Creating Clinic Admin (Master Admin)

```javascript
const { data, error } = await supabase.functions.invoke('create-user', {
  body: {
    email: 'admin@clinic.com',
    full_name: 'Clinic Admin',
    role: 'clinic_admin',
    clinic_id: 'clinic-uuid',
    phone: '+91XXXXXXXXXX'
  }
});

// Response includes temporary password
console.log(data.temporary_password); // Display once to user
```

### Creating Doctor/Receptionist (Clinic Admin)

```javascript
const { data, error } = await supabase.functions.invoke('create-user', {
  body: {
    email: 'doctor@clinic.com',
    full_name: 'Dr. Smith',
    role: 'doctor',
    phone: '+91XXXXXXXXXX',
    specialization: 'Cardiology'
  }
});
```

### Password Reset Flow

```javascript
// Initiate reset
await supabase.auth.resetPasswordForEmail('user@example.com');

// User receives email with reset link
// After clicking link, update password:
await supabase.auth.updateUser({
  password: 'new-password'
});
```

## 📊 Dashboard Queries

### Clinic Admin Dashboard

```javascript
// Today's stats
const { data } = await supabase.rpc('get_clinic_dashboard_stats', {
  p_clinic_id: clinicId,
  p_start_date: new Date().toISOString().split('T')[0],
  p_end_date: new Date().toISOString().split('T')[0]
});

// Returns: total_appointments, completed_appointments, total_earnings, etc.
```

### Doctor Dashboard

```javascript
// Today's appointments
const { data: appointments } = await supabase
  .from('appointments')
  .select(`
    *,
    patient:patients(*)
  `)
  .eq('doctor_id', doctorId)
  .eq('appointment_date', new Date().toISOString().split('T')[0])
  .order('time_slot');
```

## 🔍 Patient History

```javascript
// Get complete patient history
const { data } = await supabase.rpc('get_patient_history', {
  p_patient_id: patientId
});

// Returns: appointments, prescriptions, reports, billing (all in JSONB)
```

## ⚠️ Suspension Logic

### Suspending a Clinic

```javascript
// Only Master Admin can do this
const { data, error } = await supabase.rpc('suspend_clinic', {
  p_clinic_id: clinicId
});

// All users in this clinic will automatically lose access
```

### Checking User Access

```javascript
// Validate session (call on app load and route changes)
const { data, error } = await supabase.rpc('validate_user_session');

if (!data[0].is_valid) {
  // Show error: data[0].error_message
  // Redirect to login
}
```

## 📱 WhatsApp Integration

### Appointment Reminder (Automated)

- Runs every hour via cron job
- Sends reminders 5-6 hours before appointment
- Automatically marks as sent in database

### Billing Message (Triggered)

```javascript
// After marking appointment as completed and generating bill
const { data, error } = await supabase.functions.invoke('send-billing-message', {
  body: {
    billing_id: billingId
  }
});
```

## 🧪 Testing

### Test User Creation

```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/create-user \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "doctor",
    "phone": "+919999999999"
  }'
```

### Test RLS Policies

```sql
-- Login as different users and test queries
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claim.sub = 'user-uuid';

-- Should only return data for user's clinic
SELECT * FROM patients;
```

## 🚨 Common Issues

### Issue: RLS blocking queries

**Solution**: Ensure user is authenticated and has proper role in users table

### Issue: Edge function timeout

**Solution**: Increase timeout in function config or optimize queries

### Issue: Storage upload fails

**Solution**: Check bucket policies and file size limits

## 📞 Support

For issues or questions:
- Check Supabase Dashboard logs
- Review RLS policies in SQL Editor
- Check Edge Function logs
- Verify environment variables

## 🔄 Backup & Restore

### Automated Backups

Supabase provides:
- Daily automated backups (Pro plan)
- Point-in-time recovery (Enterprise plan)

### Manual Backup

```bash
# Backup database
supabase db dump -f backup.sql

# Restore database
psql -h db.your-project.supabase.co -U postgres -d postgres -f backup.sql
```

## 🎯 Next Steps

1. ✅ Set up production environment variables
2. ✅ Deploy Edge Functions
3. ✅ Configure email templates in Resend
4. ✅ Set up WhatsApp Business API
5. ✅ Create Master Admin user
6. ✅ Test user creation flow
7. ✅ Test appointment and billing flow
8. ✅ Set up monitoring and alerts

---

**Built with ❤️ using Supabase**

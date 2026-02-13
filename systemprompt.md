🚀 COMPLETE SYSTEM PROMPT
ClinicDesk AI – Multi-Clinic SaaS (MVP)

We are building a multi-tenant clinic management SaaS platform called ClinicDesk AI.

🧱 Tech Stack

Frontend: Next.js 15 (already built)

Backend: Supabase (Serverless Architecture)

PostgreSQL Database

Supabase Auth

Supabase Edge Functions

Supabase Storage

Email: Resend (for sending credentials)

WhatsApp API: For reminders & billing messages

Architecture reference aligned with technical document 

Technical Specification Documen…

🏢 SYSTEM OVERVIEW

This is a multi-clinic system.

Each clinic:

Has its own branding (logo + theme)

Has its own staff

Cannot see data from other clinics

Is isolated using Supabase Row Level Security (RLS)

👥 USER ROLES (4 Portals)

Master Admin (Platform Owner)

Clinic Admin (Lead Doctor / Clinic Owner)

Doctor

Receptionist

Hierarchy:

Master Admin
└── Clinic Admin
  ├── Doctor
  └── Receptionist

No lower role can control a higher role.

🔐 AUTHENTICATION & USER CREATION FLOW
1️⃣ Master Admin Creates Clinic Admin

When Master Admin creates a Clinic Admin:

System generates:

Unique random temporary password

Password is:

Sent via email using Resend

Displayed once in UI

On first login:

Force password reset

Store:

is_temp_password = true

2️⃣ Clinic Admin Creates Doctor or Receptionist

Same flow:

Generate unique temporary password

Send via email

Show once in UI

Force reset on first login

🏢 MASTER ADMIN CAPABILITIES

Master Admin can:

Create / View / Manage Clinics

Create Clinic Admins

View clinic list

Set per-clinic:

Theme

Logo

Suspend entire clinic

🚨 CLINIC SUSPENSION LOGIC (Critical)

If Master Admin suspends a clinic:

clinic.status = suspended

All users under that clinic automatically lose access

On login attempt → show message:

"This clinic account has been suspended. Please contact support."

If user is already logged in:

Session invalidated

Enforcement must happen at:

RLS

Middleware

Edge Functions

Frontend checks alone are NOT sufficient.

🏥 CLINIC ADMIN CAPABILITIES

Clinic Admin can:

Create Doctor

Create Receptionist

Reset password of any Doctor or Receptionist in their clinic

Suspend Doctor or Receptionist

View clinic earnings dashboard

🔄 Password Reset by Clinic Admin

Flow:

Click “Reset Password”

Generate new temporary password

Send via email

Force reset on next login

Alternative:

Use Supabase reset link

🚫 Individual User Suspension

If Clinic Admin suspends a user:

user.status = suspended

On login:

"Your account has been suspended. Please contact your Clinic Admin."

Only that user is blocked.

🧾 APPOINTMENT SYSTEM
Patient Booking Flow

Patient books appointment (online or at reception)

Receptionist confirms entry

Doctor sets schedule in their portal

Receptionist fills available slots

Doctor sees appointments based on their schedule

📲 WHATSAPP AUTOMATION
1️⃣ Reminder

Patient receives WhatsApp reminder

Sent 5–6 hours before appointment

Triggered via Supabase Edge Function

2️⃣ Billing Message

After appointment marked "Completed":

Generate invoice

Send WhatsApp billing message

Sent same day at predefined time

Include invoice PDF

🧑‍⚕️ DOCTOR PORTAL FEATURES

Doctor can:

View today's appointments

View patient list

Click patient to see:

All previous visits

Full medical history

Prescriptions

Uploaded reports

Scanned handwritten prescriptions

📷 Prescription Upload

Allowed methods:

Digital typed prescription

Photo upload via mobile

Stored in Supabase Storage

Linked to patient record

💰 BILLING SYSTEM

After consultation marked "Completed":

Generate bill:

Consultation fee

Medication

Other charges

Store billing record

Show in:

Clinic Admin earnings dashboard

Receptionist dashboard

Send WhatsApp invoice to patient

📊 CLINIC ADMIN DASHBOARD

Shows:

Total daily earnings

Cash / UPI breakdown

Appointment count

Completed consultations

🗄️ REQUIRED DATABASE STRUCTURE
Clinics Table

id

name

logo_url

theme

status (active / suspended)

created_at

Users Table

id

clinic_id

role (master / clinic_admin / doctor / receptionist)

status (active / suspended)

is_temp_password (boolean)

created_at

Patients Table

id

clinic_id

name

phone

created_at

Appointments Table

id

clinic_id

patient_id

doctor_id

time_slot

status (scheduled / with_doctor / completed)

Prescriptions Table

id

patient_id

doctor_id

file_url (if image)

text_content

created_at

Billing Table

id

patient_id

clinic_id

total_amount

payment_mode (cash / UPI)

status

created_at

🔒 SECURITY REQUIREMENTS

Enforce Row Level Security (RLS)

Every query must validate:

clinic.status = active

user.status = active

Clinics cannot access each other’s data

Storage buckets must be clinic-scoped

Daily database backups enabled

🎯 MVP GOAL

Replace:

Manual registers

Paper prescriptions

Manual token system

Manual billing

With:

Digital appointment system

Token queue

Patient history tracking

Automated WhatsApp reminders

Basic billing + revenue tracking

Multi-clinic SaaS structure
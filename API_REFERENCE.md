# ClinicDesk AI - API Reference

## 📖 Table of Contents

1. [Authentication](#authentication)
2. [Edge Functions](#edge-functions)
3. [Database Functions (RPC)](#database-functions)
4. [Table Operations](#table-operations)
5. [Storage Operations](#storage-operations)
6. [Error Handling](#error-handling)

---

## 🔐 Authentication

### Sign In

```javascript
import { signIn } from './lib/supabase';

const { user, session } = await signIn('user@example.com', 'password');
```

**Response:**
```javascript
{
  user: { id, email, ... },
  session: { access_token, refresh_token, ... }
}
```

**Errors:**
- Invalid credentials
- Account suspended
- Clinic suspended

### Sign Out

```javascript
import { signOut } from './lib/supabase';

await signOut();
```

### Update Password

```javascript
import { updatePassword } from './lib/supabase';

await updatePassword('new-password');
```

### Get Current User Profile

```javascript
import { getUserProfile } from './lib/supabase';

const profile = await getUserProfile(userId);
```

**Response:**
```javascript
{
  id: "uuid",
  email: "user@example.com",
  full_name: "Dr. John Doe",
  role: "doctor",
  clinic_id: "uuid",
  clinic: {
    id: "uuid",
    name: "ABC Clinic",
    logo_url: "https://...",
    theme: { primaryColor: "#3B82F6", ... }
  }
}
```

---

## ⚡ Edge Functions

### 1. Create User

**Endpoint:** `POST /functions/v1/create-user`

**Purpose:** Create Clinic Admin (by Master Admin) or Doctor/Receptionist (by Clinic Admin)

**Request:**
```javascript
const { data, error } = await supabase.functions.invoke('create-user', {
  body: {
    email: "doctor@clinic.com",
    full_name: "Dr. Jane Smith",
    role: "doctor", // clinic_admin | doctor | receptionist
    clinic_id: "uuid", // Required for clinic_admin creation
    phone: "+919876543210",
    specialization: "Cardiology" // For doctors
  }
});
```

**Response:**
```javascript
{
  success: true,
  user: {
    id: "uuid",
    email: "doctor@clinic.com",
    full_name: "Dr. Jane Smith",
    role: "doctor",
    clinic_id: "uuid"
  },
  temporary_password: "Abc123!@#xyz",
  message: "User created successfully. Credentials sent via email."
}
```

**Errors:**
- `Unauthorized` - Not authenticated
- `Missing required fields` - Invalid request body
- `Insufficient permissions` - Cannot create this role
- `Clinic not found` - Invalid clinic_id

---

### 2. Send Appointment Reminder

**Endpoint:** `POST /functions/v1/send-appointment-reminder`

**Purpose:** Send WhatsApp reminders for appointments 5-6 hours away (usually triggered by cron)

**Request:**
```javascript
const { data, error } = await supabase.functions.invoke('send-appointment-reminder');
```

**Response:**
```javascript
{
  success: true,
  message: "Processed 5 appointment reminders",
  results: [
    {
      appointment_id: "uuid",
      patient: "John Doe",
      status: "sent"
    },
    // ...
  ]
}
```

---

### 3. Send Billing Message

**Endpoint:** `POST /functions/v1/send-billing-message`

**Purpose:** Send WhatsApp invoice message to patient

**Request:**
```javascript
const { data, error } = await supabase.functions.invoke('send-billing-message', {
  body: {
    billing_id: "uuid"
  }
});
```

**Response:**
```javascript
{
  success: true,
  message: "Billing message sent successfully",
  invoice_number: "INV-ABC-000123",
  recipient: "John Doe"
}
```

**Errors:**
- `Billing record not found`
- `Billing message already sent`
- `Patient phone number not found`
- `WhatsApp API error`

---

## 🗄️ Database Functions (RPC)

### 1. Validate User Session

**Purpose:** Check if user has access (not suspended)

```javascript
const { data, error } = await supabase.rpc('validate_user_session');

console.log(data[0]);
// {
//   is_valid: true,
//   error_message: null,
//   user_data: { id, role, clinic_id, ... }
// }
```

---

### 2. Suspend User

**Purpose:** Suspend a user (Clinic Admin or Master Admin)

```javascript
const { data, error } = await supabase.rpc('suspend_user', {
  p_user_id: 'uuid'
});

// Returns: true (success) or throws error
```

**Permissions:**
- Master Admin: Can suspend anyone except themselves
- Clinic Admin: Can suspend doctors/receptionists in their clinic

---

### 3. Reactivate User

**Purpose:** Reactivate a suspended user

```javascript
const { data, error } = await supabase.rpc('reactivate_user', {
  p_user_id: 'uuid'
});
```

---

### 4. Suspend Clinic

**Purpose:** Suspend entire clinic (Master Admin only)

```javascript
const { data, error } = await supabase.rpc('suspend_clinic', {
  p_clinic_id: 'uuid'
});
```

**Effect:** All users in the clinic lose access immediately

---

### 5. Reactivate Clinic

**Purpose:** Reactivate a suspended clinic

```javascript
const { data, error } = await supabase.rpc('reactivate_clinic', {
  p_clinic_id: 'uuid'
});
```

---

### 6. Get Available Slots

**Purpose:** Get available appointment slots for a doctor on a specific date

```javascript
const { data, error } = await supabase.rpc('get_available_slots', {
  p_doctor_id: 'uuid',
  p_date: '2026-02-15'
});
```

**Response:**
```javascript
[
  {
    time_slot: "09:00:00",
    is_available: true,
    token_number: 1
  },
  {
    time_slot: "09:15:00",
    is_available: false,
    token_number: 2
  },
  // ...
]
```

---

### 7. Get Clinic Dashboard Stats

**Purpose:** Get statistics for clinic admin dashboard

```javascript
const { data, error } = await supabase.rpc('get_clinic_dashboard_stats', {
  p_clinic_id: 'uuid',
  p_start_date: '2026-02-01',
  p_end_date: '2026-02-28'
});

console.log(data[0]);
```

**Response:**
```javascript
{
  total_appointments: 150,
  completed_appointments: 120,
  total_patients: 85,
  total_earnings: 125000.00,
  cash_earnings: 80000.00,
  upi_earnings: 40000.00,
  card_earnings: 5000.00,
  pending_payments: 15000.00
}
```

---

### 8. Get Doctor Dashboard Stats

**Purpose:** Get statistics for doctor dashboard

```javascript
const { data, error } = await supabase.rpc('get_doctor_dashboard_stats', {
  p_doctor_id: 'uuid',
  p_date: '2026-02-15'
});
```

**Response:**
```javascript
{
  total_appointments: 20,
  completed_appointments: 15,
  pending_appointments: 5,
  total_patients: 18
}
```

---

### 9. Get Patient History

**Purpose:** Get complete patient medical history

```javascript
const { data, error } = await supabase.rpc('get_patient_history', {
  p_patient_id: 'uuid'
});

console.log(data[0]);
```

**Response:**
```javascript
{
  appointments: [
    {
      id: "uuid",
      date: "2026-02-15",
      time: "10:00:00",
      status: "completed",
      doctor_name: "Dr. John Doe",
      notes: "Regular checkup"
    },
    // ...
  ],
  prescriptions: [
    {
      id: "uuid",
      date: "2026-02-15T10:30:00Z",
      doctor_name: "Dr. John Doe",
      diagnosis: "Hypertension",
      medications: [...],
      file_url: "path/to/file"
    },
    // ...
  ],
  reports: [...],
  billing: [...]
}
```

---

## 📋 Table Operations

### Clinics

#### Get All Clinics (Master Admin)

```javascript
const { data, error } = await supabase
  .from('clinics')
  .select('*')
  .order('created_at', { ascending: false });
```

#### Create Clinic (Master Admin)

```javascript
const { data, error } = await supabase
  .from('clinics')
  .insert({
    name: 'ABC Medical Center',
    contact_email: 'contact@abc.com',
    contact_phone: '+919876543210',
    address: '123 Main St, City',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981'
    }
  })
  .select()
  .single();
```

---

### Patients

#### Get All Patients

```javascript
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .order('created_at', { ascending: false });
```

#### Create Patient

```javascript
const { data, error } = await supabase
  .from('patients')
  .insert({
    clinic_id: 'uuid', // Auto-filled by RLS in some cases
    full_name: 'John Doe',
    phone: '+919876543210',
    email: 'john@example.com',
    date_of_birth: '1990-01-15',
    gender: 'Male',
    blood_group: 'O+',
    address: '456 Elm St',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+919876543211'
  })
  .select()
  .single();
```

**Note:** `patient_id_number` is auto-generated (e.g., `PID-000001`)

#### Search Patients

```javascript
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,patient_id_number.ilike.%${searchTerm}%`);
```

---

### Appointments

#### Get Today's Appointments (Doctor)

```javascript
const today = new Date().toISOString().split('T')[0];

const { data, error } = await supabase
  .from('appointments')
  .select(`
    *,
    patient:patients(*),
    doctor:users!appointments_doctor_id_fkey(*)
  `)
  .eq('doctor_id', doctorId)
  .eq('appointment_date', today)
  .order('time_slot');
```

#### Create Appointment

```javascript
const { data, error } = await supabase
  .from('appointments')
  .insert({
    clinic_id: 'uuid',
    patient_id: 'uuid',
    doctor_id: 'uuid',
    appointment_date: '2026-02-15',
    time_slot: '10:00:00',
    status: 'scheduled',
    reason_for_visit: 'Regular checkup',
    token_number: 1
  })
  .select()
  .single();
```

#### Update Appointment Status

```javascript
const { data, error } = await supabase
  .from('appointments')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('id', appointmentId)
  .select()
  .single();
```

---

### Prescriptions

#### Create Prescription

```javascript
const { data, error } = await supabase
  .from('prescriptions')
  .insert({
    clinic_id: 'uuid',
    patient_id: 'uuid',
    doctor_id: 'uuid',
    appointment_id: 'uuid',
    prescription_type: 'digital',
    diagnosis: 'Hypertension',
    medications: [
      {
        name: 'Amlodipine',
        dosage: '5mg',
        frequency: 'Once daily',
        duration: '30 days',
        notes: 'Take in the morning'
      }
    ],
    instructions: 'Take medication regularly, monitor BP',
    follow_up_date: '2026-03-15'
  })
  .select()
  .single();
```

#### Upload Scanned Prescription

```javascript
// 1. Upload image
const filePath = await uploadPrescription(clinicId, patientId, file);

// 2. Create prescription record
const { data, error } = await supabase
  .from('prescriptions')
  .insert({
    clinic_id: 'uuid',
    patient_id: 'uuid',
    doctor_id: 'uuid',
    prescription_type: 'image',
    file_url: filePath
  })
  .select()
  .single();
```

---

### Billing

#### Create Bill

```javascript
const { data, error } = await supabase
  .from('billing')
  .insert({
    clinic_id: 'uuid',
    patient_id: 'uuid',
    appointment_id: 'uuid',
    consultation_fee: 500,
    medication_charges: 200,
    additional_charges: [
      { description: 'Lab Test', amount: 300 }
    ],
    discount: 50,
    total_amount: 950,
    payment_mode: 'upi',
    status: 'paid',
    payment_received_by: 'uuid'
  })
  .select()
  .single();
```

**Note:** `invoice_number` is auto-generated (e.g., `INV-ABC-000123`)

#### Get Clinic Revenue

```javascript
const { data, error } = await supabase
  .from('billing')
  .select('total_amount, payment_mode, created_at')
  .eq('clinic_id', clinicId)
  .gte('created_at', startDate)
  .lte('created_at', endDate)
  .eq('status', 'paid');
```

---

## 💾 Storage Operations

### Upload Clinic Logo

```javascript
import { uploadClinicLogo } from './utils/storage';

const publicUrl = await uploadClinicLogo(clinicId, logoFile);

// Update clinic
await supabase
  .from('clinics')
  .update({ logo_url: publicUrl })
  .eq('id', clinicId);
```

### Upload Prescription

```javascript
import { uploadPrescription } from './utils/storage';

const filePath = await uploadPrescription(clinicId, patientId, prescriptionFile);

// Save to database
await supabase.from('prescriptions').insert({
  patient_id: patientId,
  doctor_id: doctorId,
  prescription_type: 'image',
  file_url: filePath
});
```

### Get Prescription URL

```javascript
import { getPrescriptionUrl } from './utils/storage';

const signedUrl = await getPrescriptionUrl(filePath);

// Use signedUrl to display/download (valid for 1 hour)
```

### Upload Patient Report

```javascript
import { uploadPatientReport } from './utils/storage';

const filePath = await uploadPatientReport(clinicId, patientId, reportFile);

// Save to database
await supabase.from('patient_reports').insert({
  clinic_id: clinicId,
  patient_id: patientId,
  report_type: 'Blood Test',
  file_url: filePath,
  file_name: reportFile.name,
  file_size: reportFile.size
});
```

---

## ⚠️ Error Handling

### Standard Error Structure

```javascript
{
  message: "Error description",
  details: "Additional details",
  hint: "Suggestion to fix",
  code: "ERROR_CODE"
}
```

### Common Error Codes

- `PGRST116` - Row Level Security violation
- `23505` - Unique constraint violation
- `23503` - Foreign key violation
- `42501` - Insufficient privileges

### Example Error Handling

```javascript
try {
  const { data, error } = await supabase
    .from('patients')
    .insert({ ... });

  if (error) throw error;

  // Success
  console.log('Patient created:', data);

} catch (error) {
  if (error.code === '23505') {
    console.error('Patient already exists');
  } else if (error.code === 'PGRST116') {
    console.error('Access denied');
  } else {
    console.error('Error:', error.message);
  }
}
```

### Handling Suspension

```javascript
// On app load and route changes
const { data } = await supabase.rpc('validate_user_session');

if (!data[0].is_valid) {
  const errorMsg = data[0].error_message;
  
  if (errorMsg.includes('suspended')) {
    // Show suspension message
    // Redirect to login
    await supabase.auth.signOut();
  }
}
```

---

## 🔄 Real-time Subscriptions

### Listen to New Appointments

```javascript
const subscription = supabase
  .channel('appointments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'appointments',
    filter: `doctor_id=eq.${doctorId}`
  }, (payload) => {
    console.log('New appointment:', payload.new);
  })
  .subscribe();

// Unsubscribe when done
subscription.unsubscribe();
```

### Listen to Billing Updates

```javascript
const subscription = supabase
  .channel('billing')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'billing',
    filter: `clinic_id=eq.${clinicId}`
  }, (payload) => {
    console.log('Billing updated:', payload.new);
  })
  .subscribe();
```

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/functions.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Need help?** Check `BACKEND_SETUP.md` for setup instructions.

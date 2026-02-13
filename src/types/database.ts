// Database type definitions for ClinicDesk AI

export type UserRole = 'master_admin' | 'clinic_admin' | 'doctor' | 'receptionist';
export type UserStatus = 'active' | 'suspended';
export type ClinicStatus = 'active' | 'suspended';
export type AppointmentStatus = 'scheduled' | 'with_doctor' | 'completed' | 'cancelled';
export type PaymentMode = 'cash' | 'upi' | 'card';
export type BillingStatus = 'pending' | 'paid' | 'cancelled';
export type PrescriptionType = 'digital' | 'image' | 'scanned';
export type NotificationType = 'appointment_reminder' | 'billing' | 'password_reset';

export interface Clinic {
  id: string;
  name: string;
  logo_url?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
  status: ClinicStatus;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  clinic_id?: string;
  role: UserRole;
  status: UserStatus;
  is_temp_password: boolean;
  full_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  clinic?: Clinic;
}

export interface Patient {
  id: string;
  clinic_id: string;
  patient_id_number: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_group?: string;
  allergies?: string;
  medical_history?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  time_slot: string;
  token_number?: number;
  status: AppointmentStatus;
  reason_for_visit?: string;
  notes?: string;
  reminder_sent_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  patient?: Patient;
  doctor?: User;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  prescription_type: PrescriptionType;
  file_url?: string;
  text_content?: string;
  medications?: Medication[];
  diagnosis?: string;
  instructions?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: User;
}

export interface AdditionalCharge {
  description: string;
  amount: number;
}

export interface Billing {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id?: string;
  invoice_number: string;
  consultation_fee: number;
  medication_charges: number;
  additional_charges?: AdditionalCharge[];
  discount: number;
  total_amount: number;
  payment_mode: PaymentMode;
  status: BillingStatus;
  payment_received_by?: string;
  whatsapp_sent_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  patient?: Patient;
}

export interface DoctorSchedule {
  id: string;
  clinic_id: string;
  doctor_id: string;
  day_of_week: number; // 0-6, 0=Sunday
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  max_patients_per_slot: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientReport {
  id: string;
  clinic_id: string;
  patient_id: string;
  report_type?: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  uploaded_by?: string;
  notes?: string;
  report_date?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  clinic_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface NotificationQueue {
  id: string;
  clinic_id?: string;
  notification_type: NotificationType;
  recipient_type: 'patient' | 'user';
  recipient_id: string;
  recipient_phone?: string;
  recipient_email?: string;
  message_template: string;
  message_data?: Record<string, any>;
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  retry_count: number;
  created_at: string;
}

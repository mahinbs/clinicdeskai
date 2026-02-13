-- ClinicDesk AI - Initial Database Schema
-- Multi-tenant clinic management system with strict isolation

-- Use PostgreSQL built-in gen_random_uuid() (no extension needed)

-- Create custom types
CREATE TYPE user_role AS ENUM ('master_admin', 'clinic_admin', 'doctor', 'receptionist');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE clinic_status AS ENUM ('active', 'suspended');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'with_doctor', 'completed', 'cancelled');
CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'card');
CREATE TYPE billing_status AS ENUM ('pending', 'paid', 'cancelled');

-- ============================================================================
-- CLINICS TABLE
-- ============================================================================
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    theme JSONB DEFAULT '{"primaryColor": "#3B82F6", "secondaryColor": "#10B981"}',
    status clinic_status DEFAULT 'active',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active clinics
CREATE INDEX idx_clinics_status ON clinics(status);

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    is_temp_password BOOLEAN DEFAULT TRUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(255), -- For doctors
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);

-- Constraint: Master admin should not have clinic_id
ALTER TABLE users ADD CONSTRAINT check_master_admin_no_clinic 
    CHECK (role != 'master_admin' OR clinic_id IS NULL);

-- Constraint: Other roles must have clinic_id
ALTER TABLE users ADD CONSTRAINT check_clinic_users_have_clinic 
    CHECK (role = 'master_admin' OR clinic_id IS NOT NULL);

-- ============================================================================
-- PATIENTS TABLE
-- ============================================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated: CID-XXXXX
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    blood_group VARCHAR(10),
    allergies TEXT,
    medical_history TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for patients
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_patient_id_number ON patients(patient_id_number);

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    token_number INTEGER,
    status appointment_status DEFAULT 'scheduled',
    reason_for_visit TEXT,
    notes TEXT,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for appointments
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_reminder ON appointments(reminder_sent_at) WHERE reminder_sent_at IS NULL;

-- Unique constraint: One appointment per doctor per time slot
CREATE UNIQUE INDEX idx_appointments_doctor_slot ON appointments(doctor_id, appointment_date, time_slot) 
    WHERE status != 'cancelled';

-- ============================================================================
-- PRESCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    prescription_type VARCHAR(20) DEFAULT 'digital', -- digital, image, scanned
    file_url TEXT, -- For image/scanned prescriptions
    text_content TEXT, -- For digital prescriptions
    medications JSONB, -- Array of {name, dosage, frequency, duration, notes}
    diagnosis TEXT,
    instructions TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for prescriptions
CREATE INDEX idx_prescriptions_clinic_id ON prescriptions(clinic_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_appointment_id ON prescriptions(appointment_id);

-- ============================================================================
-- BILLING TABLE
-- ============================================================================
CREATE TABLE billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated: INV-CLINIC-XXXXX
    consultation_fee DECIMAL(10, 2) DEFAULT 0,
    medication_charges DECIMAL(10, 2) DEFAULT 0,
    additional_charges JSONB, -- Array of {description, amount}
    discount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_mode payment_mode NOT NULL,
    status billing_status DEFAULT 'pending',
    payment_received_by UUID REFERENCES auth.users(id),
    whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for billing
CREATE INDEX idx_billing_clinic_id ON billing(clinic_id);
CREATE INDEX idx_billing_patient_id ON billing(patient_id);
CREATE INDEX idx_billing_appointment_id ON billing(appointment_id);
CREATE INDEX idx_billing_status ON billing(status);
CREATE INDEX idx_billing_created_at ON billing(created_at);
CREATE INDEX idx_billing_invoice_number ON billing(invoice_number);

-- ============================================================================
-- DOCTOR SCHEDULES TABLE
-- ============================================================================
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 15,
    max_patients_per_slot INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for doctor schedules
CREATE INDEX idx_doctor_schedules_clinic_id ON doctor_schedules(clinic_id);
CREATE INDEX idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX idx_doctor_schedules_day ON doctor_schedules(day_of_week);

-- ============================================================================
-- PATIENT REPORTS TABLE (for uploaded medical reports)
-- ============================================================================
CREATE TABLE patient_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    report_type VARCHAR(100),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    notes TEXT,
    report_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for patient reports
CREATE INDEX idx_patient_reports_clinic_id ON patient_reports(clinic_id);
CREATE INDEX idx_patient_reports_patient_id ON patient_reports(patient_id);

-- ============================================================================
-- AUDIT LOG TABLE (for tracking important actions)
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_clinic_id ON audit_logs(clinic_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- NOTIFICATION QUEUE TABLE (for WhatsApp and Email)
-- ============================================================================
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- appointment_reminder, billing, password_reset
    recipient_type VARCHAR(20) NOT NULL, -- patient, user
    recipient_id UUID NOT NULL,
    recipient_phone VARCHAR(20),
    recipient_email VARCHAR(255),
    message_template VARCHAR(100) NOT NULL,
    message_data JSONB,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notification queue
CREATE INDEX idx_notification_queue_status ON notification_queue(status) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX idx_notification_queue_clinic_id ON notification_queue(clinic_id);

-- ============================================================================
-- FUNCTIONS FOR AUTO-GENERATION
-- ============================================================================

-- Function to generate patient ID
CREATE OR REPLACE FUNCTION generate_patient_id(p_clinic_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_count INTEGER;
    v_patient_id VARCHAR(50);
BEGIN
    -- Get count of patients for this clinic
    SELECT COUNT(*) INTO v_count FROM patients WHERE clinic_id = p_clinic_id;
    v_patient_id := 'PID-' || LPAD((v_count + 1)::TEXT, 6, '0');
    RETURN v_patient_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(p_clinic_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_count INTEGER;
    v_clinic_prefix VARCHAR(10);
    v_invoice_number VARCHAR(50);
BEGIN
    -- Get clinic code from first 3 chars of ID
    SELECT UPPER(SUBSTRING(id::TEXT, 1, 3)) INTO v_clinic_prefix FROM clinics WHERE id = p_clinic_id;
    
    -- Get count of invoices for this clinic
    SELECT COUNT(*) INTO v_count FROM billing WHERE clinic_id = p_clinic_id;
    v_invoice_number := 'INV-' || v_clinic_prefix || '-' || LPAD((v_count + 1)::TEXT, 6, '0');
    RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON doctor_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-generate patient ID
CREATE OR REPLACE FUNCTION trigger_generate_patient_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.patient_id_number IS NULL THEN
        NEW.patient_id_number := generate_patient_id(NEW.clinic_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_patient_id BEFORE INSERT ON patients
    FOR EACH ROW EXECUTE FUNCTION trigger_generate_patient_id();

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION trigger_generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := generate_invoice_number(NEW.clinic_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_invoice_number BEFORE INSERT ON billing
    FOR EACH ROW EXECUTE FUNCTION trigger_generate_invoice_number();

-- ============================================================================
-- SEED DATA: Create Master Admin
-- ============================================================================
-- Note: This will be executed after running migrations
-- The master admin user must be created manually in Supabase Auth first
-- Then run: INSERT INTO users (id, role, full_name, email, is_temp_password) 
--           VALUES ('auth-user-id', 'master_admin', 'Master Admin', 'admin@clinicdesk.ai', false);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE clinics IS 'Stores information about each clinic in the multi-tenant system';
COMMENT ON TABLE users IS 'Extended user information linked to Supabase Auth users';
COMMENT ON TABLE patients IS 'Patient records belonging to specific clinics';
COMMENT ON TABLE appointments IS 'Appointment scheduling and token management';
COMMENT ON TABLE prescriptions IS 'Digital and scanned prescriptions';
COMMENT ON TABLE billing IS 'Billing and invoice management';
COMMENT ON TABLE doctor_schedules IS 'Doctor availability schedules';
COMMENT ON TABLE patient_reports IS 'Uploaded medical reports and documents';
COMMENT ON TABLE audit_logs IS 'Audit trail for important system actions';
COMMENT ON TABLE notification_queue IS 'Queue for WhatsApp and email notifications';

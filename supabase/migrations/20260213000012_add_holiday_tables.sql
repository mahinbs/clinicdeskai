-- Add missing tables for clinic and doctor holidays

CREATE TABLE IF NOT EXISTS clinic_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason VARCHAR(255),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, date)
);

CREATE TABLE IF NOT EXISTS doctor_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, date)
);

CREATE TABLE IF NOT EXISTS doctor_settings (
    doctor_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    default_appointment_duration SMALLINT DEFAULT 30 CHECK (default_appointment_duration >= 15 AND default_appointment_duration <= 60),
    allow_custom_duration BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_holidays_clinic_date ON clinic_holidays(clinic_id, date);
CREATE INDEX IF NOT EXISTS idx_doctor_holidays_doctor_date ON doctor_holidays(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_doctor_settings_clinic ON doctor_settings(clinic_id);

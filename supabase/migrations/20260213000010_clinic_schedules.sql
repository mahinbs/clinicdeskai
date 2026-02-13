-- Clinic Operating Hours Management
-- Allows clinic admins to set operating hours for each day of the week

CREATE TABLE clinic_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    is_closed BOOLEAN DEFAULT FALSE,
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '18:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, day_of_week)
);

-- Clinic Holiday/Off Days
-- Random dates when clinic is closed
CREATE TABLE clinic_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason VARCHAR(255),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, date)
);

-- Indexes
CREATE INDEX idx_clinic_schedules_clinic ON clinic_schedules(clinic_id);
CREATE INDEX idx_clinic_holidays_clinic_date ON clinic_holidays(clinic_id, date);

-- Comments
COMMENT ON TABLE clinic_schedules IS 'Weekly operating hours for each clinic';
COMMENT ON TABLE clinic_holidays IS 'Specific dates when clinic is closed';
COMMENT ON COLUMN clinic_schedules.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';

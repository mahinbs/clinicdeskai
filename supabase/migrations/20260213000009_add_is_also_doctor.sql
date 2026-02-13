-- Add is_also_doctor field to users table
-- This allows clinic admins to also function as doctors in their own clinic

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_also_doctor BOOLEAN DEFAULT FALSE;

-- Add comment to explain the field
COMMENT ON COLUMN users.is_also_doctor IS 'For clinic_admin role: indicates if they also work as a doctor in their clinic';

-- Index for querying doctors (including clinic admins who are also doctors)
CREATE INDEX IF NOT EXISTS idx_users_is_also_doctor ON users(is_also_doctor) WHERE is_also_doctor = TRUE;

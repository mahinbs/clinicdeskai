-- Add degree (optional) and experience (mandatory for doctors) for doctor / clinic_admin who is doctor

ALTER TABLE users ADD COLUMN IF NOT EXISTS degree VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years INTEGER;

COMMENT ON COLUMN users.degree IS 'Doctor degree e.g. MBBS, MD - optional';
COMMENT ON COLUMN users.experience_years IS 'Years of experience - required for doctors and clinic_admin who is also doctor';

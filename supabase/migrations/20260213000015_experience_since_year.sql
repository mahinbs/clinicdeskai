-- Store year started practice so "years of experience" auto-updates every year

ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_since_year INTEGER;

COMMENT ON COLUMN users.experience_since_year IS 'Year doctor started practice; years of experience = current_year - experience_since_year (auto-updates)';

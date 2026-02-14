-- Add consultation_fee to doctor_settings (set by clinic admin per doctor; used when creating invoices)
ALTER TABLE doctor_settings
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10, 2) DEFAULT 0 CHECK (consultation_fee >= 0);

COMMENT ON COLUMN doctor_settings.consultation_fee IS 'Consultation fee for this doctor at this clinic, set by clinic admin. Used as default when creating billing/invoice.';

-- ClinicDesk AI - Storage Buckets and Policies
-- Storage for prescriptions, patient reports, and clinic logos

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Bucket for clinic logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-logos',
  'clinic-logos',
  true, -- Public bucket for logos
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for prescriptions (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for patient reports (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-reports',
  'patient-reports',
  false, -- Private bucket
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/dicom']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES - CLINIC LOGOS
-- ============================================================================

-- Anyone can view clinic logos (public bucket)
CREATE POLICY "Anyone can view clinic logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'clinic-logos');

-- Master admin can upload clinic logos
CREATE POLICY "Master admin can upload clinic logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'clinic-logos'
  AND auth.uid() IN (
    SELECT id FROM users WHERE role = 'master_admin' AND status = 'active'
  )
);

-- Master admin can update clinic logos
CREATE POLICY "Master admin can update clinic logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'clinic-logos'
  AND auth.uid() IN (
    SELECT id FROM users WHERE role = 'master_admin' AND status = 'active'
  )
);

-- Master admin can delete clinic logos
CREATE POLICY "Master admin can delete clinic logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'clinic-logos'
  AND auth.uid() IN (
    SELECT id FROM users WHERE role = 'master_admin' AND status = 'active'
  )
);

-- ============================================================================
-- STORAGE RLS POLICIES - PRESCRIPTIONS
-- ============================================================================

-- Clinic staff can view prescriptions in their clinic
CREATE POLICY "Clinic staff can view prescriptions"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'prescriptions'
  AND (
    -- Extract clinic_id from the path (format: clinic_id/patient_id/file_name)
    (string_to_array(name, '/'))[1]::UUID IN (
      SELECT clinic_id::TEXT::UUID FROM users WHERE id = auth.uid() AND status = 'active'
    )
  )
);

-- Doctors can upload prescriptions for their clinic
CREATE POLICY "Doctors can upload prescriptions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prescriptions'
  AND auth.uid() IN (
    SELECT id FROM users WHERE role = 'doctor' AND status = 'active'
  )
  AND (string_to_array(name, '/'))[1]::UUID IN (
    SELECT clinic_id::TEXT::UUID FROM users WHERE id = auth.uid()
  )
);

-- Doctors can update their own prescriptions
CREATE POLICY "Doctors can update prescriptions"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'prescriptions'
  AND auth.uid() IN (
    SELECT id FROM users WHERE role = 'doctor' AND status = 'active'
  )
  AND (string_to_array(name, '/'))[1]::UUID IN (
    SELECT clinic_id::TEXT::UUID FROM users WHERE id = auth.uid()
  )
);

-- Doctors can delete their own prescriptions
CREATE POLICY "Doctors can delete prescriptions"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prescriptions'
  AND auth.uid() IN (
    SELECT id FROM users WHERE role = 'doctor' AND status = 'active'
  )
  AND (string_to_array(name, '/'))[1]::UUID IN (
    SELECT clinic_id::TEXT::UUID FROM users WHERE id = auth.uid()
  )
);

-- ============================================================================
-- STORAGE RLS POLICIES - PATIENT REPORTS
-- ============================================================================

-- Clinic staff can view patient reports in their clinic
CREATE POLICY "Clinic staff can view patient reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'patient-reports'
  AND (string_to_array(name, '/'))[1]::UUID IN (
    SELECT clinic_id::TEXT::UUID FROM users WHERE id = auth.uid() AND status = 'active'
  )
);

-- Doctors and receptionists can upload patient reports
CREATE POLICY "Staff can upload patient reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'patient-reports'
  AND auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('doctor', 'receptionist', 'clinic_admin')
    AND status = 'active'
  )
  AND (string_to_array(name, '/'))[1]::UUID IN (
    SELECT clinic_id::TEXT::UUID FROM users WHERE id = auth.uid()
  )
);

-- Staff can update patient reports
CREATE POLICY "Staff can update patient reports"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'patient-reports'
  AND auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('doctor', 'receptionist', 'clinic_admin')
    AND status = 'active'
  )
  AND (string_to_array(name, '/'))[1]::UUID IN (
    SELECT clinic_id::TEXT::UUID FROM users WHERE id = auth.uid()
  )
);

-- Staff can delete patient reports
CREATE POLICY "Staff can delete patient reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'patient-reports'
  AND auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('doctor', 'receptionist', 'clinic_admin')
    AND status = 'active'
  )
  AND (string_to_array(name, '/'))[1]::UUID IN (
    SELECT clinic_id::TEXT::UUID FROM users WHERE id = auth.uid()
  )
);

-- ============================================================================
-- HELPER FUNCTIONS FOR FILE UPLOAD
-- ============================================================================

-- Function to generate storage path for prescriptions
CREATE OR REPLACE FUNCTION generate_prescription_path(
  p_clinic_id UUID,
  p_patient_id UUID,
  p_file_extension TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN p_clinic_id::TEXT || '/' || 
         p_patient_id::TEXT || '/' || 
         'prescription_' || gen_random_uuid()::TEXT || p_file_extension;
END;
$$ LANGUAGE plpgsql;

-- Function to generate storage path for patient reports
CREATE OR REPLACE FUNCTION generate_report_path(
  p_clinic_id UUID,
  p_patient_id UUID,
  p_file_extension TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN p_clinic_id::TEXT || '/' || 
         p_patient_id::TEXT || '/' || 
         'report_' || gen_random_uuid()::TEXT || p_file_extension;
END;
$$ LANGUAGE plpgsql;

-- Function to generate storage path for clinic logos
CREATE OR REPLACE FUNCTION generate_logo_path(
  p_clinic_id UUID,
  p_file_extension TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN p_clinic_id::TEXT || '_logo' || p_file_extension;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION generate_prescription_path IS 'Generate storage path for prescription files';
COMMENT ON FUNCTION generate_report_path IS 'Generate storage path for patient report files';
COMMENT ON FUNCTION generate_logo_path IS 'Generate storage path for clinic logo files';

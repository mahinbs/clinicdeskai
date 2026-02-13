-- ClinicDesk AI - Utility Functions
-- Database functions for business logic, validation, and automation

-- ============================================================================
-- SUSPENSION CHECK FUNCTIONS
-- ============================================================================

-- Function to validate user session on each request
-- This should be called from middleware/auth context
CREATE OR REPLACE FUNCTION validate_user_session()
RETURNS TABLE(
  is_valid BOOLEAN,
  error_message TEXT,
  user_data JSONB
) AS $$
DECLARE
  v_user_id UUID;
  v_user RECORD;
  v_clinic RECORD;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Not authenticated'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Get user details
  SELECT * INTO v_user FROM users WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Check user status
  IF v_user.status != 'active' THEN
    RETURN QUERY SELECT false, 'Your account has been suspended. Please contact your administrator.'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Check clinic status (except for master admin)
  IF v_user.role != 'master_admin' THEN
    SELECT * INTO v_clinic FROM clinics WHERE id = v_user.clinic_id;

    IF NOT FOUND THEN
      RETURN QUERY SELECT false, 'Clinic not found'::TEXT, NULL::JSONB;
      RETURN;
    END IF;

    IF v_clinic.status != 'active' THEN
      RETURN QUERY SELECT false, 'This clinic account has been suspended. Please contact support.'::TEXT, NULL::JSONB;
      RETURN;
    END IF;
  END IF;

  -- Update last login time
  UPDATE users SET last_login_at = NOW() WHERE id = v_user_id;

  -- Return success with user data
  RETURN QUERY SELECT 
    true,
    NULL::TEXT,
    jsonb_build_object(
      'id', v_user.id,
      'role', v_user.role,
      'clinic_id', v_user.clinic_id,
      'full_name', v_user.full_name,
      'email', v_user.email,
      'is_temp_password', v_user.is_temp_password
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USER MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to suspend a user
CREATE OR REPLACE FUNCTION suspend_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_id UUID;
  v_current_user RECORD;
  v_target_user RECORD;
BEGIN
  v_current_user_id := auth.uid();

  -- Get current user details
  SELECT * INTO v_current_user FROM users WHERE id = v_current_user_id;
  
  -- Get target user details
  SELECT * INTO v_target_user FROM users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  -- Permission checks
  IF v_current_user.role = 'master_admin' THEN
    -- Master admin can suspend anyone except themselves
    IF p_user_id = v_current_user_id THEN
      RAISE EXCEPTION 'Cannot suspend yourself';
    END IF;
  ELSIF v_current_user.role = 'clinic_admin' THEN
    -- Clinic admin can only suspend users in their clinic
    IF v_target_user.clinic_id != v_current_user.clinic_id THEN
      RAISE EXCEPTION 'Cannot suspend users from other clinics';
    END IF;
    -- Can only suspend doctors and receptionists
    IF v_target_user.role NOT IN ('doctor', 'receptionist') THEN
      RAISE EXCEPTION 'Insufficient permissions';
    END IF;
  ELSE
    RAISE EXCEPTION 'Insufficient permissions to suspend users';
  END IF;

  -- Suspend the user
  UPDATE users SET status = 'suspended' WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reactivate a user
CREATE OR REPLACE FUNCTION reactivate_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_id UUID;
  v_current_user RECORD;
  v_target_user RECORD;
BEGIN
  v_current_user_id := auth.uid();

  -- Get current user details
  SELECT * INTO v_current_user FROM users WHERE id = v_current_user_id;
  
  -- Get target user details
  SELECT * INTO v_target_user FROM users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  -- Permission checks (same as suspend)
  IF v_current_user.role = 'master_admin' THEN
    -- Master admin can reactivate anyone
    NULL;
  ELSIF v_current_user.role = 'clinic_admin' THEN
    IF v_target_user.clinic_id != v_current_user.clinic_id THEN
      RAISE EXCEPTION 'Cannot reactivate users from other clinics';
    END IF;
    IF v_target_user.role NOT IN ('doctor', 'receptionist') THEN
      RAISE EXCEPTION 'Insufficient permissions';
    END IF;
  ELSE
    RAISE EXCEPTION 'Insufficient permissions to reactivate users';
  END IF;

  -- Reactivate the user
  UPDATE users SET status = 'active' WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLINIC MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to suspend a clinic (Master Admin only)
CREATE OR REPLACE FUNCTION suspend_clinic(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_id UUID;
  v_current_user RECORD;
BEGIN
  v_current_user_id := auth.uid();

  -- Get current user details
  SELECT * INTO v_current_user FROM users WHERE id = v_current_user_id;

  -- Only master admin can suspend clinics
  IF v_current_user.role != 'master_admin' THEN
    RAISE EXCEPTION 'Only master admin can suspend clinics';
  END IF;

  -- Suspend the clinic
  UPDATE clinics SET status = 'suspended' WHERE id = p_clinic_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reactivate a clinic (Master Admin only)
CREATE OR REPLACE FUNCTION reactivate_clinic(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_id UUID;
  v_current_user RECORD;
BEGIN
  v_current_user_id := auth.uid();

  -- Get current user details
  SELECT * INTO v_current_user FROM users WHERE id = v_current_user_id;

  -- Only master admin can reactivate clinics
  IF v_current_user.role != 'master_admin' THEN
    RAISE EXCEPTION 'Only master admin can reactivate clinics';
  END IF;

  -- Reactivate the clinic
  UPDATE clinics SET status = 'active' WHERE id = p_clinic_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPOINTMENT FUNCTIONS
-- ============================================================================

-- Function to get available time slots for a doctor on a date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_doctor_id UUID,
  p_date DATE
)
RETURNS TABLE(
  time_slot TIME,
  is_available BOOLEAN,
  token_number INTEGER
) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_schedule RECORD;
  v_slot TIME;
  v_booked_count INTEGER;
BEGIN
  -- Get day of week (0 = Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Get doctor's schedule for this day
  FOR v_schedule IN
    SELECT * FROM doctor_schedules
    WHERE doctor_id = p_doctor_id
    AND day_of_week = v_day_of_week
    AND is_active = true
  LOOP
    -- Generate time slots
    v_slot := v_schedule.start_time;
    
    WHILE v_slot < v_schedule.end_time LOOP
      -- Check how many appointments are booked for this slot
      SELECT COUNT(*) INTO v_booked_count
      FROM appointments
      WHERE doctor_id = p_doctor_id
      AND appointment_date = p_date
      AND time_slot = v_slot
      AND status != 'cancelled';

      -- Return the slot with availability status
      RETURN QUERY SELECT 
        v_slot,
        v_booked_count < v_schedule.max_patients_per_slot,
        v_booked_count + 1;

      -- Move to next slot
      v_slot := v_slot + (v_schedule.slot_duration_minutes || ' minutes')::INTERVAL;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DASHBOARD STATISTICS FUNCTIONS
-- ============================================================================

-- Function to get clinic admin dashboard stats
CREATE OR REPLACE FUNCTION get_clinic_dashboard_stats(
  p_clinic_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_appointments INTEGER,
  completed_appointments INTEGER,
  total_patients INTEGER,
  total_earnings NUMERIC,
  cash_earnings NUMERIC,
  upi_earnings NUMERIC,
  card_earnings NUMERIC,
  pending_payments NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Total appointments
    (SELECT COUNT(*)::INTEGER FROM appointments 
     WHERE clinic_id = p_clinic_id 
     AND appointment_date BETWEEN p_start_date AND p_end_date)::INTEGER,
    
    -- Completed appointments
    (SELECT COUNT(*)::INTEGER FROM appointments 
     WHERE clinic_id = p_clinic_id 
     AND appointment_date BETWEEN p_start_date AND p_end_date
     AND status = 'completed')::INTEGER,
    
    -- Total unique patients
    (SELECT COUNT(DISTINCT patient_id)::INTEGER FROM appointments 
     WHERE clinic_id = p_clinic_id 
     AND appointment_date BETWEEN p_start_date AND p_end_date)::INTEGER,
    
    -- Total earnings (paid bills)
    (SELECT COALESCE(SUM(total_amount), 0) FROM billing 
     WHERE clinic_id = p_clinic_id 
     AND created_at::DATE BETWEEN p_start_date AND p_end_date
     AND status = 'paid')::NUMERIC,
    
    -- Cash earnings
    (SELECT COALESCE(SUM(total_amount), 0) FROM billing 
     WHERE clinic_id = p_clinic_id 
     AND created_at::DATE BETWEEN p_start_date AND p_end_date
     AND status = 'paid' AND payment_mode = 'cash')::NUMERIC,
    
    -- UPI earnings
    (SELECT COALESCE(SUM(total_amount), 0) FROM billing 
     WHERE clinic_id = p_clinic_id 
     AND created_at::DATE BETWEEN p_start_date AND p_end_date
     AND status = 'paid' AND payment_mode = 'upi')::NUMERIC,
    
    -- Card earnings
    (SELECT COALESCE(SUM(total_amount), 0) FROM billing 
     WHERE clinic_id = p_clinic_id 
     AND created_at::DATE BETWEEN p_start_date AND p_end_date
     AND status = 'paid' AND payment_mode = 'card')::NUMERIC,
    
    -- Pending payments
    (SELECT COALESCE(SUM(total_amount), 0) FROM billing 
     WHERE clinic_id = p_clinic_id 
     AND created_at::DATE BETWEEN p_start_date AND p_end_date
     AND status = 'pending')::NUMERIC;
END;
$$ LANGUAGE plpgsql;

-- Function to get doctor dashboard stats
CREATE OR REPLACE FUNCTION get_doctor_dashboard_stats(
  p_doctor_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_appointments INTEGER,
  completed_appointments INTEGER,
  pending_appointments INTEGER,
  total_patients INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM appointments 
     WHERE doctor_id = p_doctor_id AND appointment_date = p_date)::INTEGER,
    
    (SELECT COUNT(*)::INTEGER FROM appointments 
     WHERE doctor_id = p_doctor_id AND appointment_date = p_date 
     AND status = 'completed')::INTEGER,
    
    (SELECT COUNT(*)::INTEGER FROM appointments 
     WHERE doctor_id = p_doctor_id AND appointment_date = p_date 
     AND status IN ('scheduled', 'with_doctor'))::INTEGER,
    
    (SELECT COUNT(DISTINCT patient_id)::INTEGER FROM appointments 
     WHERE doctor_id = p_doctor_id AND appointment_date = p_date)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PATIENT HISTORY FUNCTION
-- ============================================================================

-- Function to get complete patient history
CREATE OR REPLACE FUNCTION get_patient_history(p_patient_id UUID)
RETURNS TABLE(
  appointments JSONB,
  prescriptions JSONB,
  reports JSONB,
  billing JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- All appointments
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'date', a.appointment_date,
        'time', a.time_slot,
        'status', a.status,
        'doctor_name', u.full_name,
        'notes', a.notes
      ) ORDER BY a.appointment_date DESC, a.time_slot DESC
    ), '[]'::JSONB)
    FROM appointments a
    LEFT JOIN users u ON a.doctor_id = u.id
    WHERE a.patient_id = p_patient_id),
    
    -- All prescriptions
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'date', p.created_at,
        'doctor_name', u.full_name,
        'diagnosis', p.diagnosis,
        'medications', p.medications,
        'file_url', p.file_url
      ) ORDER BY p.created_at DESC
    ), '[]'::JSONB)
    FROM prescriptions p
    LEFT JOIN users u ON p.doctor_id = u.id
    WHERE p.patient_id = p_patient_id),
    
    -- All reports
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'date', r.created_at,
        'report_type', r.report_type,
        'file_name', r.file_name,
        'file_url', r.file_url
      ) ORDER BY r.created_at DESC
    ), '[]'::JSONB)
    FROM patient_reports r
    WHERE r.patient_id = p_patient_id),
    
    -- All billing
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'date', b.created_at,
        'invoice_number', b.invoice_number,
        'total_amount', b.total_amount,
        'payment_mode', b.payment_mode,
        'status', b.status
      ) ORDER BY b.created_at DESC
    ), '[]'::JSONB)
    FROM billing b
    WHERE b.patient_id = p_patient_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION validate_user_session IS 'Validate user session and check suspension status';
COMMENT ON FUNCTION suspend_user IS 'Suspend a user (requires appropriate permissions)';
COMMENT ON FUNCTION reactivate_user IS 'Reactivate a suspended user';
COMMENT ON FUNCTION suspend_clinic IS 'Suspend a clinic (Master Admin only)';
COMMENT ON FUNCTION reactivate_clinic IS 'Reactivate a clinic (Master Admin only)';
COMMENT ON FUNCTION get_available_slots IS 'Get available appointment slots for a doctor';
COMMENT ON FUNCTION get_clinic_dashboard_stats IS 'Get dashboard statistics for clinic admin';
COMMENT ON FUNCTION get_doctor_dashboard_stats IS 'Get dashboard statistics for doctor';
COMMENT ON FUNCTION get_patient_history IS 'Get complete patient history';

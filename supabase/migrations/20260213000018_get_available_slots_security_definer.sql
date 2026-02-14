-- Fix: Receptionist (and others) can see time slots per doctor.
-- get_available_slots runs as INVOKER, so RLS on doctor_schedules/appointments
-- can block rows and the UI shows "No slots available". Run as DEFINER and
-- restrict to caller's clinic so only that clinic's data is visible.

CREATE OR REPLACE FUNCTION get_available_slots(
  p_doctor_id UUID,
  p_date DATE
)
RETURNS TABLE(
  time_slot TIME,
  is_available BOOLEAN,
  token_number INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_clinic_id UUID;
  v_doctor_clinic_id UUID;
  v_day_of_week INTEGER;
  v_schedule RECORD;
  v_slot TIME;
  v_booked_count INTEGER;
BEGIN
  -- Restrict to caller's clinic only
  v_caller_clinic_id := public.get_user_clinic_id();
  SELECT u.clinic_id INTO v_doctor_clinic_id
  FROM public.users u
  WHERE u.id = p_doctor_id;

  IF v_caller_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Your account has no clinic assigned. Contact admin.';
  END IF;
  IF v_doctor_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Doctor not found.';
  END IF;
  IF v_caller_clinic_id != v_doctor_clinic_id THEN
    RAISE EXCEPTION 'Doctor is not in your clinic.';
  END IF;

  -- 0=Sunday..6=Saturday; cast so it matches integer column
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;

  FOR v_schedule IN
    SELECT * FROM public.doctor_schedules
    WHERE doctor_id = p_doctor_id
      AND day_of_week = v_day_of_week
      AND is_active = true
  LOOP
    v_slot := v_schedule.start_time;

    WHILE v_slot < v_schedule.end_time LOOP
      SELECT COUNT(*) INTO v_booked_count
      FROM public.appointments a
      WHERE a.doctor_id = p_doctor_id
        AND a.appointment_date = p_date
        AND a.time_slot = v_slot
        AND a.status != 'cancelled';

      RETURN QUERY SELECT
        v_slot,
        v_booked_count < v_schedule.max_patients_per_slot,
        v_booked_count + 1;

      v_slot := v_slot + (v_schedule.slot_duration_minutes || ' minutes')::INTERVAL;
    END LOOP;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION get_available_slots(UUID, DATE) IS 'Returns available time slots for a doctor on a date. SECURITY DEFINER so receptionists can see slots; restricted to caller clinic.';

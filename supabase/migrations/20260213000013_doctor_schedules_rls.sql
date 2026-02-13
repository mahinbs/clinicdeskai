-- RLS Policies for Doctor Schedules, Holidays, and Settings

-- Enable RLS
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DOCTOR SCHEDULES RLS
-- ============================================================================

-- Doctors can manage their own schedule
CREATE POLICY "Doctors can manage own schedule"
    ON doctor_schedules FOR ALL
    USING (doctor_id = auth.uid());

-- Clinic admin can manage all doctor schedules in their clinic
CREATE POLICY "Clinic admin can manage doctor schedules"
    ON doctor_schedules FOR ALL
    USING (clinic_id = public.get_user_clinic_id() AND public.is_clinic_admin());

-- Receptionists can view doctor schedules in their clinic
CREATE POLICY "Receptionists can view doctor schedules"
    ON doctor_schedules FOR SELECT
    USING (clinic_id = public.get_user_clinic_id());

-- ============================================================================
-- DOCTOR HOLIDAYS RLS
-- ============================================================================

-- Doctors can manage their own holidays
CREATE POLICY "Doctors can manage own holidays"
    ON doctor_holidays FOR ALL
    USING (doctor_id = auth.uid());

-- Clinic admin can manage doctor holidays
CREATE POLICY "Clinic admin can manage doctor holidays"
    ON doctor_holidays FOR ALL
    USING (clinic_id = public.get_user_clinic_id() AND public.is_clinic_admin());

-- Receptionists can view doctor holidays
CREATE POLICY "Receptionists can view doctor holidays"
    ON doctor_holidays FOR SELECT
    USING (clinic_id = public.get_user_clinic_id());

-- ============================================================================
-- DOCTOR SETTINGS RLS
-- ============================================================================

-- Doctors can manage their own settings
CREATE POLICY "Doctors can manage own settings"
    ON doctor_settings FOR ALL
    USING (doctor_id = auth.uid());

-- Clinic admin can manage doctor settings
CREATE POLICY "Clinic admin can manage doctor settings"
    ON doctor_settings FOR ALL
    USING (clinic_id = public.get_user_clinic_id() AND public.is_clinic_admin());

-- Receptionists can view doctor settings
CREATE POLICY "Receptionists can view doctor settings"
    ON doctor_settings FOR SELECT
    USING (clinic_id = public.get_user_clinic_id());

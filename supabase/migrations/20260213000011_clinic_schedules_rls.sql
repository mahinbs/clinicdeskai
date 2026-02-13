-- RLS Policies for Clinic Schedules and Holidays

-- Enable RLS
ALTER TABLE clinic_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_holidays ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLINIC SCHEDULES RLS
-- ============================================================================

-- Clinic admin can view/manage their clinic's schedule
CREATE POLICY "Clinic admin can manage clinic schedules"
    ON clinic_schedules FOR ALL
    USING (clinic_id = public.get_user_clinic_id() AND public.is_clinic_admin());

-- Doctors and receptionists can view their clinic's schedule
CREATE POLICY "Staff can view clinic schedules"
    ON clinic_schedules FOR SELECT
    USING (clinic_id = public.get_user_clinic_id());

-- ============================================================================
-- CLINIC HOLIDAYS RLS
-- ============================================================================

-- Clinic admin can manage holidays
CREATE POLICY "Clinic admin can manage holidays"
    ON clinic_holidays FOR ALL
    USING (clinic_id = public.get_user_clinic_id() AND public.is_clinic_admin());

-- Staff can view holidays
CREATE POLICY "Staff can view holidays"
    ON clinic_holidays FOR SELECT
    USING (clinic_id = public.get_user_clinic_id());

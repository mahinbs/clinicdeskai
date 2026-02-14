-- Receptionists and doctors need to see other users (e.g. doctors) in their clinic
-- for dropdowns: "Select doctor" on Check In, book appointment, reassign, etc.
-- Without this, getClinicDoctorsWithSettings() returns no rows for receptionist.

CREATE POLICY "Staff can view clinic users for lists"
    ON users FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND (public.is_receptionist() OR public.is_doctor())
    );

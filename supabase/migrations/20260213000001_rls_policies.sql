-- ClinicDesk AI - Row Level Security Policies
-- Multi-tenant isolation and role-based access control

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Get current user's role (public schema - we cannot create in auth)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Get current user's clinic_id
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID AS $$
    SELECT clinic_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if current user is master admin
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'master_admin' AND status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if current user is clinic admin
CREATE OR REPLACE FUNCTION public.is_clinic_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'clinic_admin' AND status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if current user is doctor
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'doctor' AND status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if current user is receptionist
CREATE OR REPLACE FUNCTION public.is_receptionist()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'receptionist' AND status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if user's clinic is active
CREATE OR REPLACE FUNCTION public.is_clinic_active()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.clinics c ON u.clinic_id = c.id
        WHERE u.id = auth.uid() AND c.status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if user is active and belongs to active clinic
CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users u
        LEFT JOIN public.clinics c ON u.clinic_id = c.id
        WHERE u.id = auth.uid() 
        AND u.status = 'active'
        AND (u.role = 'master_admin' OR c.status = 'active')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- CLINICS TABLE RLS POLICIES
-- ============================================================================

-- Master admin can see all clinics
CREATE POLICY "Master admin can view all clinics"
    ON clinics FOR SELECT
    USING (public.is_master_admin());

-- Master admin can insert clinics
CREATE POLICY "Master admin can insert clinics"
    ON clinics FOR INSERT
    WITH CHECK (public.is_master_admin());

-- Master admin can update clinics
CREATE POLICY "Master admin can update clinics"
    ON clinics FOR UPDATE
    USING (public.is_master_admin())
    WITH CHECK (public.is_master_admin());

-- Clinic admin can view their own clinic
CREATE POLICY "Clinic admin can view own clinic"
    ON clinics FOR SELECT
    USING (id = public.get_user_clinic_id() AND public.is_user_active());

-- Doctors and receptionists can view their clinic
CREATE POLICY "Staff can view own clinic"
    ON clinics FOR SELECT
    USING (id = public.get_user_clinic_id() AND public.is_user_active());

-- ============================================================================
-- USERS TABLE RLS POLICIES
-- ============================================================================

-- Master admin can view all users
CREATE POLICY "Master admin can view all users"
    ON users FOR SELECT
    USING (public.is_master_admin());

-- Master admin can create clinic admins
CREATE POLICY "Master admin can create clinic admins"
    ON users FOR INSERT
    WITH CHECK (
        public.is_master_admin() 
        AND role = 'clinic_admin'
    );

-- Master admin can update users
CREATE POLICY "Master admin can update users"
    ON users FOR UPDATE
    USING (public.is_master_admin());

-- Clinic admin can view users in their clinic
CREATE POLICY "Clinic admin can view own clinic users"
    ON users FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id() 
        AND public.is_clinic_admin()
        AND public.is_user_active()
    );

-- Clinic admin can create doctors and receptionists in their clinic
CREATE POLICY "Clinic admin can create staff"
    ON users FOR INSERT
    WITH CHECK (
        public.is_clinic_admin()
        AND clinic_id = public.get_user_clinic_id()
        AND role IN ('doctor', 'receptionist')
        AND public.is_user_active()
    );

-- Clinic admin can update doctors and receptionists in their clinic
CREATE POLICY "Clinic admin can update staff"
    ON users FOR UPDATE
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_clinic_admin()
        AND role IN ('doctor', 'receptionist')
        AND public.is_user_active()
    );

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (id = auth.uid() AND public.is_user_active());

-- Users can update their own profile (limited fields enforced by app/trigger)
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (id = auth.uid() AND public.is_user_active())
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- PATIENTS TABLE RLS POLICIES
-- ============================================================================

-- Patients are isolated by clinic_id
CREATE POLICY "Users can view patients in their clinic"
    ON patients FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_user_active()
    );

-- Clinic admin and receptionist can create patients
CREATE POLICY "Clinic admin and receptionist can create patients"
    ON patients FOR INSERT
    WITH CHECK (
        clinic_id = public.get_user_clinic_id()
        AND (public.is_clinic_admin() OR public.is_receptionist())
        AND public.is_user_active()
    );

-- Clinic admin and receptionist can update patients
CREATE POLICY "Clinic admin and receptionist can update patients"
    ON patients FOR UPDATE
    USING (
        clinic_id = public.get_user_clinic_id()
        AND (public.is_clinic_admin() OR public.is_receptionist())
        AND public.is_user_active()
    );

-- ============================================================================
-- APPOINTMENTS TABLE RLS POLICIES
-- ============================================================================

-- All staff can view appointments in their clinic
CREATE POLICY "Staff can view clinic appointments"
    ON appointments FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_user_active()
    );

-- Receptionist can create appointments
CREATE POLICY "Receptionist can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        clinic_id = public.get_user_clinic_id()
        AND public.is_receptionist()
        AND public.is_user_active()
    );

-- Receptionist can update appointments
CREATE POLICY "Receptionist can update appointments"
    ON appointments FOR UPDATE
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_receptionist()
        AND public.is_user_active()
    );

-- Doctors can update their own appointments
CREATE POLICY "Doctors can update own appointments"
    ON appointments FOR UPDATE
    USING (
        clinic_id = public.get_user_clinic_id()
        AND doctor_id = auth.uid()
        AND public.is_doctor()
        AND public.is_user_active()
    )
    WITH CHECK (doctor_id = auth.uid());

-- ============================================================================
-- PRESCRIPTIONS TABLE RLS POLICIES
-- ============================================================================

-- Doctors can view all prescriptions in their clinic
CREATE POLICY "Doctors can view clinic prescriptions"
    ON prescriptions FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_doctor()
        AND public.is_user_active()
    );

-- Doctors can create prescriptions
CREATE POLICY "Doctors can create prescriptions"
    ON prescriptions FOR INSERT
    WITH CHECK (
        clinic_id = public.get_user_clinic_id()
        AND doctor_id = auth.uid()
        AND public.is_doctor()
        AND public.is_user_active()
    );

-- Doctors can update their own prescriptions
CREATE POLICY "Doctors can update own prescriptions"
    ON prescriptions FOR UPDATE
    USING (
        clinic_id = public.get_user_clinic_id()
        AND doctor_id = auth.uid()
        AND public.is_doctor()
        AND public.is_user_active()
    );

-- Clinic admin can view all prescriptions
CREATE POLICY "Clinic admin can view prescriptions"
    ON prescriptions FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_clinic_admin()
        AND public.is_user_active()
    );

-- ============================================================================
-- BILLING TABLE RLS POLICIES
-- ============================================================================

-- Receptionist can view, create, and update billing
CREATE POLICY "Receptionist can manage billing"
    ON billing FOR ALL
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_receptionist()
        AND public.is_user_active()
    )
    WITH CHECK (
        clinic_id = public.get_user_clinic_id()
        AND public.is_receptionist()
        AND public.is_user_active()
    );

-- Clinic admin can view all billing in their clinic
CREATE POLICY "Clinic admin can view billing"
    ON billing FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_clinic_admin()
        AND public.is_user_active()
    );

-- Doctors can view billing for their appointments
CREATE POLICY "Doctors can view own appointment billing"
    ON billing FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = billing.appointment_id
            AND a.doctor_id = auth.uid()
        )
        AND public.is_doctor()
        AND public.is_user_active()
    );

-- ============================================================================
-- DOCTOR SCHEDULES TABLE RLS POLICIES
-- ============================================================================

-- Doctors can view and manage their own schedules
CREATE POLICY "Doctors can manage own schedules"
    ON doctor_schedules FOR ALL
    USING (
        clinic_id = public.get_user_clinic_id()
        AND doctor_id = auth.uid()
        AND public.is_doctor()
        AND public.is_user_active()
    )
    WITH CHECK (
        clinic_id = public.get_user_clinic_id()
        AND doctor_id = auth.uid()
        AND public.is_doctor()
        AND public.is_user_active()
    );

-- Receptionist can view all doctor schedules
CREATE POLICY "Receptionist can view schedules"
    ON doctor_schedules FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_receptionist()
        AND public.is_user_active()
    );

-- Clinic admin can view all schedules
CREATE POLICY "Clinic admin can view schedules"
    ON doctor_schedules FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_clinic_admin()
        AND public.is_user_active()
    );

-- ============================================================================
-- PATIENT REPORTS TABLE RLS POLICIES
-- ============================================================================

-- All clinic staff can view patient reports
CREATE POLICY "Staff can view patient reports"
    ON patient_reports FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_user_active()
    );

-- Doctors and receptionists can upload reports
CREATE POLICY "Staff can upload patient reports"
    ON patient_reports FOR INSERT
    WITH CHECK (
        clinic_id = public.get_user_clinic_id()
        AND (public.is_doctor() OR public.is_receptionist())
        AND public.is_user_active()
    );

-- ============================================================================
-- AUDIT LOGS TABLE RLS POLICIES
-- ============================================================================

-- Master admin can view all audit logs
CREATE POLICY "Master admin can view all audit logs"
    ON audit_logs FOR SELECT
    USING (public.is_master_admin());

-- Clinic admin can view their clinic's audit logs
CREATE POLICY "Clinic admin can view clinic audit logs"
    ON audit_logs FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_clinic_admin()
        AND public.is_user_active()
    );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- NOTIFICATION QUEUE TABLE RLS POLICIES
-- ============================================================================

-- Only service role can manage notification queue
CREATE POLICY "Service role can manage notifications"
    ON notification_queue FOR ALL
    USING (auth.role() = 'service_role');

-- Clinic admin can view their clinic's notifications
CREATE POLICY "Clinic admin can view notifications"
    ON notification_queue FOR SELECT
    USING (
        clinic_id = public.get_user_clinic_id()
        AND public.is_clinic_admin()
        AND public.is_user_active()
    );

-- ============================================================================
-- SECURITY DEFINER FUNCTIONS FOR COMPLEX OPERATIONS
-- ============================================================================

-- Function to check if user can access the system (not suspended)
CREATE OR REPLACE FUNCTION check_user_access()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_status user_status;
    v_clinic_status clinic_status;
    v_user_role user_role;
BEGIN
    -- Get user details
    SELECT u.status, u.role, c.status
    INTO v_user_status, v_user_role, v_clinic_status
    FROM users u
    LEFT JOIN clinics c ON u.clinic_id = c.id
    WHERE u.id = auth.uid();

    -- If user not found, deny access
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Check user status
    IF v_user_status != 'active' THEN
        RETURN FALSE;
    END IF;

    -- Check clinic status (except for master admin)
    IF v_user_role != 'master_admin' AND v_clinic_status != 'active' THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION public.is_user_active IS 'Check if user is active and belongs to active clinic';
COMMENT ON FUNCTION check_user_access IS 'Comprehensive check for user access including suspension logic';
